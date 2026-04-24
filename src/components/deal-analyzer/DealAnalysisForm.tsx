'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface FormState {
  propertyName: string
  propertyAddress: string
  propertyType: string
  yearBuilt: string
  beds: string
  baths: string
  sqft: string
  county: string
  mlsNumber: string
  listPrice: string
  allInCost: string
  monthlyRent: string
  hoaMonthly: string
  annualTaxes: string
  annualInsurance: string
  managementPct: string
  annualRepairs: string
  vacancyPct: string
}

const INITIAL: FormState = {
  propertyName: '',
  propertyAddress: '',
  propertyType: 'sfh',
  yearBuilt: '',
  beds: '',
  baths: '',
  sqft: '',
  county: '',
  mlsNumber: '',
  listPrice: '',
  allInCost: '',
  monthlyRent: '',
  hoaMonthly: '0',
  annualTaxes: '',
  annualInsurance: '',
  managementPct: '8',
  annualRepairs: '',
  vacancyPct: '5',
}

function parseNum(val: string): number | null {
  if (!val.trim()) return null
  const num = parseFloat(val.replace(/,/g, ''))
  return isNaN(num) ? null : num
}

export default function DealAnalysisForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setAnalyzing(true)

    try {
      const payload = {
        propertyName: form.propertyName,
        propertyAddress: form.propertyAddress,
        propertyType: form.propertyType,
        yearBuilt: parseNum(form.yearBuilt),
        beds: parseNum(form.beds),
        baths: parseNum(form.baths),
        sqft: parseNum(form.sqft),
        county: form.county || null,
        mlsNumber: form.mlsNumber || null,
        listPrice: parseNum(form.listPrice) || parseNum(form.allInCost),
        allInCost: parseNum(form.allInCost),
        monthlyRent: parseNum(form.monthlyRent),
        hoaMonthly: parseNum(form.hoaMonthly) ?? 0,
        annualTaxes: parseNum(form.annualTaxes),
        annualInsurance: parseNum(form.annualInsurance),
        managementPct: (parseNum(form.managementPct) ?? 8) / 100,
        annualRepairs: parseNum(form.annualRepairs),
        vacancyPct: (parseNum(form.vacancyPct) ?? 5) / 100,
      }

      const res = await fetch('/api/deal-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')

      router.push(`/dashboard/deal-analyzer/${data.analysis.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setAnalyzing(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'
  const hintClass = 'text-[11px] text-gray-400 mt-1'

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/dashboard/deal-analyzer"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Deal Analyzer
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg p-3 bg-blue-50 text-blue-600">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Deal Analysis</h1>
          <p className="text-sm text-gray-500">
            Enter property details to evaluate acquisition economics
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Basics */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Property Basics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Property Name *</label>
              <input
                className={inputClass}
                value={form.propertyName}
                onChange={(e) => update('propertyName', e.target.value)}
                placeholder="e.g. 504 Kettering Way"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Full Address *</label>
              <input
                className={inputClass}
                value={form.propertyAddress}
                onChange={(e) => update('propertyAddress', e.target.value)}
                placeholder="e.g. 504 Kettering Way, Orange Park FL 32073"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Property Type *</label>
              <select
                className={inputClass}
                value={form.propertyType}
                onChange={(e) => update('propertyType', e.target.value)}
              >
                <option value="sfh">Single Family Home</option>
                <option value="townhouse">Townhouse</option>
                <option value="condo">Condo</option>
                <option value="duplex">Duplex</option>
                <option value="multifamily">Multifamily</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>County</label>
              <input
                className={inputClass}
                value={form.county}
                onChange={(e) => update('county', e.target.value)}
                placeholder="e.g. Clay, Duval"
              />
            </div>
            <div>
              <label className={labelClass}>Year Built</label>
              <input
                className={inputClass}
                type="number"
                value={form.yearBuilt}
                onChange={(e) => update('yearBuilt', e.target.value)}
                placeholder="e.g. 1982"
              />
            </div>
            <div>
              <label className={labelClass}>MLS #</label>
              <input
                className={inputClass}
                value={form.mlsNumber}
                onChange={(e) => update('mlsNumber', e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className={labelClass}>Beds</label>
              <input
                className={inputClass}
                type="number"
                step="0.5"
                value={form.beds}
                onChange={(e) => update('beds', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Baths</label>
              <input
                className={inputClass}
                type="number"
                step="0.5"
                value={form.baths}
                onChange={(e) => update('baths', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Sq Ft</label>
              <input
                className={inputClass}
                type="number"
                value={form.sqft}
                onChange={(e) => update('sqft', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Deal Economics */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Deal Economics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>List Price ($)</label>
              <input
                className={inputClass}
                type="number"
                value={form.listPrice}
                onChange={(e) => update('listPrice', e.target.value)}
                placeholder="Asking price"
              />
            </div>
            <div>
              <label className={labelClass}>All-In Cost ($) *</label>
              <input
                className={inputClass}
                type="number"
                value={form.allInCost}
                onChange={(e) => update('allInCost', e.target.value)}
                placeholder="Purchase + closing + repairs"
                required
              />
              <p className={hintClass}>Total cash outlay including closing costs and immediate repairs</p>
            </div>
            <div>
              <label className={labelClass}>Monthly Rent ($) *</label>
              <input
                className={inputClass}
                type="number"
                value={form.monthlyRent}
                onChange={(e) => update('monthlyRent', e.target.value)}
                placeholder="Projected LTR monthly"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Monthly HOA ($)</label>
              <input
                className={inputClass}
                type="number"
                value={form.hoaMonthly}
                onChange={(e) => update('hoaMonthly', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Operating Expenses
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Leave blank to auto-estimate based on property type and Florida averages.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Annual Taxes ($)</label>
              <input
                className={inputClass}
                type="number"
                value={form.annualTaxes}
                onChange={(e) => update('annualTaxes', e.target.value)}
                placeholder="Auto: 1.1% of all-in cost"
              />
            </div>
            <div>
              <label className={labelClass}>Annual Insurance ($)</label>
              <input
                className={inputClass}
                type="number"
                value={form.annualInsurance}
                onChange={(e) => update('annualInsurance', e.target.value)}
                placeholder="Auto: varies by type"
              />
            </div>
            <div>
              <label className={labelClass}>Management (%)</label>
              <input
                className={inputClass}
                type="number"
                step="0.5"
                value={form.managementPct}
                onChange={(e) => update('managementPct', e.target.value)}
                placeholder="8"
              />
              <p className={hintClass}>Percentage of gross rent</p>
            </div>
            <div>
              <label className={labelClass}>Annual Repairs ($)</label>
              <input
                className={inputClass}
                type="number"
                value={form.annualRepairs}
                onChange={(e) => update('annualRepairs', e.target.value)}
                placeholder="Auto: $800-$1,500"
              />
            </div>
            <div>
              <label className={labelClass}>Vacancy (%)</label>
              <input
                className={inputClass}
                type="number"
                step="0.5"
                value={form.vacancyPct}
                onChange={(e) => update('vacancyPct', e.target.value)}
                placeholder="5"
              />
              <p className={hintClass}>Percentage of annual rent lost to vacancy</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calculator className="h-4 w-4" />
          {analyzing ? 'Analyzing...' : 'Analyze Deal'}
        </button>
      </form>
    </div>
  )
}
