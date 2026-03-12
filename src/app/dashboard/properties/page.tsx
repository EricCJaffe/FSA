import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Building2, Home, Palmtree, MapPin } from 'lucide-react'
import type { Property } from '@/types'

function formatCurrency(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function PropertiesPage() {
  const supabase = await createClient()

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('active', true)
    .order('name')

  const items = (properties ?? []) as Property[]

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'property' : 'properties'} in portfolio
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add property
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-6">
          {error.message}
        </div>
      )}

      {/* Property list */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <Building2 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">No properties yet</p>
          <p className="mt-1 text-sm text-gray-500">Add your first property to get started.</p>
          <Link
            href="/dashboard/properties/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add property
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((property) => (
            <Link
              key={property.id}
              href={`/dashboard/properties/${property.id}`}
              className="block rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm hover:border-gray-300 hover:shadow transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-lg p-2.5 ${
                      property.property_type === 'str'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {property.property_type === 'str' ? (
                      <Palmtree className="h-5 w-5" />
                    ) : (
                      <Home className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{property.name}</h2>
                    {property.address && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {[property.address, property.city, property.state, property.zip]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="text-sm font-medium text-gray-700">
                      {property.property_type === 'ltr' ? 'Long-term' : 'Short-term'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Market value</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatCurrency(property.current_market_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Mortgage</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatCurrency(property.mortgage_balance)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
