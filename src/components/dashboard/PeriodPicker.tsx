'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Calendar } from 'lucide-react'

/**
 * Period picker that syncs to URL search params (?period_start=&period_end=).
 * Server components read these params to query the right data.
 */
export default function PeriodPicker() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentYear = new Date().getFullYear()

  // Read from URL params, default to current year
  const periodStart = searchParams.get('period_start') || `${currentYear}-01-01`
  const periodEnd = searchParams.get('period_end') || `${currentYear}-12-31`

  function updatePeriod(start: string, end: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period_start', start)
    params.set('period_end', end)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Quick presets
  const presets = [
    { label: `${currentYear}`, start: `${currentYear}-01-01`, end: `${currentYear}-12-31` },
    { label: `${currentYear - 1}`, start: `${currentYear - 1}-01-01`, end: `${currentYear - 1}-12-31` },
    { label: 'Last 12 months', start: getLast12MonthsStart(), end: getToday() },
  ]

  function getLast12MonthsStart() {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 1)
    return d.toISOString().split('T')[0]
  }

  function getToday() {
    return new Date().toISOString().split('T')[0]
  }

  const isPresetActive = (start: string, end: string) =>
    periodStart === start && periodEnd === end

  const inputClass =
    'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Calendar className="h-4 w-4 text-gray-400" />

      {/* Quick presets */}
      <div className="flex gap-1">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => updatePeriod(preset.start, preset.end)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isPresetActive(preset.start, preset.end)
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <span className="text-gray-300">|</span>

      {/* Custom date inputs */}
      <input
        type="date"
        value={periodStart}
        onChange={(e) => updatePeriod(e.target.value, periodEnd)}
        className={inputClass}
      />
      <span className="text-xs text-gray-400">to</span>
      <input
        type="date"
        value={periodEnd}
        onChange={(e) => updatePeriod(periodStart, e.target.value)}
        className={inputClass}
      />
    </div>
  )
}
