import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PropertyForm from '@/components/property/PropertyForm'
import type { Property } from '@/types'

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  return (
    <div className="p-8">
      <PropertyForm property={data as Property} />
    </div>
  )
}
