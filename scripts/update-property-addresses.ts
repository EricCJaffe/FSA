/**
 * Update property addresses.
 *
 * Usage: npx tsx scripts/update-property-addresses.ts
 *
 * This script reads all properties and updates their address fields
 * based on the property name (which is typically the street address
 * from the QBO class name). It also fills in city/state/zip for
 * Jacksonville, FL properties.
 *
 * Only updates properties that don't already have address populated.
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(url, key)

// Map property names to full address details.
// Update these with actual addresses for your properties.
const ADDRESS_MAP: Record<string, { address: string; city: string; state: string; zip: string }> = {
  // Add entries like:
  // 'QBO Class Name': { address: '123 Main St', city: 'Jacksonville', state: 'FL', zip: '32207' },
}

async function main() {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, name, address, city, state, zip, qbo_class_name')
    .eq('active', true)
    .order('name')

  if (error) {
    console.error('Failed to fetch properties:', error)
    process.exit(1)
  }

  console.log(`Found ${properties.length} properties:\n`)

  for (const p of properties) {
    const hasAddress = p.address && p.city && p.state && p.zip
    console.log(
      `  ${hasAddress ? '✓' : '○'} ${p.name}`,
      hasAddress ? `(${p.address}, ${p.city}, ${p.state} ${p.zip})` : '— no address'
    )

    // Check if we have a mapping for this property
    const mapping = ADDRESS_MAP[p.name] || ADDRESS_MAP[p.qbo_class_name]
    if (mapping && !hasAddress) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(mapping)
        .eq('id', p.id)

      if (updateError) {
        console.log(`    ✗ Failed to update: ${updateError.message}`)
      } else {
        console.log(`    ✓ Updated to: ${mapping.address}, ${mapping.city}, ${mapping.state} ${mapping.zip}`)
      }
    }

    // If no mapping but no address, use property name as street address
    // and default to Jacksonville, FL
    if (!mapping && !hasAddress) {
      const defaultUpdate = {
        address: p.name, // property name is usually the street address
        city: 'Jacksonville',
        state: 'FL',
        zip: '32200', // placeholder — update with real zips
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update(defaultUpdate)
        .eq('id', p.id)

      if (updateError) {
        console.log(`    ✗ Failed to update: ${updateError.message}`)
      } else {
        console.log(`    ✓ Set default: ${defaultUpdate.address}, ${defaultUpdate.city}, ${defaultUpdate.state} ${defaultUpdate.zip}`)
        console.log(`    ⚠ ZIP code is placeholder (32200) — update in the app`)
      }
    }
  }

  console.log('\nDone. Update ZIP codes via the property edit forms in the app.')
}

main()
