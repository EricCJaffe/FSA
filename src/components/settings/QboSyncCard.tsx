'use client'

import { useState } from 'react'
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface SyncRecord {
  id: string
  status: string
  syncType: string
  periodStart: string | null
  periodEnd: string | null
  recordsSynced: number | null
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
}

interface Props {
  syncs: SyncRecord[]
  isAdmin: boolean
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'running':
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

export default function QboSyncCard({ syncs, isAdmin }: Props) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Default date range: current calendar year
  const currentYear = new Date().getFullYear()
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`)
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`)

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/qbo/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Sync failed')
      } else {
        setSuccess(
          `Synced ${data.classes.matched} classes, ${data.pnl.inserted} P&L lines, ${data.balanceSheet.inserted} balance sheet lines`
        )
        // Reload to refresh sync history
        window.location.reload()
      }
    } catch {
      setError('Network error — check your connection')
    } finally {
      setSyncing(false)
    }
  }

  const inputClass =
    'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Data Sync</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Pull P&L by Class and Balance Sheet from QuickBooks
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {syncing ? 'Syncing...' : 'Sync now'}
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600 mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}
      </div>

      {/* Sync history */}
      {syncs.length > 0 && (
        <div className="border-t border-gray-100">
          <div className="px-6 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Recent syncs
            </p>
            <div className="space-y-2">
              {syncs.map((sync) => (
                <div
                  key={sync.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <StatusIcon status={sync.status} />
                    <div>
                      <p className="text-sm text-gray-700">
                        {sync.periodStart && sync.periodEnd
                          ? `${sync.periodStart} → ${sync.periodEnd}`
                          : 'Full sync'}
                      </p>
                      {sync.errorMessage && (
                        <p className="text-xs text-red-500 mt-0.5">{sync.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {sync.recordsSynced != null ? `${sync.recordsSynced} records` : ''}
                    </p>
                    {sync.completedAt && (
                      <p className="text-[11px] text-gray-400" suppressHydrationWarning>
                        {new Date(sync.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {syncs.length === 0 && (
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-400 text-center">No syncs yet. Run your first sync above.</p>
        </div>
      )}
    </div>
  )
}
