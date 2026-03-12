'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'

export default function GenerateReportButton() {
  const [generating, setGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  async function handleGenerate() {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate report')
      } else {
        window.location.href = `/dashboard/reports/${data.report.id}`
      }
    } catch {
      setError('Network error')
    } finally {
      setGenerating(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Generate report
      </button>
    )
  }

  return (
    <div className="flex items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleDateString('en-US', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {generating ? 'Generating...' : 'Generate'}
      </button>
      <button
        onClick={() => setShowForm(false)}
        className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
