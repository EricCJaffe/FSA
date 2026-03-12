import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/qbo/status
 * Returns QBO connection status and recent sync history for the user's org.
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

  // Get connection
  const { data: connection } = await supabase
    .from('qbo_connections')
    .select('id, realm_id, connected_at, token_expires_at')
    .eq('org_id', role.org_id)
    .single()

  // Get recent syncs
  const { data: syncs } = await supabase
    .from('qbo_sync_records')
    .select('id, status, sync_type, period_start, period_end, records_synced, error_message, started_at, completed_at')
    .eq('org_id', role.org_id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    connected: !!connection,
    connection: connection
      ? {
          realmId: connection.realm_id,
          connectedAt: connection.connected_at,
          tokenExpiresAt: connection.token_expires_at,
        }
      : null,
    syncs: syncs ?? [],
  })
}
