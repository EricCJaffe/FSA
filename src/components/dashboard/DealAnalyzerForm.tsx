'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Calculator, Home, Building2, Waves } from 'lucide-react'

type PropertyType = 'SFH' | 'Condo' | 'STR'
type Location = 'Jacksonville SFH' | 'Jax Beach Condo' | 'Middleburg Waterfront' | 'Other'

interface Inputs {
  propertyName: string
  purchasePrice: string
  downPayment: string
  monthlyRent: string
  propertyType: PropertyType
  location: Location
  annualInsurance: string
  annualTax: string
  mgmtPct: string
  repairsPct: string
  mortgageRate: string
  loanTerm: string
}

const PORTFOLIO_BASELINE = {
  capRate: 0.052,
  cashOnCash: 0.051,
  grm: 8.1,
  dscr: 2.8,
}

const APPRECIATION_RATES: Record<Location, number> = {
  'Jacksonville SFH': 0.025,
  'Jax Beach Condo': 0.01,
  'Middleburg Waterfront': 0.03,
  'Other': 0.02,
}

function parseNum(val: string): number | null {
  if (!val.trim()) return null
  const n = parseFloat(val.replace(/,/g, ''))
  return isNaN(n) ? null : n
}

function fmt(n: number, style: 'currency' | 'percent' | 'decimal' = 'decimal', decimals = 2): string {
  if (style === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  }
  if (style === 'percent') {
    return (n * 100).toFixed(decimals) + '%'
  }
  return n.toFixed(decimals)
}

type MetricStatus = 'green' | 'yellow' | 'red'

function getStatus(value: number, baseline: number, higherIsBetter = true): MetricStatus {
  const ratio = higherIsBetter
    ? (value - baseline) / Math.abs(baseline)
    : (baseline - value) / Math.abs(baseline)
  if (ratio > 0.05) return 'green'
  if (ratio >= -0.05) return 'yellow'
  return 'red'
}

const statusDot: Record<MetricStatus, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
}

const statusText: Record<MetricStatus, string> = {
  green: 'text-emerald-700',
  yellow: 'text-amber-700',
  red: 'text-red-700',
}

const statusBorder: Record<MetricStatus, string> = {
  green: 'border-emerald-200 bg-emerald-50',
  yellow: 'border-amber-200 bg-amber-50',
  red: 'border-red-200 bg-red-50',
}

function MetricCard({
  label,
  value,
  baseline,
  baselineLabel,
  status,
}: {
  label: string
  value: string | null
  baseline: string
  baselineLabel: string
  status: MetricStatus | null
}) {
  return (
    <div className={`rounded-xl border px-4 py-3.5 shadow-sm ${status ? statusBorder[status] : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        {status && <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${statusDot[status]}`} />}
      </div>
      <p className={`mt-1 text-lg font-bold ${status ? statusText[status] : 'text-gray-400'}`}>
        {value ?? '—'}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-400">{baselineLabel}: {baseline}</p>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  )
}

export default function DealAnalyzerForm() {
  const [inputs, setInputs] = useState<Inputs>({
    propertyName: '',
    purchasePrice: '',
    downPayment: '',
    monthlyRent: '',
    propertyType: 'SFH',
    location: 'Jacksonville SFH',
    annualInsurance: '',
    annualTax: '',
    mgmtPct: '10',
    repairsPct: '1',
    mortgageRate: '6.5',
    loanTerm: '30',
  })

  function set(field: keyof Inputs, value: string) {
    setInputs((prev) => {
      const next = { ...prev, [field]: value }
      const price = parseNum(next.purchasePrice)
      if (field === 'purchasePrice' && price != null) {
        if (!prev.annualInsurance || prev.annualInsurance === String((parseNum(prev.purchasePrice) ?? 0) * 0.01)) {
          next.annualInsurance = String(Math.round(price * 0.01))
        }
        if (!prev.annualTax || prev.annualTax === String((parseNum(prev.purchasePrice) ?? 0) * 0.015)) {
          next.annualTax = String(Math.round(price * 0.015))
        }
      }
      return next
    })
  }

  const computed = useMemo(() => {
    const price = parseNum(inputs.purchasePrice)
    const down = parseNum(inputs.downPayment)
    const rent = parseNum(inputs.monthlyRent)
    const insurance = parseNum(inputs.annualInsurance) ?? (price != null ? price * 0.01 : null)
    const tax = parseNum(inputs.annualTax) ?? (price != null ? price * 0.015 : null)
    const mgmt = parseNum(inputs.mgmtPct) ?? 10
    const repairs = parseNum(inputs.repairsPct) ?? 1
    const rateAnnual = parseNum(inputs.mortgageRate) ?? 6.5
    const term = parseNum(inputs.loanTerm) ?? 30

    if (price == null || price === 0 || down == null) return null

    const loan = price - down
    const rateMonthly = rateAnnual / 100 / 12
    const n = term * 12

    const monthlyMortgage =
      rateMonthly === 0
        ? loan / n
        : (loan * rateMonthly * Math.pow(1 + rateMonthly, n)) / (Math.pow(1 + rateMonthly, n) - 1)

    const annualDebtService = monthlyMortgage * 12

    if (rent == null || rent === 0) {
      return {
        loan,
        monthlyMortgage,
        annualDebtService,
        annualGrossRent: null,
        annualMgmt: null,
        annualRepairs: null,
        operatingExpenses: null,
        noi: null,
        cashFlow: null,
        capRate: null,
        cashOnCash: null,
        grm: null,
        dscr: null,
        projValue5Y: null,
        projEquity5Y: null,
        downPct: down / price,
      }
    }

    const annualGrossRent = rent * 12
    const annualMgmt = annualGrossRent * (mgmt / 100)
    const annualRepairs = price * (repairs / 100)
    const operatingExpenses = (insurance ?? 0) + (tax ?? 0) + annualMgmt + annualRepairs
    const noi = annualGrossRent - operatingExpenses
    const cashFlow = noi - annualDebtService
    const capRate = noi / price
    const cashOnCash = down > 0 ? cashFlow / down : null
    const grm = annualGrossRent > 0 ? price / annualGrossRent : null
    const dscr = annualDebtService > 0 ? noi / annualDebtService : null

    const appRate = APPRECIATION_RATES[inputs.location]
    const projValue5Y = price * Math.pow(1 + appRate, 5)

    // Remaining loan balance at year 5
    const paymentsLeft = n - 60
    const remainingBalance =
      rateMonthly === 0
        ? loan - monthlyMortgage * 60
        : (monthlyMortgage * (1 - Math.pow(1 + rateMonthly, -paymentsLeft))) / rateMonthly

    const projEquity5Y = projValue5Y - remainingBalance

    return {
      loan,
      monthlyMortgage,
      annualDebtService,
      annualGrossRent,
      annualMgmt,
      annualRepairs,
      operatingExpenses,
      noi,
      cashFlow,
      capRate,
      cashOnCash,
      grm,
      dscr,
      projValue5Y,
      projEquity5Y,
      downPct: down / price,
    }
  }, [inputs])

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5'

  const downPct = computed?.downPct != null ? ` (${(computed.downPct * 100).toFixed(1)}%)` : ''

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl">
      {/* ---- INPUTS (left 40%) ---- */}
      <div className="lg:w-[40%] space-y-5">
        {/* Basic */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-gray-400" />
            Property details
          </h2>
          <div className="space-y-3.5">
            <div>
              <label htmlFor="propertyName" className={labelClass}>Property name</label>
              <input
                id="propertyName"
                value={inputs.propertyName}
                onChange={(e) => set('propertyName', e.target.value)}
                className={inputClass}
                placeholder="e.g. 45 Riverside Dr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="purchasePrice" className={labelClass}>Purchase price ($)</label>
                <input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  value={inputs.purchasePrice}
                  onChange={(e) => set('purchasePrice', e.target.value)}
                  className={inputClass}
                  placeholder="350000"
                />
              </div>
              <div>
                <label htmlFor="downPayment" className={labelClass}>
                  Down payment ($){downPct}
                </label>
                <input
                  id="downPayment"
                  type="number"
                  min="0"
                  value={inputs.downPayment}
                  onChange={(e) => set('downPayment', e.target.value)}
                  className={inputClass}
                  placeholder="70000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="monthlyRent" className={labelClass}>Expected monthly rent ($)</label>
              <input
                id="monthlyRent"
                type="number"
                min="0"
                value={inputs.monthlyRent}
                onChange={(e) => set('monthlyRent', e.target.value)}
                className={inputClass}
                placeholder="2200"
              />
            </div>

            <div>
              <label className={labelClass}>Property type</label>
              <div className="flex gap-2">
                {(['SFH', 'Condo', 'STR'] as PropertyType[]).map((t) => {
                  const icons = { SFH: Home, Condo: Building2, STR: Waves }
                  const Icon = icons[t]
                  const active = inputs.propertyType === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('propertyType', t)}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="location" className={labelClass}>Location / market</label>
              <select
                id="location"
                value={inputs.location}
                onChange={(e) => set('location', e.target.value as Location)}
                className={inputClass}
              >
                <option>Jacksonville SFH</option>
                <option>Jax Beach Condo</option>
                <option>Middleburg Waterfront</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Expenses */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Operating expenses</h2>
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="annualInsurance" className={labelClass}>Annual insurance ($)</label>
                <input
                  id="annualInsurance"
                  type="number"
                  min="0"
                  value={inputs.annualInsurance}
                  onChange={(e) => set('annualInsurance', e.target.value)}
                  className={inputClass}
                  placeholder={
                    parseNum(inputs.purchasePrice) != null
                      ? String(Math.round((parseNum(inputs.purchasePrice) ?? 0) * 0.01))
                      : '3500'
                  }
                />
              </div>
              <div>
                <label htmlFor="annualTax" className={labelClass}>Annual property tax ($)</label>
                <input
                  id="annualTax"
                  type="number"
                  min="0"
                  value={inputs.annualTax}
                  onChange={(e) => set('annualTax', e.target.value)}
                  className={inputClass}
                  placeholder={
                    parseNum(inputs.purchasePrice) != null
                      ? String(Math.round((parseNum(inputs.purchasePrice) ?? 0) * 0.015))
                      : '5250'
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mgmtPct" className={labelClass}>Management fee (%)</label>
                <input
                  id="mgmtPct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={inputs.mgmtPct}
                  onChange={(e) => set('mgmtPct', e.target.value)}
                  className={inputClass}
                  placeholder="10"
                />
              </div>
              <div>
                <label htmlFor="repairsPct" className={labelClass}>Annual repairs (% of value)</label>
                <input
                  id="repairsPct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={inputs.repairsPct}
                  onChange={(e) => set('repairsPct', e.target.value)}
                  className={inputClass}
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Financing */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Financing</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="mortgageRate" className={labelClass}>Mortgage rate (%)</label>
              <input
                id="mortgageRate"
                type="number"
                step="0.01"
                min="0"
                value={inputs.mortgageRate}
                onChange={(e) => set('mortgageRate', e.target.value)}
                className={inputClass}
                placeholder="6.5"
              />
            </div>
            <div>
              <label htmlFor="loanTerm" className={labelClass}>Loan term (years)</label>
              <input
                id="loanTerm"
                type="number"
                min="1"
                max="40"
                value={inputs.loanTerm}
                onChange={(e) => set('loanTerm', e.target.value)}
                className={inputClass}
                placeholder="30"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ---- RESULTS (right 60%) ---- */}
      <div className="lg:w-[60%] space-y-5">
        {/* Key metrics vs portfolio */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Key metrics vs. portfolio</h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1" />
              beats baseline by &gt;5%&nbsp;&nbsp;
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 mr-1" />
              within 5%&nbsp;&nbsp;
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1" />
              below
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Cap Rate"
              value={computed?.capRate != null ? fmt(computed.capRate, 'percent') : null}
              baseline="5.2%"
              baselineLabel="Portfolio avg"
              status={computed?.capRate != null ? getStatus(computed.capRate, PORTFOLIO_BASELINE.capRate) : null}
            />
            <MetricCard
              label="Cash-on-Cash"
              value={computed?.cashOnCash != null ? fmt(computed.cashOnCash, 'percent') : null}
              baseline="5.1%"
              baselineLabel="Portfolio avg"
              status={computed?.cashOnCash != null ? getStatus(computed.cashOnCash, PORTFOLIO_BASELINE.cashOnCash) : null}
            />
            <MetricCard
              label="GRM"
              value={computed?.grm != null ? fmt(computed.grm, 'decimal', 1) : null}
              baseline="8.1"
              baselineLabel="Portfolio avg"
              status={computed?.grm != null ? getStatus(computed.grm, PORTFOLIO_BASELINE.grm, false) : null}
            />
            <MetricCard
              label="DSCR"
              value={computed?.dscr != null ? fmt(computed.dscr, 'decimal', 2) : null}
              baseline="2.8"
              baselineLabel="Portfolio avg"
              status={computed?.dscr != null ? getStatus(computed.dscr, PORTFOLIO_BASELINE.dscr) : null}
            />
          </div>
        </section>

        {/* Income & cash flow */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Income & cash flow</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoCard
              label="Annual gross rent"
              value={computed?.annualGrossRent != null ? fmt(computed.annualGrossRent, 'currency') : null}
            />
            <InfoCard
              label="Annual mgmt fees"
              value={computed?.annualMgmt != null ? fmt(computed.annualMgmt, 'currency') : null}
            />
            <InfoCard
              label="Annual repairs"
              value={computed?.annualRepairs != null ? fmt(computed.annualRepairs, 'currency') : null}
            />
            <InfoCard
              label="Operating expenses"
              value={computed?.operatingExpenses != null ? fmt(computed.operatingExpenses, 'currency') : null}
            />
            <InfoCard
              label="NOI"
              value={computed?.noi != null ? fmt(computed.noi, 'currency') : null}
            />
            <div className={`rounded-xl border px-4 py-3.5 shadow-sm ${
              computed?.cashFlow == null
                ? 'border-gray-200 bg-white'
                : computed.cashFlow >= 0
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-gray-500">Annual cash flow</p>
                {computed?.cashFlow != null && (
                  computed.cashFlow >= 0
                    ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    : <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
              <p className={`mt-1 text-lg font-bold ${
                computed?.cashFlow == null
                  ? 'text-gray-400'
                  : computed.cashFlow >= 0
                  ? 'text-emerald-700'
                  : 'text-red-700'
              }`}>
                {computed?.cashFlow != null ? fmt(computed.cashFlow, 'currency') : '—'}
              </p>
              {computed?.monthlyMortgage != null && (
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {fmt(computed.cashFlow != null ? computed.cashFlow / 12 : 0, 'currency')}/mo after debt service
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Debt & financing */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Debt & financing</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoCard
              label="Loan amount"
              value={computed?.loan != null ? fmt(computed.loan, 'currency') : null}
            />
            <InfoCard
              label="Monthly mortgage"
              value={computed?.monthlyMortgage != null ? fmt(computed.monthlyMortgage, 'currency') : null}
            />
            <InfoCard
              label="Annual debt service"
              value={computed?.annualDebtService != null ? fmt(computed.annualDebtService, 'currency') : null}
            />
          </div>
        </section>

        {/* 5-year projection */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">5-year projection</h2>
            {computed && (
              <span className="text-xs text-gray-400">
                {(APPRECIATION_RATES[inputs.location] * 100).toFixed(1)}%/yr appreciation · {inputs.location}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label="Projected value (5Y)"
              value={computed?.projValue5Y != null ? fmt(computed.projValue5Y, 'currency') : null}
            />
            <InfoCard
              label="Projected equity (5Y)"
              value={computed?.projEquity5Y != null ? fmt(computed.projEquity5Y, 'currency') : null}
            />
          </div>
        </section>

        {/* Empty state hint */}
        {!computed && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
            <Minus className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">Enter a purchase price and down payment to see results</p>
          </div>
        )}
      </div>
    </div>
  )
}
