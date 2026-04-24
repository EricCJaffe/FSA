import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const assetClass = searchParams.get('assetClass')
  const search = searchParams.get('search')

  let query = supabase
    .from('knowledge_entries')
    .select('*')
    .eq('org_id', role.org_id)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  if (assetClass) {
    query = query.eq('asset_class', assetClass)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data: entries } = await query.limit(100)

  return NextResponse.json({ entries: entries ?? [] })
}

export async function POST(request: NextRequest) {
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

  const body = await request.json()
  if (!body.title || !body.content || !body.category) {
    return NextResponse.json(
      { error: 'title, content, and category are required' },
      { status: 400 }
    )
  }

  const admin = getAdmin()

  const { data: entry, error } = await admin
    .from('knowledge_entries')
    .insert({
      org_id: role.org_id,
      category: body.category,
      asset_class: body.assetClass || 'real_estate',
      title: body.title,
      content: body.content,
      tags: body.tags || [],
      property_id: body.propertyId || null,
      source: 'manual',
      confidence: body.confidence || 'medium',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: body.validUntil || null,
      metadata: body.metadata || {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, entry })
}
