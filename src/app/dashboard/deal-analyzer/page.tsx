import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Calculator, Plus, TrendingUp } from 'lucide-react'
import DealVerdictBadge from '@/components/deal-analyzer/DealVerdictBadge'
import { formatDealCurrency, formatDealPercent } from '@/lib/deal-analyzer/calculator'

const OUTCOME_LABELS: Record<string, string> = {
  purchased: 'Purchased',
  passed: 'Passed',
  negotiated_success: 'Negotiated (Won)',
  negotiated_failed: 'Negotiated (Lost)',
  pending: 'Pending',
}

export default async function DealAnalyzerPage() {
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
    .from('deal_analyses')
    .select('*')
    .eq('org_id', role?.org_id ?? '')
    .order('created_at', { ascending: false })

  const items = analyses ?? []

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-3 bg-blue-50 text-blue-600">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Analyzer</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Evaluate acquisition opportunities against your portfolio
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/deal-analyzer/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <TrendingUp className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">
            No analyses yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Run your first deal analysis to evaluate a potential acquisition.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((deal) => (
            <Link
              key={deal.id}
              href={`/dashboard/deal-analyzer/${deal.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:border-gray-300 hover:shadow transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div>
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {deal.property_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {deal.property_address} &middot;{' '}
                    {new Date(deal.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {deal.computed_cash_on_cash != null && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">CoC</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDealPercent(Number(deal.computed_cash_on_cash))}
                    </p>
                  </div>
                )}
                {deal.computed_noi != null && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">NOI</p>
                    <p
                      className={`text-sm font-medium ${deal.computed_noi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {formatDealCurrency(deal.computed_noi)}
                    </p>
                  </div>
                )}
                <div className="flex flex-col items-end gap-1">
                  <DealVerdictBadge verdict={deal.verdict} />
                  {deal.outcome && (
                    <span className="text-[11px] text-gray-400">
                      {OUTCOME_LABELS[deal.outcome] ?? deal.outcome}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
