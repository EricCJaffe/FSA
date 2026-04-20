import Link from 'next/link'
import {
  ArrowLeft,
  Waves,
  TrendingUp,
  DollarSign,
  Home,
  CheckCircle2,
} from 'lucide-react'

const COMPS = [
  { address: '3974 Scenic Dr', date: 'Nov 2021', price: 625000, note: 'Redfin now est. $751K' },
  { address: '4170 Scenic Dr', date: 'Jan 2021', price: 535000, note: '' },
  { address: '4168 Scenic Dr', date: '2024', price: 450000, note: '' },
  { address: '4216 Scenic Dr', date: 'Feb 2022', price: 350000, note: '1,485 sqft, no dock' },
]

const COMPARISON_ROWS: {
  label: string
  str: number | null
  ltr: number | null
  delta: number
  isIncome?: boolean
  isTotalExpenses?: boolean
  isGaap?: boolean
  isCashFlow?: boolean
}[] = [
  { label: 'Rental income', str: 28175, ltr: 36000, delta: 7825, isIncome: true },
  { label: 'Insurance', str: 6219, ltr: 4353, delta: -1866 },
  { label: 'Management fees', str: 1958, ltr: 3600, delta: 1642 },
  { label: 'Repairs & maintenance', str: 8220, ltr: 4932, delta: -3288 },
  { label: 'Taxes & licenses', str: 8182, ltr: 6955, delta: -1227 },
  { label: 'Utilities', str: 5445, ltr: 0, delta: -5445 },
  { label: 'Cleaning', str: 126, ltr: 0, delta: -126 },
  { label: 'Lawncare', str: 520, ltr: 0, delta: -520 },
  { label: 'Housewares & linens', str: 632, ltr: 0, delta: -632 },
  { label: 'Job supplies', str: 261, ltr: 78, delta: -183 },
  { label: 'Total Expenses', str: 58857, ltr: 39794, delta: -19063, isTotalExpenses: true },
  { label: 'GAAP Net Income', str: -30682, ltr: -3794, delta: 26887, isGaap: true },
  { label: 'True Cash Flow', str: -1742, ltr: 17068, delta: 18810, isCashFlow: true },
]

const IMPLEMENTATION_STEPS = [
  {
    step: 1,
    title: 'Validate',
    timeframe: 'Days 0–30',
    bullets: [
      'Re-quote insurance as LTR (expect 25–35% drop)',
      'Confirm $3,000/mo rent with Shoreward market analysis',
      'Draft lease with waterfront / dock addendum',
      'Schedule any final family vacation use before tenant',
    ],
  },
  {
    step: 2,
    title: 'Convert',
    timeframe: 'Days 30–90',
    bullets: [
      'List as LTR; screen for stable employment + strong credit',
      'Require 2-month security deposit',
      'Execute 12-month lease (no 24+ months without track record)',
      'Cancel STR listings and notify platform',
    ],
  },
  {
    step: 3,
    title: 'Stack',
    timeframe: 'Days 90–180',
    bullets: [
      'Confirm first 3 months of rent arrive on schedule',
      'Verify insurance premium reduction landed',
      'Track actual vs. projected $17K cash flow run rate',
      'Reassess at 24-month checkpoint: sell or stay',
    ],
  },
  {
    step: 4,
    title: 'Alternative Vacation',
    timeframe: 'Days 90+',
    bullets: [
      'Identify replacement waterfront vacation option for family use',
      'Consider renting a comparable waterfront home during peak weeks',
      'Net cost of replacement vacation vs. $18,810 improvement is favorable',
    ],
  },
]

function fmt(n: number) {
  const abs = Math.abs(n)
  const formatted = abs.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  return n < 0 ? `(${formatted})` : formatted
}

function deltaColor(row: typeof COMPARISON_ROWS[number]) {
  if (row.isIncome || row.isGaap || row.isCashFlow) {
    return row.delta >= 0 ? 'text-emerald-700' : 'text-red-600'
  }
  return row.delta <= 0 ? 'text-emerald-700' : 'text-red-600'
}

function deltaSign(n: number) {
  return n >= 0 ? `+${n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}` : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function ScenicDecisionPage() {
  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/portfolio"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Portfolio Overview
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Scenic Drive — Disposition Decision</h1>
        <p className="mt-1 text-sm text-gray-500">
          4056 Scenic Dr, Middleburg FL 32068 &middot; Waterfront STR → LTR Analysis
        </p>
      </div>

      {/* Property Summary Card */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg p-2 bg-blue-50 text-blue-600">
            <Waves className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Property Summary</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Current Value</p>
            <p className="text-lg font-bold text-gray-900">$500,000</p>
            <p className="text-xs text-gray-500">Shoreward estimate</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Cost Basis</p>
            <p className="text-lg font-bold text-gray-900">$430,000</p>
            <p className="text-xs text-gray-500">ALTA settlement (Jul 2021)</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Appreciation</p>
            <p className="text-lg font-bold text-emerald-700">$70,000</p>
            <p className="text-xs text-emerald-600">+16.3%</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Current Use</p>
            <p className="text-lg font-bold text-amber-600">STR</p>
            <p className="text-xs text-gray-500">Short-Term Rental</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
          <Waves className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <p className="text-xs text-gray-500">
            Waterway: Black Creek (navigable to St. Johns River) &middot; Dock &amp; boat lift on property
          </p>
        </div>
      </div>

      {/* Valuation Section */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg p-2 bg-violet-50 text-violet-600">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Valuation</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Shoreward Estimate</p>
            <p className="text-xl font-bold text-gray-900">$500,000</p>
            <p className="text-xs text-emerald-600 font-medium">Recommended basis</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Zillow Zestimate</p>
            <p className="text-xl font-bold text-gray-600">$471,000</p>
            <p className="text-xs text-amber-600">Algorithm undervalues waterfront</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Comparable Sales — Black Creek / Scenic Dr</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-medium text-gray-400">Address</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-400">Sale Date</th>
                  <th className="pb-2 text-right text-xs font-medium text-gray-400">Price</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-400 pl-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {COMPS.map((comp) => (
                  <tr key={comp.address} className="border-b border-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{comp.address}</td>
                    <td className="py-2.5 text-gray-500">{comp.date}</td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">
                      {comp.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2.5 pl-4 text-xs text-gray-400">{comp.note}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-2.5 font-medium text-blue-700">4104 Scenic Dr</td>
                  <td className="pt-2.5 text-gray-500">Active listing</td>
                  <td className="pt-2.5 text-right font-semibold text-blue-700">$595,000</td>
                  <td className="pt-2.5 pl-4 text-xs text-blue-500">Currently listed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STR vs LTR Comparison Table */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg p-2 bg-emerald-50 text-emerald-600">
            <DollarSign className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">STR vs LTR — Annual P&amp;L Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 w-48">Line Item</th>
                <th className="pb-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">STR (Current)</th>
                <th className="pb-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">LTR (Projected)</th>
                <th className="pb-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Delta</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => {
                const rowClass = row.isCashFlow
                  ? 'bg-emerald-50 border-y-2 border-emerald-200'
                  : row.isTotalExpenses || row.isGaap
                  ? 'bg-gray-50 border-t border-gray-200'
                  : 'border-b border-gray-50'

                const textClass = row.isCashFlow
                  ? 'text-base font-extrabold'
                  : row.isTotalExpenses || row.isGaap
                  ? 'text-sm font-bold'
                  : 'text-sm text-gray-700'

                return (
                  <tr key={row.label} className={rowClass}>
                    <td className={`py-2.5 pr-4 ${row.isCashFlow ? 'text-emerald-900 text-base font-extrabold' : row.isTotalExpenses || row.isGaap ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {row.label}
                    </td>
                    <td className={`py-2.5 text-right tabular-nums ${textClass} ${row.isCashFlow ? 'text-emerald-900' : 'text-gray-900'}`}>
                      {row.str !== null ? fmt(row.str) : '—'}
                    </td>
                    <td className={`py-2.5 text-right tabular-nums ${textClass} ${row.isCashFlow ? 'text-emerald-900' : 'text-gray-900'}`}>
                      {row.ltr !== null ? fmt(row.ltr) : '—'}
                    </td>
                    <td className={`py-2.5 text-right tabular-nums font-semibold ${deltaColor(row)} ${row.isCashFlow ? 'text-base font-extrabold' : ''}`}>
                      {deltaSign(row.delta)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Based on 3.75 years of STR operating history (annualized). LTR at $3,000/mo per Shoreward estimate. Mortgage paid off — interest excluded from both columns.
        </p>
      </div>

      {/* Net Impact Banner */}
      <div className="rounded-xl bg-emerald-600 px-8 py-7 shadow-md mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Net Annual Impact of Converting to LTR</p>
          <p className="text-white text-4xl font-extrabold">+$18,810 / yr</p>
          <p className="text-emerald-100 text-sm mt-1">
            Cash flow swings from <span className="line-through">($1,742)</span> to <span className="font-semibold">$17,068</span>
          </p>
        </div>
        <div className="bg-emerald-500 rounded-xl px-5 py-4 text-center shrink-0">
          <p className="text-emerald-100 text-xs font-medium mb-0.5">Improvement</p>
          <p className="text-white text-2xl font-extrabold">$18,810</p>
          <p className="text-emerald-100 text-xs">immediate, annual, recurring</p>
        </div>
      </div>

      {/* Sale Alternative Section */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg p-2 bg-orange-50 text-orange-600">
            <Home className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Alternative: Sell at $500,000</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Net Proceeds Calculation</h3>
            <div className="space-y-2">
              {[
                { label: 'Sale price', amount: 500000, positive: true },
                { label: 'Less 6% selling costs', amount: -30000, positive: false },
                { label: 'Less LT cap gains (15% on $70K gain)', amount: -10500, positive: false },
                { label: 'Less depreciation recapture (25% on $74,536)', amount: -18634, positive: false },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-600">{row.label}</span>
                  <span className={`font-medium tabular-nums ${row.positive ? 'text-gray-900' : 'text-red-600'}`}>
                    {row.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-1">
                <span className="font-bold text-gray-900">Net Proceeds</span>
                <span className="font-extrabold text-gray-900 tabular-nums">$440,866</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">If Redeployed to S&amp;P 500</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">~$37,473 / yr</p>
            <p className="text-xs text-gray-500 mb-3">$440,866 × 8.5% base-case return</p>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold mt-0.5">▲</span>
                Unrealized — not cash in hand until sold
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold mt-0.5">▲</span>
                S&amp;P drawdown risk in near term
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold mt-0.5">▲</span>
                Tax hit of ~$29K at closing is real, not hypothetical
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                Waterfront asset gone forever — not replicable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Implementation Plan */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">4-Step Implementation Plan</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {IMPLEMENTATION_STEPS.map((step) => (
            <div key={step.step} className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
                  {step.step}
                </span>
                <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">{step.timeframe}</p>
              <ul className="space-y-1.5">
                {step.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">·</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Callout */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-emerald-900 text-base mb-3">
              Recommendation: Convert to LTR (Scenario 6)
            </p>
            <ul className="space-y-2">
              {[
                'Reversible — can revert to STR or sell later; no doors close permanently',
                'Stops the bleeding immediately — $18,810/yr improvement with no tax event at conversion',
                'Preserves the waterfront asset and its optionality; at 24 months, sell from a position of strength if desired',
              ].map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
