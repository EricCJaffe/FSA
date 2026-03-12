import { createClient } from '@/lib/supabase/server'

const modules = [
  {
    title: 'Properties',
    description: 'View and manage your rental portfolio — LTR and STR properties.',
    href: '/dashboard/properties',
    status: 'Coming soon',
  },
  {
    title: 'Portfolio',
    description: 'Portfolio-level rollup — NOI, cap rate, cash flow, and equity.',
    href: '/dashboard/portfolio',
    status: 'Coming soon',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Welcome back{user?.email ? `, ${user.email}` : ''}.
        </p>
      </div>

      {/* Org card */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Active organization
        </p>
        <p className="mt-1 text-lg font-semibold text-white">
          Yarash Eretz Property Management
        </p>
        <p className="mt-0.5 text-sm text-zinc-400">
          Jacksonville, FL · 4 LTR + 1 STR
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modules.map((mod) => (
          <div
            key={mod.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">{mod.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">{mod.description}</p>
              </div>
              <span className="shrink-0 rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-500">
                {mod.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Phase 1 status */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
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
              <span className={item.done ? 'text-emerald-400' : 'text-zinc-600'}>
                {item.done ? '✓' : '○'}
              </span>
              <span className={item.done ? 'text-zinc-300' : 'text-zinc-500'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
