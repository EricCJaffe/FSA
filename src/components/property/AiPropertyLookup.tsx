'use client'

import { useState } from 'react'
import { Brain, Loader2, RefreshCw, Search, Sparkles } from 'lucide-react'

interface AiPropertyLookupProps {
  propertyId: string
  propertyName: string
  address: string | null
  hasFinancials: boolean
}

interface AiResult {
  content: string
  model: string
}

interface LookupResult {
  marketAnalysis?: AiResult
  insights?: {
    health: AiResult
    anomaly: AiResult
    holdSell: AiResult
  }
}

type Tab = 'market' | 'health' | 'anomaly' | 'holdSell'

export default function AiPropertyLookup({
  propertyId,
  propertyName,
  address,
  hasFinancials,
}: AiPropertyLookupProps) {
  const [marketLoading, setMarketLoading] = useState(false)
  const [financialLoading, setFinancialLoading] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('market')

  async function fetchLookup(mode: 'market' | 'financial') {
    const res = await fetch('/api/insights/property-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, mode }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: `Server error (${res.status})` }))
      if (data.isAiError) {
        throw new Error(`AI provider error: ${data.error}. Check that OPENAI_API_KEY or ANTHROPIC_API_KEY is set in Vercel env vars.`)
      }
      throw new Error(data.error || `Request failed (${res.status})`)
    }

    return res.json()
  }

  async function runMarketAnalysis() {
    setMarketLoading(true)
    setError(null)

    try {
      const data = await fetchLookup('market')
      setResult((prev) => ({ ...prev, marketAnalysis: data.marketAnalysis }))
      setActiveTab('market')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Market analysis failed')
    } finally {
      setMarketLoading(false)
    }
  }

  async function runFinancialInsights() {
    setFinancialLoading(true)
    setError(null)

    try {
      const data = await fetchLookup('financial')
      setResult((prev) => ({ ...prev, insights: data.insights }))
      setActiveTab('health')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Financial insights failed')
    } finally {
      setFinancialLoading(false)
    }
  }

  const loading = marketLoading || financialLoading

  const tabs: { key: Tab; label: string }[] = [
    ...(result?.marketAnalysis ? [{ key: 'market' as const, label: 'Market Analysis' }] : []),
    ...(result?.insights
      ? [
          { key: 'health' as const, label: 'Health' },
          { key: 'anomaly' as const, label: 'Anomalies' },
          { key: 'holdSell' as const, label: 'Hold / Sell' },
        ]
      : []),
  ]

  function getActiveContent(): AiResult | null {
    if (!result) return null
    if (activeTab === 'market') return result.marketAnalysis ?? null
    if (activeTab === 'health') return result.insights?.health ?? null
    if (activeTab === 'anomaly') return result.insights?.anomaly ?? null
    if (activeTab === 'holdSell') return result.insights?.holdSell ?? null
    return null
  }

  // Initial state — no results yet
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
            onClick={runMarketAnalysis}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            Run AI Analysis
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          AI will research <span className="font-medium text-gray-700">{propertyName}</span>
          {address ? ` at ${address}` : ''} — analyzing market position and neighborhood context.
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
        <div className="flex items-center gap-2">
          {/* Show "Run Financial Insights" button if market done but no financials yet */}
          {result?.marketAnalysis && !result?.insights && hasFinancials && !financialLoading && (
            <button
              onClick={runFinancialInsights}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-200 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Run Financial Insights
            </button>
          )}
          {!loading && (
            <button
              onClick={runMarketAnalysis}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Re-run
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
          <p className="text-sm text-gray-500">
            {marketLoading ? 'Analyzing market position...' : 'Running financial insights...'}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={runMarketAnalysis}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {result && tabs.length > 0 && !loading && (
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
          {getActiveContent() && (
            <div className="rounded-lg bg-violet-50 border border-violet-100 px-4 py-3">
              <p className="text-sm text-violet-900 whitespace-pre-wrap leading-relaxed">
                {getActiveContent()!.content}
              </p>
              <p className="text-[11px] text-violet-400 mt-2">via {getActiveContent()!.model}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
