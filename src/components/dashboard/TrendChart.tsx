'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface MonthlyDataPoint {
  month: string       // "Jan 2025"
  income: number
  expenses: number
  noi: number
}

interface Props {
  data: MonthlyDataPoint[]
}

type ChartMode = 'line' | 'area'
type Metric = 'all' | 'income' | 'expenses' | 'noi'

function formatDollar(value: number) {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value.toFixed(0)}`
}

function formatTooltipDollar(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function TrendChart({ data }: Props) {
  const [mode, setMode] = useState<ChartMode>('area')
  const [metric, setMetric] = useState<Metric>('all')

  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm text-center">
        <p className="text-sm text-gray-400">
          Need at least 2 months of data for trend charts. Run a batch sync from Settings.
        </p>
      </div>
    )
  }

  const lines = {
    income: { color: '#10b981', label: 'Income' },
    expenses: { color: '#f97316', label: 'Expenses' },
    noi: { color: '#3b82f6', label: 'NOI (Cash)' },
  }

  const visibleLines = metric === 'all'
    ? Object.keys(lines) as (keyof typeof lines)[]
    : [metric as keyof typeof lines]

  const ChartComponent = mode === 'area' ? AreaChart : LineChart

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Monthly Trends
        </h2>
        <div className="flex items-center gap-2">
          {/* Metric filter */}
          <div className="flex gap-0.5 rounded-md bg-gray-100 p-0.5">
            {([['all', 'All'], ['income', 'Income'], ['expenses', 'Expenses'], ['noi', 'NOI']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  metric === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Chart type */}
          <div className="flex gap-0.5 rounded-md bg-gray-100 p-0.5">
            <button
              onClick={() => setMode('area')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                mode === 'area' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setMode('line')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                mode === 'line' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ChartComponent data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tickFormatter={formatDollar}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip
            formatter={(value: any, name: any) => [
              formatTooltipDollar(Number(value)),
              lines[name as keyof typeof lines]?.label ?? name,
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
            }}
          />
          {visibleLines.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value: string) => lines[value as keyof typeof lines]?.label ?? value}
            />
          )}

          {visibleLines.map((key) =>
            mode === 'area' ? (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={lines[key].color}
                fill={lines[key].color}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ r: 3, fill: lines[key].color }}
              />
            ) : (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={lines[key].color}
                strokeWidth={2}
                dot={{ r: 3, fill: lines[key].color }}
              />
            )
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}
