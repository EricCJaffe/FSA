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

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = 'text-gray-600 bg-gray-50',
}: {
  label: string
  value: string
  subtitle?: string
  icon: React.ElementType
  color?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export default async function PortfolioPage() {
  const supabase = await createClient()

  // Fetch financial data and properties in parallel
  const [financialsRes, propertiesRes] = await Promise.all([
    supabase
      .from('financial_line_items')
      .select('*')
      .eq('org_id', '00000000-0000-0000-0000-000000000001')
      .eq('period_date', '2025-12-31'),
    supabase
      .from('properties')
      .select('*')
      .eq('active', true)
      .order('name'),
  ])

  const items = (financialsRes.data ?? []) as FinancialLineItem[]
  const properties = (propertiesRes.data ?? []) as Property[]
  const metrics = computePortfolioMetrics(items)

  const ltrCount = properties.filter((p) => p.property_type === 'ltr').length
  const strCount = properties.filter((p) => p.property_type === 'str').length

  // Balance sheet figures (hardcoded from import until we have balance sheet line items)
  const totalAssets = 897149.60
  const totalEquity = 897614.86
  const totalDebt = 478.89
  const cashOnHand = 133273.92

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Yarash Eretz Property Management &middot; {properties.length} properties ({ltrCount} LTR, {strCount} STR)
        </p>
      </div>

      {/* Top-line metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <MetricCard
          label="Gross Rental Income"
          value={formatCurrency(metrics.grossIncome)}
          subtitle="2025 annual"
          icon={DollarSign}
          color="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          label="NOI (Cash Basis)"
          value={formatCurrency(metrics.noiCash)}
          subtitle={`${formatPercent(metrics.noiCash / metrics.grossIncome)} margin`}
          icon={TrendingUp}
          color="text-blue-600 bg-blue-50"
        />
        <MetricCard
          label="Operating Expenses"
          value={formatCurrency(metrics.totalExpensesExDepreciation)}
          subtitle={`OER: ${formatPercent(metrics.operatingExpenseRatio)}`}
          icon={TrendingDown}
          color="text-orange-600 bg-orange-50"
        />
        <MetricCard
          label="Net Income (GAAP)"
          value={formatCurrency(metrics.netIncome)}
          subtitle={`Incl. ${formatCurrency(metrics.depreciation)} depreciation`}
          icon={BarChart3}
          color={metrics.netIncome >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}
        />
      </div>

      {/* Balance sheet summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <MetricCard
          label="Total Assets"
          value={formatCurrency(totalAssets)}
          icon={Landmark}
          color="text-violet-600 bg-violet-50"
        />
        <MetricCard
          label="Total Equity"
          value={formatCurrency(totalEquity)}
          icon={PieChart}
          color="text-violet-600 bg-violet-50"
        />
        <MetricCard
          label="Cash on Hand"
          value={formatCurrency(cashOnHand)}
          icon={Wallet}
          color="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          label="Total Debt"
          value={formatCurrency(totalDebt)}
          subtitle="Nearly debt-free"
          icon={CreditCard}
          color="text-emerald-600 bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expense breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Expense breakdown (2025)
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
                Per-property income and expense breakdowns will appear here once P&L by Class data is imported from QuickBooks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data source note */}
      <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
        Data source: QuickBooks Online export (2025 annual, cash basis). Balance sheet as of March 12, 2026.
        Per-property breakdowns require P&L by Class import.
      </div>
    </div>
  )
}
