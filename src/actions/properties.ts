'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Property } from '@/types'

export type PropertyFormData = {
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  property_type: 'ltr' | 'str'
  purchase_price?: number | null
  purchase_date?: string | null
  current_market_value?: number | null
  ownership_pct?: number | null
  mortgage_balance?: number | null
  mortgage_rate?: number | null
  mortgage_payment?: number | null
  qbo_class_id?: string | null
  qbo_class_name?: string | null
  notes?: string | null
}

type ActionResult =
  | { success: true; property: Property }
  | { success: false; error: string }

async function getUserOrgId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return role?.org_id ?? null
}

export async function createProperty(formData: PropertyFormData): Promise<ActionResult> {
  const supabase = await createClient()
  const orgId = await getUserOrgId()
  if (!orgId) return { success: false, error: 'No organization found' }

  const { data, error } = await supabase
    .from('properties')
    .insert({ ...formData, org_id: orgId })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/properties')
  return { success: true, property: data as Property }
}

export async function updateProperty(
  id: string,
  formData: Partial<PropertyFormData>
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/properties')
  revalidatePath(`/dashboard/properties/${id}`)
  return { success: true, property: data as Property }
}

export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('properties')
    .update({ active: false })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/properties')
  return { success: true }
}
