'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'

interface NetWorthChartProps {
  historicalData: Array<{ year: number; label: string; portfolioValue: number; costBasis: number }>
  projectionData: Array<{ year: number; label: string; baseProjection: number; scenario6Projection: number }>
  currentYear: number
}

function formatYAxis(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}k`
  }
  return `$${value}`
}

function formatTooltipDollar(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      style={{
        fontSize: 12,
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
        background: '#fff',
        padding: '10px 14px',
      }}
    >
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <p key={entry.name} style={{ color: entry.color }} className="leading-5">
          {entry.name}: {formatTooltipDollar(entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function NetWorthChart({
  historicalData,
  projectionData,
  currentYear,
}: NetWorthChartProps) {
  const combined = [
    ...historicalData.map((d) => ({
      label: d.label,
      year: d.year,
      portfolioValue: d.portfolioValue,
      costBasis: d.costBasis,
      baseProjection: undefined as number | undefined,
      scenario6Projection: undefined as number | undefined,
    })),
    ...projectionData.map((d) => ({
      label: d.label,
      year: d.year,
      portfolioValue: undefined as number | undefined,
      costBasis: undefined as number | undefined,
      baseProjection: d.baseProjection,
      scenario6Projection: d.scenario6Projection,
    })),
  ]

  const todayLabel = historicalData.find((d) => d.year === currentYear)?.label

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Portfolio Net Worth: Historical &amp; Projected
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={combined} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={58}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

          {todayLabel && (
            <ReferenceLine
              x={todayLabel}
              stroke="#9ca3af"
              strokeDasharray="4 3"
              label={{ value: 'Today', position: 'top', fontSize: 10, fill: '#9ca3af' }}
            />
          )}

          <Area
            type="monotone"
            dataKey="portfolioValue"
            name="Portfolio Value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.12}
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            connectNulls={false}
          />

          <Line
            type="monotone"
            dataKey="baseProjection"
            name="Base Projection (Hold)"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: '#9ca3af' }}
            connectNulls={false}
          />

          <Line
            type="monotone"
            dataKey="scenario6Projection"
            name="Scenario 6 (Recommended)"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: '#10b981' }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
