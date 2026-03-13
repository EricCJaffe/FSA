'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link2, Link2Off, ExternalLink, CheckCircle2, AlertCircle, Plus, Building2 } from 'lucide-react'

interface QboConnection {
  id: string
  realmId: string
  companyName: string | null
  connectedAt: string
  tokenExpiresAt: string
}

interface Props {
  connections: QboConnection[]
  isAdmin: boolean
}

function QboStatusMessages() {
  const searchParams = useSearchParams()
  const justConnected = searchParams.get('qbo_connected') === 'true'
  const qboError = searchParams.get('qbo_error')

  return (
    <>
      {justConnected && (
        <div className="border-t border-gray-100 px-6 py-3 bg-emerald-50">
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            QuickBooks company connected successfully! You can now sync financial data.
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
    </>
  )
}

export default function QboConnectionCard({ connections, isAdmin }: Props) {
  const hasConnections = connections.length > 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2 ${hasConnections ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              {hasConnections ? <Link2 className="h-5 w-5" /> : <Link2Off className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">QuickBooks Online</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {hasConnections
                  ? `${connections.length} ${connections.length === 1 ? 'company' : 'companies'} connected`
                  : 'Not connected — connect to sync financial data'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <a
              href="/api/qbo/connect"
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                hasConnections
                  ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {hasConnections ? (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add company
                </>
              ) : (
                <>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Connect QuickBooks
                </>
              )}
            </a>
          )}
        </div>

        {/* Connected companies list */}
        {hasConnections && (
          <div className="mt-4 space-y-2">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {conn.companyName || `Company ${conn.realmId}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      Realm ID: {conn.realmId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    Connected {new Date(conn.connectedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status messages — wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <QboStatusMessages />
      </Suspense>

      {!hasConnections && !isAdmin && (
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
          <p className="text-xs text-gray-500">
            Only organization admins can connect QuickBooks.
          </p>
        </div>
      )}
    </div>
  )
}
