import { createClient } from '@/lib/supabase/server'
import { DollarSign, TrendingUp, BarChart3, Rocket } from 'lucide-react'
import NetWorthChart from '@/components/dashboard/NetWorthChart'

const CURRENT_YEAR = 2026.3

const historicalData = [
  { year: 2020.0, label: 'Jan 2020', portfolioValue: 87000, costBasis: 87000 },
  { year: 2020.4, label: 'May 2020', portfolioValue: 172000, costBasis: 172000 },
  { year: 2020.6, label: 'Aug 2020', portfolioValue: 273000, costBasis: 273000 },
  { year: 2020.7, label: 'Sep 2020', portfolioValue: 383000, costBasis: 383000 },
  { year: 2021.5, label: 'Jul 2021', portfolioValue: 813000, costBasis: 813000 },
  { year: 2026.3, label: 'Apr 2026', portfolioValue: 1089000, costBasis: 813000 },
]

function buildProjectionData() {
  const monthlyRate = 0.085 / 12
  const monthlyContribution = 3845

  return Array.from({ length: 10 }, (_, i) => {
    const year = 2027 + i
    const yearsFromNow = year - CURRENT_YEAR
    const months = yearsFromNow * 12

    const jaxValue = 589000 * Math.pow(1.025, yearsFromNow)
    const scenicValue = 500000 * Math.pow(1.03, yearsFromNow)
    const baseProjection = Math.round(jaxValue + scenicValue)

    // FV of annuity: PMT * ((1 + r)^n - 1) / r
    const sp500Value = monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
    const scenario6Projection = Math.round(baseProjection + sp500Value)

    return {
      year,
      label: `${year}`,
      baseProjection,
      scenario6Projection,
    }
  })
}

const projectionData = buildProjectionData()

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}K`
  }
  return `$${value}`
}

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = 'text-gray-600 bg-gray-50',
  valueColor,
}: {
  label: string
  value: string
  subtitle?: string
  icon: React.ElementType
  color?: string
  valueColor?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400">{label}</p>
          <p className={`mt-1 text-xl font-bold ${valueColor ?? 'text-gray-900'}`}>{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export default async function NetWorthPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, purchase_price, purchase_date, current_market_value, qbo_class_name')
    .eq('active', true)

  const rows = properties ?? []
  const totalCostBasis = rows.reduce((sum, p) => sum + Number(p.purchase_price ?? 0), 0)
  const totalCurrentValue = rows.reduce((sum, p) => sum + Number(p.current_market_value ?? 0), 0)
  const totalAppreciation = totalCurrentValue - totalCostBasis
  const appreciationPct = totalCostBasis > 0 ? totalAppreciation / totalCostBasis : 0

  // Hardcoded summary for display (per spec — DB data used for live current value)
  const displayCostBasis = totalCostBasis > 0 ? totalCostBasis : 813000
  const displayCurrentValue = totalCurrentValue > 0 ? totalCurrentValue : 1089000
  const displayAppreciation = displayCurrentValue - displayCostBasis
  const displayAppreciationPct = displayCostBasis > 0 ? displayAppreciation / displayCostBasis : appreciationPct

  const scenario6At5Y = projectionData.find((d) => d.year === 2031)?.scenario6Projection ?? 0

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Net Worth Tracker</h1>
        <p className="mt-1 text-sm text-gray-500">
          Portfolio acquisition history, current value, and 10-year projections
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <MetricCard
          label="Total Cost Basis"
          value={formatCurrency(displayCostBasis)}
          subtitle="All-in acquisition cost"
          icon={DollarSign}
          color="text-gray-600 bg-gray-50"
        />
        <MetricCard
          label="Current Value"
          value={formatCurrency(displayCurrentValue)}
          subtitle="Market value (active)"
          icon={BarChart3}
          color="text-blue-600 bg-blue-50"
        />
        <MetricCard
          label="Total Appreciation"
          value={`+${formatCurrency(displayAppreciation)}`}
          subtitle={`+${(displayAppreciationPct * 100).toFixed(1)}% since acquisition`}
          icon={TrendingUp}
          color="text-emerald-600 bg-emerald-50"
          valueColor="text-emerald-600"
        />
        <MetricCard
          label="Scenario 6 Projected (5Y)"
          value={formatCurrency(scenario6At5Y)}
          subtitle="LTR + S&P 500 stack"
          icon={Rocket}
          color="text-violet-600 bg-violet-50"
        />
      </div>

      <NetWorthChart
        historicalData={historicalData}
        projectionData={projectionData}
        currentYear={CURRENT_YEAR}
      />

      <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
        Projections: Jacksonville SFH (2.5%/yr), Scenic Drive (3.0%/yr). Scenario 6 adds S&P 500 position
        ($3,845/mo starting mid-2026, 8.5%/yr compound). Historical values reflect portfolio acquisition dates.
      </div>
    </div>
  )
}
