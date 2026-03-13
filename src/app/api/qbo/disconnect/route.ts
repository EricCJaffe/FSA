import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/qbo/disconnect
 * Removes a QBO connection.
 * Body: { connectionId: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!role || (role.role !== 'family_office_admin' && role.role !== 'org_admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await request.json()
  const { connectionId } = body

  if (!connectionId) {
    return NextResponse.json({ error: 'connectionId is required' }, { status: 400 })
  }

  // Delete the connection (only if it belongs to the user's org)
  const { error, count } = await supabase
    .from('qbo_connections')
    .delete()
    .eq('id', connectionId)
    .eq('org_id', role.org_id)

  if (error) {
    console.error('Failed to disconnect QBO:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
