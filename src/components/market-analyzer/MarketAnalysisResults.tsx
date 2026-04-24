'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  PieChart,
  AlertTriangle,
  Brain,
  FileDown,
} from 'lucide-react'
import RecommendationBadge from './RecommendationBadge'
import SentimentBadge from './SentimentBadge'

interface MarketAnalysis {
  id: string
  analysis_type: string
  market_region: string
  portfolio_snapshot: {
    properties: Array<{
      name: string
      basis: number
      value: number
      monthlyRent: number
      cashOnCash: number
      county: string
    }>
    totalBasis: number
    totalValue: number
    totalCashFlow: number
    avgCashOnCash: number
  }
  market_conditions: {
    overallSentiment: string
    interestRateOutlook: string
    localMarketTrend: string
    rentalDemand: string
    supplyPipeline: string
    economicDrivers: string[]
    risks: string[]
  }
  recommendations: {
    properties: Array<{
      propertyName: string
      recommendation: string
      confidence: string
      rationale: string
      riskFactors: string[]
      upside: string
      targetAction?: string
    }>
    portfolio: string
  }
  outlook_summary: string
  outlook_horizon: string
  allocation_context: {
    currentAllocation: Record<string, number>
    recommendedAllocation: Record<string, number>
    rebalancingNotes: string
  }
  ai_model: string
  created_at: string
}

interface KnowledgeEntry {
  id: string
  category: string
  asset_class: string
  title: string
  content: string
  tags: string[]
  confidence: string
  valid_from: string
  valid_until: string | null
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

const CATEGORY_LABELS: Record<string, string> = {
  market_data: 'Market Data',
  property_insight: 'Property Insight',
  portfolio_strategy: 'Portfolio Strategy',
  economic_indicator: 'Economic Indicator',
  asset_allocation: 'Asset Allocation',
  risk_assessment: 'Risk Assessment',
}

const ASSET_CLASS_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  equities: 'Equities',
  fixed_income: 'Fixed Income',
  commodities: 'Commodities',
  digital_assets: 'Digital Assets',
  private_equity: 'Private Equity',
  cash: 'Cash',
  mixed: 'Mixed',
}

const ALLOC_COLORS: Record<string, string> = {
  real_estate: 'bg-blue-500',
  equities: 'bg-emerald-500',
  fixed_income: 'bg-amber-500',
  commodities: 'bg-orange-500',
  digital_assets: 'bg-violet-500',
  private_equity: 'bg-pink-500',
  cash: 'bg-gray-400',
}

function AllocationBar({
  label,
  allocation,
}: {
  label: string
  allocation: Record<string, number>
}) {
  const entries = Object.entries(allocation).filter(([, v]) => v > 0)
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
      <div className="h-6 rounded-full overflow-hidden flex bg-gray-100">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className={`${ALLOC_COLORS[key] || 'bg-gray-300'} flex items-center justify-center`}
            style={{ width: `${value}%` }}
          >
            {value >= 10 && (
              <span className="text-[10px] font-bold text-white">
                {Math.round(value)}%
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
        {entries.map(([key, value]) => (
          <span key={key} className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className={`h-2 w-2 rounded-full ${ALLOC_COLORS[key] || 'bg-gray-300'}`} />
            {ASSET_CLASS_LABELS[key] || key} ({Math.round(value)}%)
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MarketAnalysisResults({
  analysis,
  knowledgeEntries,
}: {
  analysis: MarketAnalysis
  knowledgeEntries: KnowledgeEntry[]
}) {
  const [showKnowledge, setShowKnowledge] = useState(false)
  const mc = analysis.market_conditions
  const recs = analysis.recommendations
  const snap = analysis.portfolio_snapshot
  const alloc = analysis.allocation_context

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <SentimentBadge sentiment={mc.overallSentiment} />
            <span className="text-xs text-gray-400">
              {analysis.outlook_horizon} outlook
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors print:hidden"
          >
            <FileDown className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700">
          {analysis.outlook_summary.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* Portfolio Snapshot */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <TrendingUp className="h-4 w-4 mb-1 text-emerald-500" />
          <p className="text-lg font-bold text-gray-900">{fmt(snap.totalValue)}</p>
          <p className="text-[11px] text-gray-400">Portfolio Value</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Target className="h-4 w-4 mb-1 text-blue-500" />
          <p className="text-lg font-bold text-gray-900">{fmt(snap.totalBasis)}</p>
          <p className="text-[11px] text-gray-400">Total Basis</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <TrendingUp className="h-4 w-4 mb-1 text-violet-500" />
          <p className="text-lg font-bold text-gray-900">{pct(snap.avgCashOnCash)}</p>
          <p className="text-[11px] text-gray-400">Avg Cash-on-Cash</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <TrendingDown className="h-4 w-4 mb-1 text-amber-500" />
          <p className="text-lg font-bold text-gray-900">
            {pct((snap.totalValue - snap.totalBasis) / snap.totalBasis)}
          </p>
          <p className="text-[11px] text-gray-400">Unrealized Appreciation</p>
        </div>
      </div>

      {/* Market Conditions */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Market Conditions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Interest Rate Outlook</p>
            <p className="text-sm text-gray-700">{mc.interestRateOutlook}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Local Market Trend</p>
            <p className="text-sm text-gray-700">{mc.localMarketTrend}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Rental Demand</p>
            <p className="text-sm text-gray-700">{mc.rentalDemand}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Supply Pipeline</p>
            <p className="text-sm text-gray-700">{mc.supplyPipeline}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Economic Drivers</p>
          <div className="flex flex-wrap gap-2">
            {mc.economicDrivers.map((d, i) => (
              <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Property Recommendations */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Property Recommendations
        </h3>
        <div className="space-y-4">
          {recs.properties.map((rec, i) => (
            <div key={i} className="rounded-lg border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {rec.propertyName}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    rec.confidence === 'high'
                      ? 'bg-emerald-50 text-emerald-600'
                      : rec.confidence === 'low'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {rec.confidence} confidence
                  </span>
                </div>
                <RecommendationBadge recommendation={rec.recommendation} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                <div>
                  <span className="font-medium text-emerald-600">Upside: </span>
                  <span className="text-gray-600">{rec.upside}</span>
                </div>
                {rec.targetAction && (
                  <div>
                    <span className="font-medium text-blue-600">Action: </span>
                    <span className="text-gray-600">{rec.targetAction}</span>
                  </div>
                )}
              </div>
              {rec.riskFactors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rec.riskFactors.map((r, j) => (
                    <span
                      key={j}
                      className="text-[10px] rounded bg-red-50 text-red-600 px-2 py-0.5"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Strategy */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-gray-400" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Portfolio Strategy
          </h3>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700">
          {recs.portfolio.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-4 w-4 text-gray-400" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Asset Allocation
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <AllocationBar label="Current Allocation" allocation={alloc.currentAllocation} />
          <AllocationBar label="Recommended Allocation" allocation={alloc.recommendedAllocation} />
        </div>
        <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-800">{alloc.rebalancingNotes}</p>
        </div>
      </div>

      {/* Risks */}
      {mc.risks.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              Key Risks
            </h3>
          </div>
          <ul className="space-y-2">
            {mc.risks.map((r, i) => (
              <li key={i} className="text-sm text-amber-800">{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Knowledge Entries Toggle */}
      {knowledgeEntries.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm print:break-before-page">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Knowledge Base Entries ({knowledgeEntries.length})
              </h3>
            </div>
            <button
              onClick={() => setShowKnowledge(!showKnowledge)}
              className="text-xs text-blue-600 hover:text-blue-700 print:hidden"
            >
              {showKnowledge ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {(showKnowledge || false) && (
            <div className="space-y-3">
              {knowledgeEntries.map((ke) => (
                <div
                  key={ke.id}
                  className="rounded-lg border border-gray-100 px-4 py-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-900">
                      {ke.title}
                    </span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                      {CATEGORY_LABELS[ke.category] || ke.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 whitespace-pre-line">
                    {ke.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {ke.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] text-gray-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!showKnowledge && (
            <div className="flex flex-wrap gap-2">
              {knowledgeEntries.slice(0, 5).map((ke) => (
                <span
                  key={ke.id}
                  className="rounded bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
                >
                  {ke.title}
                </span>
              ))}
              {knowledgeEntries.length > 5 && (
                <span className="text-xs text-gray-400">
                  +{knowledgeEntries.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
