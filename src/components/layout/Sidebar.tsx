'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: '⬛' },
  { label: 'Properties', href: '/dashboard/properties', icon: '🏠' },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: '📊' },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Foundation Stone
        </p>
        <p className="mt-0.5 text-sm font-bold text-white">BusinessOS</p>
      </div>

      {/* Org */}
      <div className="px-5 py-3 border-b border-zinc-800">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Active org
        </p>
        <p className="mt-0.5 text-xs text-zinc-400 leading-tight">
          Yarash Eretz Property Management
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-zinc-800 px-5 py-4">
        <p className="truncate text-xs text-zinc-500">{userEmail}</p>
        <button
          onClick={handleSignOut}
          className="mt-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
