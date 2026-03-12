/**
 * QuickBooks Online API client.
 *
 * Handles authenticated requests to the QBO REST API,
 * including automatic token refresh when access tokens expire.
 */

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const QBO_BASE_URL = process.env.QBO_ENVIRONMENT === 'production'
  ? 'https://quickbooks.api.intuit.com'
  : 'https://sandbox-quickbooks.api.intuit.com'

const INTUIT_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'

interface QboTokens {
  access_token: string
  refresh_token: string
  token_expires_at: string
  realm_id: string
}

interface QboConnection {
  id: string
  org_id: string
  realm_id: string
  access_token: string
  refresh_token: string
  token_expires_at: string
}

/**
 * Get a Supabase admin client (service role) for server-side token operations.
 * Falls back to anon key if service role not available.
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseAdmin(url, key)
}

/**
 * Refresh QBO access token using the refresh token.
 */
async function refreshTokens(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const clientId = process.env.QBO_CLIENT_ID!
  const clientSecret = process.env.QBO_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(INTUIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Token refresh failed (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Get valid QBO tokens for an org, refreshing if expired.
 */
export async function getQboTokens(orgId: string): Promise<QboTokens | null> {
  const supabase = getAdminClient()

  const { data: conn, error } = await supabase
    .from('qbo_connections')
    .select('*')
    .eq('org_id', orgId)
    .single()

  if (error || !conn) return null

  const connection = conn as QboConnection
  const expiresAt = new Date(connection.token_expires_at)
  const now = new Date()

  // Refresh if token expires within 5 minutes
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    try {
      const refreshed = await refreshTokens(connection.refresh_token)
      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

      await supabase
        .from('qbo_connections')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          token_expires_at: newExpiresAt,
        })
        .eq('id', connection.id)

      return {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        token_expires_at: newExpiresAt,
        realm_id: connection.realm_id,
      }
    } catch (err) {
      console.error('QBO token refresh failed:', err)
      return null
    }
  }

  return {
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
    token_expires_at: connection.token_expires_at,
    realm_id: connection.realm_id,
  }
}

/**
 * Make an authenticated GET request to the QBO API.
 */
export async function qboGet<T = unknown>(
  orgId: string,
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const tokens = await getQboTokens(orgId)
  if (!tokens) throw new Error('No QBO connection found or tokens expired')

  const url = new URL(`/v3/company/${tokens.realm_id}${path}`, QBO_BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`QBO API error (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Query QBO entities using the QBO query language.
 */
export async function qboQuery<T = unknown>(
  orgId: string,
  query: string
): Promise<T> {
  return qboGet(orgId, '/query', { query })
}
