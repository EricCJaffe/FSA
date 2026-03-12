'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a confirmation link.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Foundation Stone Advisors
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">BusinessOS</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-950 border border-red-800 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
              : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          {mode === 'signin' ? (
            <>
              First time?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
                className="text-zinc-300 hover:text-white underline underline-offset-2"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null); setMessage(null) }}
                className="text-zinc-300 hover:text-white underline underline-offset-2"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
