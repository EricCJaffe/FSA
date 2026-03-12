'use client'

import { useSearchParams } from 'next/navigation'
import { Link2, Link2Off, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  connected: boolean
  realmId: string | null
  connectedAt: string | null
  isAdmin: boolean
}

export default function QboConnectionCard({ connected, realmId, connectedAt, isAdmin }: Props) {
  const searchParams = useSearchParams()
  const justConnected = searchParams.get('qbo_connected') === 'true'
  const qboError = searchParams.get('qbo_error')

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2 ${connected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              {connected ? <Link2 className="h-5 w-5" /> : <Link2Off className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">QuickBooks Online</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {connected
                  ? `Connected · Company ID: ${realmId}`
                  : 'Not connected — connect to sync financial data'}
              </p>
              {connected && connectedAt && (
                <p className="mt-0.5 text-xs text-gray-400">
                  Connected {new Date(connectedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              isAdmin && (
                <a
                  href="/api/qbo/connect"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Connect QuickBooks
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* Status messages */}
      {justConnected && (
        <div className="border-t border-gray-100 px-6 py-3 bg-emerald-50">
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            QuickBooks connected successfully! You can now sync your financial data.
          </p>
        </div>
      )}

      {qboError && (
        <div className="border-t border-gray-100 px-6 py-3 bg-red-50">
          <p className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            Connection failed: {qboError.replace(/_/g, ' ')}
          </p>
        </div>
      )}

      {!connected && !isAdmin && (
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
          <p className="text-xs text-gray-500">
            Only organization admins can connect QuickBooks.
          </p>
        </div>
      )}
    </div>
  )
}
