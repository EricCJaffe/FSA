import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import MarketAnalysisResults from '@/components/market-analyzer/MarketAnalysisResults'
import DeleteAnalysisButton from '@/components/market-analyzer/DeleteAnalysisButton'

const TYPE_LABELS: Record<string, string> = {
  portfolio_review: 'Portfolio Review',
  market_update: 'Market Update',
  rebalancing: 'Rebalancing Analysis',
}

export default async function MarketAnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: analysis, error } = await supabase
    .from('market_analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !analysis) notFound()

  const { data: knowledgeEntries } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('market_analysis_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="p-8 max-w-4xl print:p-0 print:max-w-none">
      {/* Print-only branded header */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Foundation Stone Advisors
            </h1>
            <p className="text-xs text-gray-500">Market Analysis Report</p>
          </div>
          <p className="text-xs text-gray-400">
            {new Date(analysis.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/market-analyzer"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Market Analyzer
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-3 bg-violet-50 text-violet-600 print:hidden">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 print:text-2xl">
              {TYPE_LABELS[analysis.analysis_type] || analysis.analysis_type}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {analysis.market_region} &middot; {analysis.outlook_horizon} outlook &middot;{' '}
              {new Date(analysis.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="print:hidden">
          <DeleteAnalysisButton analysisId={analysis.id} />
        </div>
      </div>

      <MarketAnalysisResults
        analysis={analysis}
        knowledgeEntries={knowledgeEntries ?? []}
      />
    </div>
  )
}
