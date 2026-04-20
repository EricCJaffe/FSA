import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  computePropertyMetrics,
  formatCurrency,
  formatPercent,
  type FinancialLineItem,
} from '@/lib/financial/metrics'
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
  BarChart3,
  Activity,
  Brain,
} from 'lucide-react'
import AiPropertyLookup from '@/components/property/AiPropertyLookup'
import ProjectionCard from '@/components/property/ProjectionCard'

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

function MetricBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-lg px-4 py-3 ${color}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-lg font-bold">{value}</p>
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

  const [{ data, error }, { data: financials }, { data: insights }] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase
      .from('financial_line_items')
      .select('*')
      .eq('property_id', id)
      .order('period_date', { ascending: false }),
    supabase
      .from('ai_insights')
      .select('*')
      .eq('property_id', id)
      .order('generated_at', { ascending: false })
      .limit(5),
  ])

  if (error || !data) notFound()

  const property = data as Property
  const items = (financials ?? []) as FinancialLineItem[]
  const hasFinancials = items.length > 0

  const metrics = hasFinancials
    ? computePropertyMetrics(items, {
        id: property.id,
        name: property.name,
        property_type: property.property_type,
        purchase_price: property.purchase_price,
        current_market_value: property.current_market_value,
        mortgage_balance: property.mortgage_balance,
        mortgage_payment: property.mortgage_payment,
      })
    : null

  const equity =
    property.current_market_value != null && property.mortgage_balance != null
      ? Number(property.current_market_value) - Number(property.mortgage_balance)
      : property.current_market_value != null
        ? Number(property.current_market_value)
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
                  {(Number(property.ownership_pct) * 100).toFixed(0)}% ownership
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Investment metrics (when financial data exists) */}
      {metrics && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          <MetricBadge
            label="NOI (Cash)"
            value={formatCurrency(metrics.noiCash)}
            color={metrics.noiCash >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
          />
          <MetricBadge
            label="Cap Rate"
            value={metrics.capRate != null ? formatPercent(metrics.capRate) : '—'}
            color="bg-blue-50 text-blue-700"
          />
          <MetricBadge
            label="Cash-on-Cash"
            value={metrics.cashOnCash != null ? formatPercent(metrics.cashOnCash) : '—'}
            color="bg-violet-50 text-violet-700"
          />
          <MetricBadge
            label="OER"
            value={formatPercent(metrics.operatingExpenseRatio)}
            color={metrics.operatingExpenseRatio < 0.5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
          />
        </div>
      )}

      {/* Financial breakdown + Property info grid */}
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
            <Stat label="Rate" value={property.mortgage_rate != null ? fmt(Number(property.mortgage_rate), 'percent') : '—'} icon={Percent} />
            <Stat label="Monthly payment" value={fmt(property.mortgage_payment)} icon={DollarSign} />
            {metrics?.dscr != null && (
              <Stat label="DSCR" value={metrics.dscr.toFixed(2) + 'x'} icon={Activity} />
            )}
            {metrics?.grm != null && (
              <Stat label="GRM" value={metrics.grm.toFixed(1) + 'x'} icon={BarChart3} />
            )}
          </div>
        </div>
      </div>

      {/* Income & Expense breakdown */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Income
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Gross Rental Income</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(metrics.grossIncome)}</span>
              </div>
              {metrics.otherIncome > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Other Income</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(metrics.otherIncome)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Net Income (Cash)</span>
                <span className={`text-sm font-bold ${metrics.netIncomeCash >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netIncomeCash)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Expenses
            </h2>
            <div className="space-y-2">
              {metrics.expenseBreakdown.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center text-sm mb-0.5">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: `${Math.max(item.pct * 100, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total (excl. depreciation)</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(metrics.totalExpensesExDepreciation)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Value Projections */}
      {property.current_market_value != null && (() => {
        const appreciationRate = property.qbo_class_name?.includes('Scenic') ? 0.03 : 0.025
        const rentGrowthRate = 0.025
        const currentMonthlyRent = metrics ? metrics.grossIncome / 12 : 0
        return (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Value Projections
              </h2>
            </div>
            <ProjectionCard
              currentValue={Number(property.current_market_value)}
              currentMonthlyRent={currentMonthlyRent}
              appreciationRate={appreciationRate}
              rentGrowthRate={rentGrowthRate}
            />
          </div>
        )
      })()}

      {/* AI Property Lookup */}
      <AiPropertyLookup
        propertyId={property.id}
        propertyName={property.name}
        address={
          [property.address, property.city, property.state, property.zip]
            .filter(Boolean)
            .join(', ') || null
        }
        hasFinancials={hasFinancials}
      />

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-violet-500" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              AI Insights
            </h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight: { id: string; insight_type: string; content: string; generated_at: string; model_used: string }) => (
              <div key={insight.id} className="rounded-lg bg-violet-50 border border-violet-100 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-violet-600 capitalize">
                    {insight.insight_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-violet-400">
                    {new Date(insight.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-violet-900 whitespace-pre-wrap">{insight.content}</p>
                <p className="text-[11px] text-violet-400 mt-1">via {insight.model_used}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No financial data notice */}
      {!hasFinancials && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm mb-6 text-center">
          <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">No financial data yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Connect QuickBooks in{' '}
            <Link href="/dashboard/settings" className="text-blue-600 hover:text-blue-800 font-medium">
              Settings
            </Link>{' '}
            and run a sync to see income, expenses, and analytics.
          </p>
        </div>
      )}

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
