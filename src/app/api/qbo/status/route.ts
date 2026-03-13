import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/qbo/status
 * Returns QBO connection status and recent sync history for the user's org.
 * Supports multiple QBO connections per org.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!role) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 })
  }

  // Get all connections
  const { data: connections } = await supabase
    .from('qbo_connections')
    .select('id, realm_id, company_name, connected_at, token_expires_at')
    .eq('org_id', role.org_id)
    .order('connected_at', { ascending: false })

  // Get recent syncs
  const { data: syncs } = await supabase
    .from('qbo_sync_records')
    .select('id, status, sync_type, period_start, period_end, records_synced, error_message, started_at, completed_at')
    .eq('org_id', role.org_id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    connected: (connections ?? []).length > 0,
    connections: (connections ?? []).map((c) => ({
      id: c.id,
      realmId: c.realm_id,
      companyName: c.company_name,
      connectedAt: c.connected_at,
      tokenExpiresAt: c.token_expires_at,
    })),
    syncs: syncs ?? [],
  })
}
