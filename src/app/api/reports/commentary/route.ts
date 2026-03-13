import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/reports/commentary
 * Save commentary/annotations on a report.
 * Stores in summary_json.commentary to avoid schema changes.
 * Body: { reportId: string, commentary: string | null }
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
  const { reportId, commentary } = body

  if (!reportId) {
    return NextResponse.json({ error: 'reportId is required' }, { status: 400 })
  }

  // Fetch current report to get existing summary_json
  const { data: report, error: fetchError } = await supabase
    .from('monthly_reports')
    .select('summary_json')
    .eq('id', reportId)
    .eq('org_id', role.org_id)
    .single()

  if (fetchError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  // Merge commentary into summary_json
  const summaryJson = (report.summary_json as Record<string, unknown>) ?? {}
  summaryJson.commentary = commentary || null
  summaryJson.commentaryUpdatedAt = commentary ? new Date().toISOString() : null
  summaryJson.commentaryUpdatedBy = commentary ? user.email : null

  const { error: updateError } = await supabase
    .from('monthly_reports')
    .update({ summary_json: summaryJson })
    .eq('id', reportId)
    .eq('org_id', role.org_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
