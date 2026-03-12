'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProperty, updateProperty, type PropertyFormData } from '@/actions/properties'
import type { Property } from '@/types'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  property?: Property
}

export default function PropertyForm({ property }: Props) {
  const router = useRouter()
  const isEdit = !!property

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<PropertyFormData>({
    name: property?.name ?? '',
    address: property?.address ?? '',
    city: property?.city ?? '',
    state: property?.state ?? '',
    zip: property?.zip ?? '',
    property_type: property?.property_type ?? 'ltr',
    purchase_price: property?.purchase_price ?? null,
    purchase_date: property?.purchase_date ?? null,
    current_market_value: property?.current_market_value ?? null,
    ownership_pct: property?.ownership_pct != null ? property.ownership_pct * 100 : 100,
    mortgage_balance: property?.mortgage_balance ?? null,
    mortgage_rate: property?.mortgage_rate != null ? property.mortgage_rate * 100 : null,
    mortgage_payment: property?.mortgage_payment ?? null,
    qbo_class_id: property?.qbo_class_id ?? null,
    qbo_class_name: property?.qbo_class_name ?? null,
    notes: property?.notes ?? null,
  })

  function updateField(field: keyof PropertyFormData, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function parseNumber(val: string): number | null {
    if (!val.trim()) return null
    const num = parseFloat(val.replace(/,/g, ''))
    return isNaN(num) ? null : num
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload: PropertyFormData = {
      ...form,
      ownership_pct: form.ownership_pct != null ? form.ownership_pct / 100 : null,
      mortgage_rate: form.mortgage_rate != null ? form.mortgage_rate / 100 : null,
    }

    const result = isEdit
      ? await updateProperty(property.id, payload)
      : await createProperty(payload)

    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }

    router.push(`/dashboard/properties/${result.property.id}`)
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {/* Back link + title */}
      <div className="mb-6">
        <Link
          href={isEdit ? `/dashboard/properties/${property.id}` : '/dashboard/properties'}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEdit ? 'Back to property' : 'Back to properties'}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit property' : 'Add property'}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* Basic info */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className={labelClass}>Property name *</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={inputClass}
              placeholder="e.g. 123 Main Street"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address" className={labelClass}>Street address</label>
            <input
              id="address"
              value={form.address ?? ''}
              onChange={(e) => updateField('address', e.target.value)}
              className={inputClass}
              placeholder="123 Main St"
            />
          </div>

          <div>
            <label htmlFor="city" className={labelClass}>City</label>
            <input
              id="city"
              value={form.city ?? ''}
              onChange={(e) => updateField('city', e.target.value)}
              className={inputClass}
              placeholder="Jacksonville"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className={labelClass}>State</label>
              <input
                id="state"
                value={form.state ?? ''}
                onChange={(e) => updateField('state', e.target.value)}
                className={inputClass}
                placeholder="FL"
              />
            </div>
            <div>
              <label htmlFor="zip" className={labelClass}>ZIP</label>
              <input
                id="zip"
                value={form.zip ?? ''}
                onChange={(e) => updateField('zip', e.target.value)}
                className={inputClass}
                placeholder="32207"
              />
            </div>
          </div>

          <div>
            <label htmlFor="property_type" className={labelClass}>Property type *</label>
            <select
              id="property_type"
              value={form.property_type}
              onChange={(e) => updateField('property_type', e.target.value)}
              className={inputClass}
            >
              <option value="ltr">Long-term rental (LTR)</option>
              <option value="str">Short-term rental (STR)</option>
            </select>
          </div>

          <div>
            <label htmlFor="ownership_pct" className={labelClass}>Ownership %</label>
            <input
              id="ownership_pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.ownership_pct ?? ''}
              onChange={(e) => updateField('ownership_pct', parseNumber(e.target.value))}
              className={inputClass}
              placeholder="100"
            />
          </div>
        </div>
      </section>

      {/* Financial */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Purchase & valuation</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="purchase_price" className={labelClass}>Purchase price</label>
            <input
              id="purchase_price"
              type="number"
              step="0.01"
              value={form.purchase_price ?? ''}
              onChange={(e) => updateField('purchase_price', parseNumber(e.target.value))}
              className={inputClass}
              placeholder="250000"
            />
          </div>
          <div>
            <label htmlFor="purchase_date" className={labelClass}>Purchase date</label>
            <input
              id="purchase_date"
              type="date"
              value={form.purchase_date ?? ''}
              onChange={(e) => updateField('purchase_date', e.target.value || null)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="current_market_value" className={labelClass}>Current market value</label>
            <input
              id="current_market_value"
              type="number"
              step="0.01"
              value={form.current_market_value ?? ''}
              onChange={(e) => updateField('current_market_value', parseNumber(e.target.value))}
              className={inputClass}
              placeholder="300000"
            />
          </div>
        </div>
      </section>

      {/* Mortgage */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Mortgage</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="mortgage_balance" className={labelClass}>Balance</label>
            <input
              id="mortgage_balance"
              type="number"
              step="0.01"
              value={form.mortgage_balance ?? ''}
              onChange={(e) => updateField('mortgage_balance', parseNumber(e.target.value))}
              className={inputClass}
              placeholder="180000"
            />
          </div>
          <div>
            <label htmlFor="mortgage_rate" className={labelClass}>Rate (%)</label>
            <input
              id="mortgage_rate"
              type="number"
              step="0.01"
              value={form.mortgage_rate ?? ''}
              onChange={(e) => updateField('mortgage_rate', parseNumber(e.target.value))}
              className={inputClass}
              placeholder="6.5"
            />
          </div>
          <div>
            <label htmlFor="mortgage_payment" className={labelClass}>Monthly payment</label>
            <input
              id="mortgage_payment"
              type="number"
              step="0.01"
              value={form.mortgage_payment ?? ''}
              onChange={(e) => updateField('mortgage_payment', parseNumber(e.target.value))}
              className={inputClass}
              placeholder="1250"
            />
          </div>
        </div>
      </section>

      {/* QBO + Notes */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">QuickBooks & notes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="qbo_class_name" className={labelClass}>QBO class name</label>
            <input
              id="qbo_class_name"
              value={form.qbo_class_name ?? ''}
              onChange={(e) => updateField('qbo_class_name', e.target.value || null)}
              className={inputClass}
              placeholder="e.g. 123 Main St"
            />
          </div>
          <div>
            <label htmlFor="qbo_class_id" className={labelClass}>QBO class ID</label>
            <input
              id="qbo_class_id"
              value={form.qbo_class_id ?? ''}
              onChange={(e) => updateField('qbo_class_id', e.target.value || null)}
              className={inputClass}
              placeholder="Auto-filled after QBO connect"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className={labelClass}>Notes</label>
            <textarea
              id="notes"
              rows={3}
              value={form.notes ?? ''}
              onChange={(e) => updateField('notes', e.target.value || null)}
              className={inputClass}
              placeholder="Any additional notes about this property..."
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add property'}
        </button>
        <Link
          href={isEdit ? `/dashboard/properties/${property.id}` : '/dashboard/properties'}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
