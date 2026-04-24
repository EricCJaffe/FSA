'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Play } from 'lucide-react'

export default function RunAnalysisButton() {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [horizon, setHorizon] = useState<string>('12-month')
  const [additionalContext, setAdditionalContext] = useState('')

  async function handleRun() {
    setError(null)
    setRunning(true)

    try {
      const res = await fetch('/api/market-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType: 'portfolio_review',
          horizon,
          additionalContext: additionalContext.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')

      router.push(`/dashboard/market-analyzer/${data.analysis.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setRunning(false)
    }
  }

  const selectClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => (showOptions ? handleRun() : setShowOptions(true))}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {running ? 'Analyzing portfolio...' : showOptions ? 'Run Analysis' : 'New Analysis'}
        </button>
        {showOptions && !running && (
          <button
            onClick={() => setShowOptions(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      {showOptions && !running && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Outlook Horizon
            </label>
            <select
              className={selectClass}
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
            >
              <option value="6-month">6 Months</option>
              <option value="12-month">12 Months</option>
              <option value="24-month">24 Months</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Additional Context (optional)
            </label>
            <textarea
              className={selectClass}
              rows={3}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g. Considering selling Sunderland, looking at Clay County duplex, one property is waterfront..."
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Add specific questions, recent developments, or portfolio considerations
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
