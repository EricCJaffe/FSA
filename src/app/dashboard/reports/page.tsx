import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileBarChart, Plus, Calendar, CheckCircle2, Clock } from 'lucide-react'
import GenerateReportButton from '@/components/reports/GenerateReportButton'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
    .limit(1)
    .single()

  const { data: reports } = await supabase
    .from('monthly_reports')
    .select('id, period_year, period_month, property_id, generated_at, published, summary_json')
    .eq('org_id', role?.org_id ?? '')
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })

  const isAdmin = role?.role === 'family_office_admin' || role?.role === 'org_admin'
  const items = reports ?? []

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'report' : 'reports'} generated
          </p>
        </div>
        {isAdmin && <GenerateReportButton />}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <FileBarChart className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">No reports yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Generate your first monthly report to see portfolio analytics and AI insights.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((report) => {
            const periodLabel = new Date(report.period_year, report.period_month - 1).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })
            const summary = report.summary_json as { portfolio?: { noiCash?: number; grossIncome?: number } } | null

            return (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:border-gray-300 hover:shadow transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2.5 bg-blue-50 text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{periodLabel}</p>
                    <p className="text-xs text-gray-500">
                      {report.property_id ? 'Property report' : 'Portfolio report'} &middot; Generated{' '}
                      {new Date(report.generated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {summary?.portfolio?.noiCash != null && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">NOI (Cash)</p>
                      <p className={`text-sm font-medium ${summary.portfolio.noiCash >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ${Math.abs(summary.portfolio.noiCash).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  )}
                  {report.published ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      Draft
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
