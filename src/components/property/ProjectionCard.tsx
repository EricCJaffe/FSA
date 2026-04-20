interface ProjectionCardProps {
  currentValue: number
  currentMonthlyRent: number
  appreciationRate: number
  rentGrowthRate: number
}

function fmtCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function ProjectionYear({
  years,
  currentValue,
  currentMonthlyRent,
  appreciationRate,
  rentGrowthRate,
}: {
  years: number
  currentValue: number
  currentMonthlyRent: number
  appreciationRate: number
  rentGrowthRate: number
}) {
  const projectedValue = currentValue * Math.pow(1 + appreciationRate, years)
  const gain = projectedValue - currentValue
  const gainPct = (gain / currentValue) * 100
  const projectedAnnualRent = currentMonthlyRent * 12 * Math.pow(1 + rentGrowthRate, years)

  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-4 flex-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{years}Y</p>
      <div className="space-y-3">
        <div>
          <p className="text-[11px] text-gray-400">Projected value</p>
          <p className="text-sm font-bold text-gray-900">{fmtCurrency(projectedValue)}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Appreciation gain</p>
          <p className="text-sm font-semibold text-emerald-600">
            +{fmtCurrency(gain)}{' '}
            <span className="text-[11px] font-medium text-emerald-500">+{gainPct.toFixed(1)}%</span>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Projected annual rent</p>
          <p className="text-sm font-semibold text-gray-700">{fmtCurrency(projectedAnnualRent)}</p>
        </div>
      </div>
    </div>
  )
}

export default function ProjectionCard({
  currentValue,
  currentMonthlyRent,
  appreciationRate,
  rentGrowthRate,
}: ProjectionCardProps) {
  return (
    <div className="flex gap-3">
      {[1, 5, 10].map((years) => (
        <ProjectionYear
          key={years}
          years={years}
          currentValue={currentValue}
          currentMonthlyRent={currentMonthlyRent}
          appreciationRate={appreciationRate}
          rentGrowthRate={rentGrowthRate}
        />
      ))}
    </div>
  )
}
