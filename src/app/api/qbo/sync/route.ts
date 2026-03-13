import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runFullSync } from '@/lib/qbo/sync'

// Allow up to 60s for QBO API calls
export const maxDuration = 60

/**
 * POST /api/qbo/sync
 * Triggers a full QBO sync for the user's org.
 * Body: { startDate: string, endDate: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's org
  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!role) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 })
  }

  // Only admins can trigger sync
  if (role.role !== 'family_office_admin' && role.role !== 'org_admin') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Check QBO connection exists
  const { data: connection } = await supabase
    .from('qbo_connections')
    .select('id')
    .eq('org_id', role.org_id)
    .single()

  if (!connection) {
    return NextResponse.json(
      { error: 'QuickBooks is not connected. Connect it in Settings first.' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { startDate, endDate } = body

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'startDate and endDate are required' },
      { status: 400 }
    )
  }

  try {
    const result = await runFullSync(role.org_id, user.id, startDate, endDate)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('QBO sync failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
