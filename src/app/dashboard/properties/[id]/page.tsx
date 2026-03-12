import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Property } from '@/types'
import {
  ArrowLeft,
  Pencil,
  Home,
  Palmtree,
  MapPin,
  Calendar,
  DollarSign,
  Percent,
  TrendingUp,
  CreditCard,
  FileText,
} from 'lucide-react'

function fmt(value: number | null, style: 'currency' | 'percent' | 'decimal' = 'currency') {
  if (value == null) return '—'
  if (style === 'currency')
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  if (style === 'percent')
    return `${(value * 100).toFixed(2)}%`
  return value.toLocaleString()
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-gray-50 p-2 text-gray-400">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default async function PropertyDetailPage({
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

  const property = data as Property

  const equity =
    property.current_market_value != null && property.mortgage_balance != null
      ? property.current_market_value - property.mortgage_balance
      : null

  return (
    <div className="p-8 max-w-4xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Properties
        </Link>
        <Link
          href={`/dashboard/properties/${property.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-6 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div
            className={`rounded-lg p-3 ${
              property.property_type === 'str'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            {property.property_type === 'str' ? (
              <Palmtree className="h-6 w-6" />
            ) : (
              <Home className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{property.name}</h1>
            {property.address && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {[property.address, property.city, property.state, property.zip]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  property.property_type === 'str'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {property.property_type === 'ltr' ? 'Long-term rental' : 'Short-term rental'}
              </span>
              {property.ownership_pct != null && (
                <span className="text-xs text-gray-400">
                  {(property.ownership_pct * 100).toFixed(0)}% ownership
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
        {/* Purchase & Valuation */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Purchase & valuation
          </h2>
          <div className="space-y-4">
            <Stat label="Purchase price" value={fmt(property.purchase_price)} icon={DollarSign} />
            <Stat
              label="Purchase date"
              value={property.purchase_date
                ? new Date(property.purchase_date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
              icon={Calendar}
            />
            <Stat label="Current market value" value={fmt(property.current_market_value)} icon={TrendingUp} />
            {equity != null && (
              <Stat label="Estimated equity" value={fmt(equity)} icon={TrendingUp} />
            )}
          </div>
        </div>

        {/* Mortgage */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Mortgage
          </h2>
          <div className="space-y-4">
            <Stat label="Balance" value={fmt(property.mortgage_balance)} icon={CreditCard} />
            <Stat label="Rate" value={property.mortgage_rate != null ? fmt(property.mortgage_rate, 'percent') : '—'} icon={Percent} />
            <Stat label="Monthly payment" value={fmt(property.mortgage_payment)} icon={DollarSign} />
          </div>
        </div>
      </div>

      {/* QBO + Notes */}
      {(property.qbo_class_name || property.notes) && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Details
          </h2>
          <div className="space-y-4">
            {property.qbo_class_name && (
              <Stat label="QuickBooks class" value={property.qbo_class_name} icon={FileText} />
            )}
            {property.notes && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
