import { createClient } from '@/lib/supabase/server'
import {
  Building2,
  PieChart,
  CheckCircle2,
  Circle,
} from 'lucide-react'

const modules = [
  {
    title: 'Properties',
    description: 'View and manage your rental portfolio — LTR and STR properties.',
    href: '/dashboard/properties',
    status: 'Coming soon',
    icon: Building2,
    color: 'text-violet-600 bg-violet-50',
  },
  {
    title: 'Portfolio',
    description: 'Portfolio-level rollup — NOI, cap rate, cash flow, and equity.',
    href: '/dashboard/portfolio',
    status: 'Coming soon',
    icon: PieChart,
    color: 'text-emerald-600 bg-emerald-50',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
      <div className="mb-8 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Active organization
        </p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          Yarash Eretz Property Management
        </p>
        <p className="mt-0.5 text-sm text-gray-500">
          Jacksonville, FL &middot; 4 LTR + 1 STR
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <div
              key={mod.href}
              className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 ${mod.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{mod.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{mod.description}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-400">
                  {mod.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Phase 1 status */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Phase 1 build status
        </p>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Auth (email)', done: true },
            { label: 'Supabase schema + RLS', done: true },
            { label: 'Vercel deployment', done: true },
            { label: 'Property registry', done: false },
            { label: 'QuickBooks integration', done: false },
            { label: 'Analytics dashboards', done: false },
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
