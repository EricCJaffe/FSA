import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  computePortfolioMetrics,
  formatCurrency,
  type FinancialLineItem,
} from '@/lib/financial/metrics'
import type { Property } from '@/types'
import {
  Building2,
  PieChart,
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Circle,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: { user } }, financialsRes, propertiesRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('financial_line_items')
      .select('*')
      .eq('org_id', '00000000-0000-0000-0000-000000000001')
      .eq('period_date', '2025-12-31'),
    supabase
      .from('properties')
      .select('id, name, property_type')
      .eq('active', true),
  ])

  const items = (financialsRes.data ?? []) as FinancialLineItem[]
  const properties = (propertiesRes.data ?? []) as Property[]
  const metrics = computePortfolioMetrics(items)
  const hasFinancials = items.length > 0

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back{user?.email ? `, ${user.email}` : ''}.
        </p>
      </div>

      {/* Org card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Active organization
        </p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          Yarash Eretz Property Management
        </p>
        <p className="mt-0.5 text-sm text-gray-500">
          Jacksonville, FL &middot; {properties.length} properties
        </p>
      </div>

      {/* Quick stats */}
      {hasFinancials && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <DollarSign className="h-4 w-4 text-emerald-500 mb-1" />
            <p className="text-lg font-bold text-gray-900">{formatCurrency(metrics.grossIncome, true)}</p>
            <p className="text-[11px] text-gray-400">Rental income</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <TrendingUp className="h-4 w-4 text-blue-500 mb-1" />
            <p className="text-lg font-bold text-gray-900">{formatCurrency(metrics.noiCash, true)}</p>
            <p className="text-[11px] text-gray-400">NOI (cash)</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Building2 className="h-4 w-4 text-violet-500 mb-1" />
            <p className="text-lg font-bold text-gray-900">{properties.length}</p>
            <p className="text-[11px] text-gray-400">Properties</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Wallet className="h-4 w-4 text-emerald-500 mb-1" />
            <p className="text-lg font-bold text-gray-900">{formatCurrency(133274, true)}</p>
            <p className="text-[11px] text-gray-400">Cash on hand</p>
          </div>
        </div>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
        <Link
          href="/dashboard/properties"
          className="group rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm hover:border-gray-300 hover:shadow transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg p-2 bg-violet-50 text-violet-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900">Properties</h2>
              <p className="mt-1 text-sm text-gray-500">Manage your rental portfolio</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors mt-1" />
          </div>
        </Link>
        <Link
          href="/dashboard/portfolio"
          className="group rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm hover:border-gray-300 hover:shadow transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg p-2 bg-emerald-50 text-emerald-600">
              <PieChart className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900">Portfolio</h2>
              <p className="mt-1 text-sm text-gray-500">NOI, expenses, equity overview</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors mt-1" />
          </div>
        </Link>
      </div>

      {/* Phase 1 status */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Phase 1 build status
        </p>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Auth (email)', done: true },
            { label: 'Supabase schema + RLS', done: true },
            { label: 'Vercel deployment', done: true },
            { label: 'Property registry', done: true },
            { label: 'Portfolio dashboard', done: true },
            { label: 'QuickBooks integration', done: false },
            { label: 'Per-property analytics', done: false },
            { label: 'AI insights engine', done: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300" />
              )}
              <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
