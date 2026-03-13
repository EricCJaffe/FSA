'use client'

import { useState } from 'react'
import { Brain, Loader2, RefreshCw, Search } from 'lucide-react'

interface AiPropertyLookupProps {
  propertyId: string
  propertyName: string
  address: string | null
  hasFinancials: boolean
}

interface LookupResult {
  marketAnalysis: { content: string; model: string }
  insights?: {
    health: { content: string; model: string }
    anomaly: { content: string; model: string }
    holdSell: { content: string; model: string }
  }
}

export default function AiPropertyLookup({
  propertyId,
  propertyName,
  address,
  hasFinancials,
}: AiPropertyLookupProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'market' | 'health' | 'anomaly' | 'holdSell'>('market')

  async function runLookup() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/insights/property-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Failed (${res.status})`)
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { key: 'market' as const, label: 'Market Analysis' },
    ...(result?.insights
      ? [
          { key: 'health' as const, label: 'Health' },
          { key: 'anomaly' as const, label: 'Anomalies' },
          { key: 'holdSell' as const, label: 'Hold / Sell' },
        ]
      : []),
  ]

  function getActiveContent(): string | null {
    if (!result) return null
    if (activeTab === 'market') return result.marketAnalysis.content
    if (activeTab === 'health') return result.insights?.health.content ?? null
    if (activeTab === 'anomaly') return result.insights?.anomaly.content ?? null
    if (activeTab === 'holdSell') return result.insights?.holdSell.content ?? null
    return null
  }

  function getActiveModel(): string | null {
    if (!result) return null
    if (activeTab === 'market') return result.marketAnalysis.model
    if (activeTab === 'health') return result.insights?.health.model ?? null
    if (activeTab === 'anomaly') return result.insights?.anomaly.model ?? null
    if (activeTab === 'holdSell') return result.insights?.holdSell.model ?? null
    return null
  }

  if (!result && !loading && !error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-500" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              AI Property Lookup
            </h2>
          </div>
          <button
            onClick={runLookup}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            Run AI Analysis
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          AI will research <span className="font-medium text-gray-700">{propertyName}</span>
          {address ? ` at ${address}` : ''} — analyzing market position
          {hasFinancials ? ', financial health, anomalies, and hold/sell recommendation' : ''}.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-500" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            AI Property Lookup
          </h2>
        </div>
        {!loading && (
          <button
            onClick={runLookup}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Re-run
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
          <p className="text-sm text-gray-500">
            Analyzing {propertyName}...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={runLookup}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {result && (
        <>
          {/* Tabs */}
          {tabs.length > 1 && (
            <div className="flex gap-1 mb-4 border-b border-gray-100 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab.key
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="rounded-lg bg-violet-50 border border-violet-100 px-4 py-3">
            <p className="text-sm text-violet-900 whitespace-pre-wrap leading-relaxed">
              {getActiveContent()}
            </p>
            <p className="text-[11px] text-violet-400 mt-2">via {getActiveModel()}</p>
          </div>
        </>
      )}
    </div>
  )
}
