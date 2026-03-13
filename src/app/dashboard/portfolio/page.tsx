import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  computePortfolioMetrics,
  formatCurrency,
  formatPercent,
  type FinancialLineItem,
} from '@/lib/financial/metrics'
import type { Property } from '@/types'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Building2,
  Home,
  Palmtree,
  Landmark,
  Wallet,
  BarChart3,
  CreditCard,
} from 'lucide-react'
import PeriodPicker from '@/components/dashboard/PeriodPicker'

function MetricCard({
  label,
  value,
  subtitle,
  delta,
  icon: Icon,
  color = 'text-gray-600 bg-gray-50',
}: {
  label: string
  value: string
  subtitle?: string
  delta?: { value: number; label: string } | null
  icon: React.ElementType
  color?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
          {delta != null && delta.value !== 0 && (
            <p className={`mt-0.5 text-xs font-medium ${delta.value > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {delta.value > 0 ? '▲' : '▼'} {Math.abs(delta.value).toFixed(1)}% {delta.label}
            </p>
          )}
          {subtitle && !delta && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

/**
 * Compute prior period date range (same duration, shifted back).
 */
function getPriorPeriod(start: string, end: string): { priorStart: string; priorEnd: string } {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const durationMs = e.getTime() - s.getTime()
  const priorEnd = new Date(s.getTime() - 1) // day before current start
  const priorStart = new Date(priorEnd.getTime() - durationMs)
  return {
    priorStart: priorStart.toISOString().split('T')[0],
    priorEnd: priorEnd.toISOString().split('T')[0],
  }
}

function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return null
  return ((current - prior) / Math.abs(prior)) * 100
}

/**
 * Compute balance sheet totals from financial_line_items with balance sheet account types.
 */
function computeBalanceSheetTotals(items: FinancialLineItem[]) {
  let totalAssets = 0
  let totalLiabilities = 0
  let totalEquity = 0
  let cashOnHand = 0

  for (const item of items) {
    const amount = Number(item.amount)
    if (item.account_type === 'asset') {
      totalAssets += amount
      const name = item.account_name.toLowerCase()
      if (name.includes('checking') || name.includes('savings') || name.includes('cash') || name.includes('bank')) {
        cashOnHand += amount
      }
    } else if (item.account_type === 'liability') {
      totalLiabilities += amount
    } else if (item.account_type === 'equity') {
      totalEquity += amount
    }
  }

  return { totalAssets, totalLiabilities, totalEquity, cashOnHand }
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ period_start?: string; period_end?: string }>
}) {
  const params = await searchParams
  const currentYear = new Date().getFullYear()
  const periodStart = params.period_start || `${currentYear}-01-01`
  const periodEnd = params.period_end || `${currentYear}-12-31`

  const supabase = await createClient()

  // Get user's org
  const { data: { user } } = await supabase.auth.getUser()
  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id')
    .eq('user_id', user!.id)
    .limit(1)
    .single()

  const orgId = role?.org_id ?? '00000000-0000-0000-0000-000000000001'

  // Compute prior period for comparison
  const { priorStart, priorEnd } = getPriorPeriod(periodStart, periodEnd)

  // Fetch current P&L, balance sheet, prior P&L, and properties in parallel
  const [pnlRes, bsRes, priorPnlRes, propertiesRes] = await Promise.all([
    supabase
      .from('financial_line_items')
      .select('*')
      .eq('org_id', orgId)
      .gte('period_date', periodStart)
      .lte('period_date', periodEnd)
      .in('account_type', ['income', 'other_income', 'expense']),
    supabase
      .from('financial_line_items')
      .select('*')
      .eq('org_id', orgId)
      .gte('period_date', periodStart)
      .lte('period_date', periodEnd)
      .in('account_type', ['asset', 'liability', 'equity']),
    supabase
      .from('financial_line_items')
      .select('*')
      .eq('org_id', orgId)
      .gte('period_date', priorStart)
      .lte('period_date', priorEnd)
      .in('account_type', ['income', 'other_income', 'expense']),
    supabase
      .from('properties')
      .select('*')
      .eq('active', true)
      .eq('org_id', orgId)
      .order('name'),
  ])

  const pnlItems = (pnlRes.data ?? []) as FinancialLineItem[]
  const bsItems = (bsRes.data ?? []) as FinancialLineItem[]
  const priorPnlItems = (priorPnlRes.data ?? []) as FinancialLineItem[]
  const properties = (propertiesRes.data ?? []) as Property[]
  const metrics = computePortfolioMetrics(pnlItems)
  const priorMetrics = priorPnlItems.length > 0 ? computePortfolioMetrics(priorPnlItems) : null
  const bs = computeBalanceSheetTotals(bsItems)
  const hasBsData = bsItems.length > 0
  const hasPrior = priorMetrics !== null
  const deltaLabel = 'vs prior period'

  const ltrCount = properties.filter((p) => p.property_type === 'ltr').length
  const strCount = properties.filter((p) => p.property_type === 'str').length

  // Format period label
  const startLabel = new Date(periodStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const endLabel = new Date(periodEnd + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const periodLabel = startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Yarash Eretz Property Management &middot; {properties.length} properties ({ltrCount} LTR, {strCount} STR)
          </p>
        </div>
        <Suspense fallback={null}>
          <PeriodPicker />
        </Suspense>
      </div>

      {/* Top-line P&L metrics */}
      {pnlItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <MetricCard
            label="Gross Rental Income"
            value={formatCurrency(metrics.grossIncome)}
            subtitle={!hasPrior ? periodLabel : undefined}
            delta={hasPrior ? { value: pctChange(metrics.grossIncome, priorMetrics.grossIncome) ?? 0, label: deltaLabel } : undefined}
            icon={DollarSign}
            color="text-emerald-600 bg-emerald-50"
          />
          <MetricCard
            label="NOI (Cash Basis)"
            value={formatCurrency(metrics.noiCash)}
            subtitle={!hasPrior && metrics.grossIncome > 0 ? `${formatPercent(metrics.noiCash / metrics.grossIncome)} margin` : undefined}
            delta={hasPrior ? { value: pctChange(metrics.noiCash, priorMetrics.noiCash) ?? 0, label: deltaLabel } : undefined}
            icon={TrendingUp}
            color="text-blue-600 bg-blue-50"
          />
          <MetricCard
            label="Operating Expenses"
            value={formatCurrency(metrics.totalExpensesExDepreciation)}
            subtitle={!hasPrior ? `OER: ${formatPercent(metrics.operatingExpenseRatio)}` : undefined}
            delta={hasPrior ? { value: -(pctChange(metrics.totalExpensesExDepreciation, priorMetrics.totalExpensesExDepreciation) ?? 0), label: deltaLabel } : undefined}
            icon={TrendingDown}
            color="text-orange-600 bg-orange-50"
          />
          <MetricCard
            label="Net Income (GAAP)"
            value={formatCurrency(metrics.netIncome)}
            subtitle={!hasPrior ? `Incl. ${formatCurrency(metrics.depreciation)} depreciation` : undefined}
            delta={hasPrior ? { value: pctChange(metrics.netIncome, priorMetrics.netIncome) ?? 0, label: deltaLabel } : undefined}
            icon={BarChart3}
            color={metrics.netIncome >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm mb-6 text-center">
          <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">No P&L data for this period</p>
          <p className="text-sm text-gray-500 mt-1">
            Try selecting a different date range, or run a QBO sync from Settings.
          </p>
        </div>
      )}

      {/* Balance sheet summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <MetricCard
          label="Total Assets"
          value={hasBsData ? formatCurrency(bs.totalAssets) : '—'}
          icon={Landmark}
          color="text-violet-600 bg-violet-50"
        />
        <MetricCard
          label="Total Equity"
          value={hasBsData ? formatCurrency(bs.totalEquity) : '—'}
          icon={PieChart}
          color="text-violet-600 bg-violet-50"
        />
        <MetricCard
          label="Cash on Hand"
          value={hasBsData ? formatCurrency(bs.cashOnHand) : '—'}
          icon={Wallet}
          color="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          label="Total Liabilities"
          value={hasBsData ? formatCurrency(bs.totalLiabilities) : '—'}
          subtitle={hasBsData && bs.totalLiabilities < 1000 ? 'Nearly debt-free' : undefined}
          icon={CreditCard}
          color={hasBsData && bs.totalLiabilities < 10000 ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expense breakdown */}
        {metrics.expenseBreakdown.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Expense breakdown ({periodLabel})
            </h2>
            <div className="space-y-3">
              {metrics.expenseBreakdown.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.max(item.pct * 100, 1)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatPercent(item.pct)} of total</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Property summary */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Properties
          </h2>
          <div className="space-y-3">
            {properties.map((property) => (
              <a
                key={property.id}
                href={`/dashboard/properties/${property.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 -mx-3 hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`rounded-lg p-2 ${
                    property.property_type === 'str'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {property.property_type === 'str' ? (
                    <Palmtree className="h-4 w-4" />
                  ) : (
                    <Home className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{property.name}</p>
                  <p className="text-xs text-gray-400">
                    {property.property_type === 'ltr' ? 'Long-term rental' : 'Short-term rental'}
                    {property.city ? ` · ${property.city}, ${property.state}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Market value</p>
                  <p className="text-sm font-medium text-gray-700">
                    {property.current_market_value
                      ? formatCurrency(Number(property.current_market_value))
                      : '—'}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Portfolio totals note */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-400">
                Per-property income and expense breakdowns are available on each property detail page.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data source note */}
      <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
        Data source: QuickBooks Online (cash basis).
        {hasBsData
          ? ' Balance sheet data from synced records.'
          : ' Balance sheet data will appear after running a QBO sync.'}
        {' '}Manage syncs in Settings.
      </div>
    </div>
  )
}
