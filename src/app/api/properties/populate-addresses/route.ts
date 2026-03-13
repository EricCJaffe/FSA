import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/properties/populate-addresses
 * Fills in missing address fields using the property name as street address
 * and Jacksonville, FL defaults. Only updates properties that don't already
 * have address data populated.
 */
export async function POST() {
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

  // Fetch all active properties for the org
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, name, address, city, state, zip')
    .eq('org_id', role.org_id)
    .eq('active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let updated = 0
  let skipped = 0

  for (const p of properties ?? []) {
    // Skip if address is already filled in
    if (p.address && p.city && p.state) {
      skipped++
      continue
    }

    const updates: Record<string, string> = {}
    if (!p.address) updates.address = p.name // property name is typically the street address
    if (!p.city) updates.city = 'Jacksonville'
    if (!p.state) updates.state = 'FL'
    if (!p.zip) updates.zip = '32200' // placeholder

    const { error: updateError } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', p.id)

    if (!updateError) updated++
  }

  return NextResponse.json({
    success: true,
    updated,
    skipped,
    total: (properties ?? []).length,
    message: updated > 0
      ? `Updated ${updated} properties with default Jacksonville addresses. Update ZIP codes via property edit forms.`
      : 'All properties already have addresses populated.',
  })
}
