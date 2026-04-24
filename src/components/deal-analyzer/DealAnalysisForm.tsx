'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, ArrowLeft, Search, Check, Loader2 } from 'lucide-react'
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

type Step = 'lookup' | 'review'

export default function DealAnalysisForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [step, setStep] = useState<Step>('lookup')
  const [lookingUp, setLookingUp] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lookupNotes, setLookupNotes] = useState<string | null>(null)
  const [lookupComps, setLookupComps] = useState<string | null>(null)

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLookingUp(true)

    try {
      const res = await fetch('/api/deal-analyses/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: form.propertyAddress,
          propertyType: form.propertyType !== 'sfh' ? form.propertyType : undefined,
          askingPrice: parseNum(form.listPrice),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lookup failed')

      const l = data.lookup
      setForm((prev) => ({
        ...prev,
        propertyName: l.propertyName || prev.propertyAddress.split(',')[0] || prev.propertyName,
        propertyType: l.propertyType || prev.propertyType,
        yearBuilt: l.yearBuilt ? String(l.yearBuilt) : prev.yearBuilt,
        beds: l.beds ? String(l.beds) : prev.beds,
        baths: l.baths ? String(l.baths) : prev.baths,
        sqft: l.sqft ? String(l.sqft) : prev.sqft,
        county: l.county || prev.county,
        allInCost: prev.allInCost || (l.estimatedValue ? String(l.estimatedValue) : ''),
        listPrice: prev.listPrice || (l.estimatedValue ? String(l.estimatedValue) : ''),
        monthlyRent: l.estimatedMonthlyRent ? String(l.estimatedMonthlyRent) : prev.monthlyRent,
        annualTaxes: l.estimatedAnnualTaxes ? String(l.estimatedAnnualTaxes) : prev.annualTaxes,
        annualInsurance: l.estimatedAnnualInsurance ? String(l.estimatedAnnualInsurance) : prev.annualInsurance,
        hoaMonthly: l.estimatedHoaMonthly != null ? String(l.estimatedHoaMonthly) : prev.hoaMonthly,
        annualRepairs: l.estimatedAnnualRepairs ? String(l.estimatedAnnualRepairs) : prev.annualRepairs,
        managementPct: l.managementPct ? String(Math.round(l.managementPct * 100)) : prev.managementPct,
        vacancyPct: l.vacancyPct ? String(Math.round(l.vacancyPct * 100)) : prev.vacancyPct,
      }))

      setLookupNotes(l.notes || null)
      setLookupComps(l.comps || null)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed')
    } finally {
      setLookingUp(false)
    }
  }

  function handleSkipLookup() {
    setStep('review')
  }

  async function handleAnalyze(e: React.FormEvent) {
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
            {step === 'lookup'
              ? 'Enter the address and we\'ll look up property details for you'
              : 'Review the details below, adjust as needed, then run the analysis'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
          step === 'lookup' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          {step === 'review' ? <Check className="h-3.5 w-3.5" /> : <span className="font-bold">1</span>}
          Lookup
        </div>
        <div className="h-px w-6 bg-gray-300" />
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
          step === 'review' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
        }`}>
          <span className="font-bold">2</span>
          Review & Analyze
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Lookup */}
      {step === 'lookup' && (
        <form onSubmit={handleLookup} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Property Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full Address *</label>
                <input
                  className={inputClass}
                  value={form.propertyAddress}
                  onChange={(e) => update('propertyAddress', e.target.value)}
                  placeholder="e.g. 504 Kettering Way, Orange Park FL 32073"
                  required
                />
                <p className={hintClass}>Include city, state, and zip for best results</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Property Type</label>
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
                  <label className={labelClass}>Asking Price ($)</label>
                  <input
                    className={inputClass}
                    type="number"
                    value={form.listPrice}
                    onChange={(e) => update('listPrice', e.target.value)}
                    placeholder="Optional — helps with estimates"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={lookingUp}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lookingUp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {lookingUp ? 'Looking up property...' : 'Lookup Property'}
            </button>
            <button
              type="button"
              onClick={handleSkipLookup}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip — enter details manually
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Review & Analyze */}
      {step === 'review' && (
        <form onSubmit={handleAnalyze} className="space-y-6">
          {/* AI Lookup Notes */}
          {(lookupNotes || lookupComps) && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                AI Lookup Notes
              </h3>
              {lookupNotes && (
                <p className="text-sm text-blue-800 mb-1">{lookupNotes}</p>
              )}
              {lookupComps && (
                <p className="text-sm text-blue-700 italic">{lookupComps}</p>
              )}
              <p className="text-[11px] text-blue-500 mt-2">
                Review and adjust these estimates as needed before running the analysis.
              </p>
            </div>
          )}

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
              {lookupNotes
                ? 'These were estimated by AI. Adjust as needed.'
                : 'Leave blank to auto-estimate based on property type and Florida averages.'}
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              {analyzing ? 'Analyzing...' : 'Analyze Deal'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('lookup'); setLookupNotes(null); setLookupComps(null) }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to lookup
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
