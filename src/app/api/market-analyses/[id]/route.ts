import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

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
    .from('market_analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !analysis) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch associated knowledge entries
  const { data: knowledgeEntries } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('market_analysis_id', id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ analysis, knowledgeEntries: knowledgeEntries ?? [] })
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
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const admin = getAdmin()

  // Delete associated knowledge entries first
  await admin
    .from('knowledge_entries')
    .delete()
    .eq('market_analysis_id', id)

  const { error } = await admin
    .from('market_analyses')
    .delete()
    .eq('id', id)
    .eq('org_id', role.org_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
