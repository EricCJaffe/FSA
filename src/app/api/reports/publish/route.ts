import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/reports/publish
 * Toggle publish status of a report.
 * Body: { reportId: string, published: boolean }
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
  const { reportId, published } = body

  if (!reportId || typeof published !== 'boolean') {
    return NextResponse.json({ error: 'reportId and published (boolean) are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('monthly_reports')
    .update({
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .eq('id', reportId)
    .eq('org_id', role.org_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, published })
}
