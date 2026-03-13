import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatPercent } from '@/lib/financial/metrics'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Brain,
} from 'lucide-react'
import PublishButton from '@/components/reports/PublishButton'
import ReportCommentary from '@/components/reports/ReportCommentary'

interface ReportSummary {
  period: { year: number; month: number }
  commentary?: string | null
  portfolio: {
    grossIncome: number
    totalExpenses: number
    noiCash: number
    noi: number
    oer: number
    netIncome: number
    expenseBreakdown: { name: string; amount: number; pct: number }[]
  }
  properties: {
    id: string
    name: string
    type: string
    grossIncome: number
    noiCash: number
    capRate: number | null
    oer: number
  }[]
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: report, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !report) notFound()

  const summary = report.summary_json as ReportSummary | null

  // Fetch any AI insights linked to this report
  const { data: insights } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('report_id', id)
    .order('generated_at', { ascending: false })

  const periodLabel = summary
    ? new Date(summary.period.year, summary.period.month - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : `${report.period_year}-${String(report.period_month).padStart(2, '0')}`

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link
        href="/dashboard/reports"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Reports
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg p-3 bg-blue-50 text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{periodLabel}</h1>
            <p className="text-sm text-gray-500">
              {report.property_id ? 'Property report' : 'Portfolio report'} &middot; Generated{' '}
              {new Date(report.generated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <PublishButton reportId={report.id} initialPublished={report.published} />
      </div>

      {summary && (
        <>
          {/* Top metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <DollarSign className="h-4 w-4 text-emerald-500 mb-1" />
              <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.portfolio.grossIncome)}</p>
              <p className="text-[11px] text-gray-400">Gross income</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <TrendingUp className="h-4 w-4 text-blue-500 mb-1" />
              <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.portfolio.noiCash)}</p>
              <p className="text-[11px] text-gray-400">NOI (Cash)</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <BarChart3 className="h-4 w-4 text-orange-500 mb-1" />
              <p className="text-lg font-bold text-gray-900">{formatPercent(summary.portfolio.oer)}</p>
              <p className="text-[11px] text-gray-400">OER</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <DollarSign className={`h-4 w-4 mb-1 ${summary.portfolio.netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.portfolio.netIncome)}</p>
              <p className="text-[11px] text-gray-400">Net income (GAAP)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
            {/* Expense breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Expenses
              </h2>
              <div className="space-y-2.5">
                {summary.portfolio.expenseBreakdown.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-400"
                        style={{ width: `${Math.max(item.pct * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-property summary */}
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                By property
              </h2>
              {summary.properties.length > 0 ? (
                <div className="space-y-3">
                  {summary.properties.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.type.toUpperCase()} · OER {formatPercent(p.oer)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${p.noiCash >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(p.noiCash)}
                        </p>
                        <p className="text-[11px] text-gray-400">NOI</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Per-property data requires P&L by Class sync.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* AI Narrative */}
      {insights && insights.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-violet-500" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              AI Analysis
            </h2>
          </div>
          {insights.map((insight: { id: string; insight_type: string; content: string; model_used: string; generated_at: string }) => (
            <div key={insight.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-violet-600 capitalize">
                  {insight.insight_type.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-gray-400">via {insight.model_used}</span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {insight.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commentary */}
      <ReportCommentary reportId={report.id} initialCommentary={summary?.commentary ?? null} />

      {!insights?.length && !summary && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-gray-500">Report data not available.</p>
        </div>
      )}
    </div>
  )
}
