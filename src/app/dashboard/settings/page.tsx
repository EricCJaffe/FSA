import { createClient } from '@/lib/supabase/server'
import QboConnectionCard from '@/components/settings/QboConnectionCard'
import QboSyncCard from '@/components/settings/QboSyncCard'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's org and role
  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', user!.id)
    .limit(1)
    .single()

  // Get all QBO connections for this org
  const { data: connections } = await supabase
    .from('qbo_connections')
    .select('id, realm_id, company_name, connected_at, token_expires_at')
    .eq('org_id', role?.org_id ?? '')
    .order('connected_at', { ascending: false })

  // Get recent syncs
  const { data: syncs } = await supabase
    .from('qbo_sync_records')
    .select('*')
    .eq('org_id', role?.org_id ?? '')
    .order('created_at', { ascending: false })
    .limit(10)

  const isAdmin = role?.role === 'family_office_admin' || role?.role === 'org_admin'
  const qboConnections = connections ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg p-2 bg-gray-100 text-gray-600">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage integrations and connections</p>
        </div>
      </div>

      <div className="space-y-6">
        <QboConnectionCard
          connections={qboConnections.map((c) => ({
            id: c.id,
            realmId: c.realm_id,
            companyName: c.company_name,
            connectedAt: c.connected_at,
            tokenExpiresAt: c.token_expires_at,
          }))}
          isAdmin={isAdmin}
        />

        {qboConnections.length > 0 && (
          <QboSyncCard
            syncs={(syncs ?? []).map((s) => ({
              id: s.id,
              status: s.status,
              syncType: s.sync_type,
              periodStart: s.period_start,
              periodEnd: s.period_end,
              recordsSynced: s.records_synced,
              errorMessage: s.error_message,
              startedAt: s.started_at,
              completedAt: s.completed_at,
            }))}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  )
}
