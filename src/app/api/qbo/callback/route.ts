import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const INTUIT_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'

/**
 * GET /api/qbo/callback
 * Handles the OAuth 2.0 callback from Intuit.
 * Exchanges the authorization code for access + refresh tokens,
 * stores them in `qbo_connections`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const realmId = searchParams.get('realmId')
  const error = searchParams.get('error')

  // Check for OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/settings?qbo_error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !realmId) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?qbo_error=missing_params', request.url)
    )
  }

  // Verify CSRF state
  const storedState = request.cookies.get('qbo_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?qbo_error=invalid_state', request.url)
    )
  }

  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Exchange code for tokens
  const clientId = process.env.QBO_CLIENT_ID!
  const clientSecret = process.env.QBO_CLIENT_SECRET!
  const redirectUri = process.env.QBO_REDIRECT_URI!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const tokenRes = await fetch(INTUIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    const body = await tokenRes.text()
    console.error('QBO token exchange failed:', body)
    return NextResponse.redirect(
      new URL('/dashboard/settings?qbo_error=token_exchange_failed', request.url)
    )
  }

  const tokens = await tokenRes.json()
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  // Get user's org
  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!role) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?qbo_error=no_org', request.url)
    )
  }

  // Upsert QBO connection (one per org)
  const { error: upsertError } = await supabase
    .from('qbo_connections')
    .upsert(
      {
        org_id: role.org_id,
        realm_id: realmId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        connected_by: user.id,
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'org_id' }
    )

  if (upsertError) {
    console.error('Failed to store QBO connection:', upsertError)
    return NextResponse.redirect(
      new URL('/dashboard/settings?qbo_error=storage_failed', request.url)
    )
  }

  // Clear CSRF cookie and redirect to settings
  const response = NextResponse.redirect(
    new URL('/dashboard/settings?qbo_connected=true', request.url)
  )
  response.cookies.delete('qbo_oauth_state')

  return response
}
