import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BarChart3, Brain } from 'lucide-react'
import RunAnalysisButton from '@/components/market-analyzer/RunAnalysisButton'
import SentimentBadge from '@/components/market-analyzer/SentimentBadge'

const TYPE_LABELS: Record<string, string> = {
  portfolio_review: 'Portfolio Review',
  market_update: 'Market Update',
  rebalancing: 'Rebalancing',
}

export default async function MarketAnalyzerPage() {
  const supabase = await createClient()

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
    .limit(1)
    .single()

  const isAdmin =
    role?.role === 'family_office_admin' || role?.role === 'org_admin'

  const { data: analyses } = await supabase
    .from('market_analyses')
    .select('*')
    .eq('org_id', role?.org_id ?? '')
    .order('created_at', { ascending: false })

  const { data: knowledgeCount } = await supabase
    .from('knowledge_entries')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', role?.org_id ?? '')

  const items = analyses ?? []
  const kbCount = knowledgeCount?.length ?? 0

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-3 bg-violet-50 text-violet-600">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Analyzer</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              AI-powered portfolio analysis with buy/sell/hold recommendations
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/market-analyzer/knowledge"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Brain className="h-4 w-4" />
          Knowledge Base
          {kbCount > 0 && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
              {kbCount}
            </span>
          )}
        </Link>
      </div>

      {isAdmin && (
        <div className="mb-6">
          <RunAnalysisButton />
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <BarChart3 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">
            No market analyses yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Run your first analysis to get AI-powered portfolio recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const mc = item.market_conditions as { overallSentiment?: string }
            const recs = item.recommendations as {
              properties?: Array<{ recommendation: string }>
            }
            const propRecs = recs?.properties ?? []
            const holdCount = propRecs.filter(
              (r) => r.recommendation === 'hold'
            ).length
            const buyCount = propRecs.filter(
              (r) => r.recommendation === 'buy_more'
            ).length
            const sellCount = propRecs.filter(
              (r) => r.recommendation === 'sell'
            ).length
            const monitorCount = propRecs.filter(
              (r) => r.recommendation === 'monitor'
            ).length

            return (
              <Link
                key={item.id}
                href={`/dashboard/market-analyzer/${item.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:border-gray-300 hover:shadow transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-gray-900">
                      {TYPE_LABELS[item.analysis_type] || item.analysis_type}
                    </p>
                    <span className="text-xs text-gray-400">
                      {item.outlook_horizon}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.market_region} &middot;{' '}
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {buyCount > 0 && (
                      <span className="text-[11px] text-emerald-600">
                        {buyCount} buy
                      </span>
                    )}
                    {holdCount > 0 && (
                      <span className="text-[11px] text-blue-600">
                        {holdCount} hold
                      </span>
                    )}
                    {sellCount > 0 && (
                      <span className="text-[11px] text-red-600">
                        {sellCount} sell
                      </span>
                    )}
                    {monitorCount > 0 && (
                      <span className="text-[11px] text-amber-600">
                        {monitorCount} monitor
                      </span>
                    )}
                  </div>
                </div>
                <SentimentBadge
                  sentiment={mc?.overallSentiment ?? 'neutral'}
                />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
