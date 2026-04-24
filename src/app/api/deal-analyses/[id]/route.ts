import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: analysis, error } = await supabase
    .from('deal_analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !analysis) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ analysis })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (
    !role ||
    (role.role !== 'family_office_admin' && role.role !== 'org_admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  const body = await request.json()

  // Only allow updating notes and outcome
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.userNotes !== undefined) updates.user_notes = body.userNotes
  if (body.outcome !== undefined) updates.outcome = body.outcome
  if (body.outcomeNotes !== undefined) updates.outcome_notes = body.outcomeNotes

  const { data: analysis, error } = await supabase
    .from('deal_analyses')
    .update(updates)
    .eq('id', id)
    .eq('org_id', role.org_id)
    .select()
    .single()

  if (error || !analysis) {
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, analysis })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (
    !role ||
    (role.role !== 'family_office_admin' && role.role !== 'org_admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  const { error } = await supabase
    .from('deal_analyses')
    .delete()
    .eq('id', id)
    .eq('org_id', role.org_id)

  if (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
