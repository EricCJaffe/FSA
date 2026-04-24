import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Brain, Tag } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  market_data: 'Market Data',
  property_insight: 'Property Insight',
  portfolio_strategy: 'Portfolio Strategy',
  economic_indicator: 'Economic Indicator',
  asset_allocation: 'Asset Allocation',
  risk_assessment: 'Risk Assessment',
}

const CATEGORY_COLORS: Record<string, string> = {
  market_data: 'bg-blue-50 text-blue-700 border-blue-200',
  property_insight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  portfolio_strategy: 'bg-violet-50 text-violet-700 border-violet-200',
  economic_indicator: 'bg-amber-50 text-amber-700 border-amber-200',
  asset_allocation: 'bg-pink-50 text-pink-700 border-pink-200',
  risk_assessment: 'bg-red-50 text-red-700 border-red-200',
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

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-emerald-600',
  medium: 'text-amber-600',
  low: 'text-red-600',
}

export default async function KnowledgeBasePage() {
  const supabase = await createClient()

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id')
    .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
    .limit(1)
    .single()

  if (!role) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500">No organization found.</p>
      </div>
    )
  }

  const { data: entries } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('org_id', role.org_id)
    .order('created_at', { ascending: false })

  const items = entries ?? []

  type KBEntry = (typeof items)[number]

  // Group by category
  const grouped = items.reduce<Record<string, KBEntry[]>>(
    (acc, item) => {
      const cat = item.category as string
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    },
    {}
  )

  // Collect all unique tags
  const allTags = [...new Set(items.flatMap((i) => i.tags || []))].sort()

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/dashboard/market-analyzer"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Market Analyzer
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg p-3 bg-violet-50 text-violet-600">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {items.length} insights accumulated across{' '}
            {Object.keys(grouped).length} categories
          </p>
        </div>
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Topics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-50 border border-gray-200 px-2.5 py-1 text-xs text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <Brain className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">
            Knowledge base is empty
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Run a market analysis to start building your portfolio intelligence.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catEntries]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    CATEGORY_COLORS[category] || 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {CATEGORY_LABELS[category] || category}
                </span>
                <span className="text-xs text-gray-400">
                  {catEntries.length} {catEntries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <div className="space-y-3">
                {catEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-gray-400">
                          {ASSET_CLASS_LABELS[entry.asset_class] || entry.asset_class}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            CONFIDENCE_COLORS[entry.confidence] || 'text-gray-500'
                          }`}
                        >
                          {entry.confidence}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {entry.content}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(entry.tags || []).map((t: string) => (
                          <span
                            key={t}
                            className="text-[10px] text-gray-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>
                          {new Date(entry.created_at).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                        {entry.valid_until && (
                          <span>
                            Expires{' '}
                            {new Date(entry.valid_until).toLocaleDateString(
                              'en-US',
                              { month: 'short', year: 'numeric' }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
