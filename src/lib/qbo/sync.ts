/**
 * QBO Sync Engine.
 *
 * Orchestrates pulling data from QBO and writing it to Supabase.
 * Each sync creates a `qbo_sync_records` entry for audit trail.
 */

import { qboGet, qboQuery } from './client'
import { parseProfitAndLossByClass, parseBalanceSheet } from './reports'
import type { QboClassQueryResponse, QboReport } from './types'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const ORG_ID = '00000000-0000-0000-0000-000000000001'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseAdmin(url, key)
}

/**
 * Sync QBO Classes → properties.qbo_class_id
 */
export async function syncClasses(orgId: string): Promise<{ matched: number; total: number }> {
  const supabase = getAdminClient()

  // Fetch all classes from QBO
  const response = await qboQuery<QboClassQueryResponse>(
    orgId,
    "SELECT * FROM Class WHERE Active = true MAXRESULTS 100"
  )

  const classes = response.QueryResponse.Class ?? []

  // Fetch properties to match
  const { data: properties } = await supabase
    .from('properties')
    .select('id, qbo_class_name')
    .eq('org_id', orgId)
    .eq('active', true)

  let matched = 0

  for (const qboClass of classes) {
    const property = properties?.find(
      (p) => p.qbo_class_name === qboClass.Name
    )
    if (property) {
      await supabase
        .from('properties')
        .update({ qbo_class_id: qboClass.Id })
        .eq('id', property.id)
      matched++
    }
  }

  return { matched, total: classes.length }
}

/**
 * Sync P&L by Class for a given date range.
 * Pulls the report, parses it, matches classes to properties,
 * and upserts into financial_line_items.
 */
export async function syncProfitAndLoss(
  orgId: string,
  startDate: string,
  endDate: string,
  syncId: string
): Promise<{ inserted: number }> {
  const supabase = getAdminClient()

  // Pull P&L by Class report from QBO
  const report = await qboGet<QboReport>(orgId, '/reports/ProfitAndLoss', {
    start_date: startDate,
    end_date: endDate,
    summarize_column_by: 'Classes',
    accounting_method: 'Cash',
  })

  const lines = parseProfitAndLossByClass(report)

  // Build class name → property ID lookup
  const { data: properties } = await supabase
    .from('properties')
    .select('id, qbo_class_name')
    .eq('org_id', orgId)
    .eq('active', true)

  const classToPropertyId = new Map<string, string>()
  for (const p of properties ?? []) {
    if (p.qbo_class_name) {
      classToPropertyId.set(p.qbo_class_name, p.id)
    }
  }

  // Delete existing data for this period to avoid duplicates
  await supabase
    .from('financial_line_items')
    .delete()
    .eq('org_id', orgId)
    .eq('period_date', endDate)
    .not('sync_id', 'is', null)

  // Insert parsed lines
  const rows = lines
    .filter((line) => line.className !== null) // Skip "Total" column
    .map((line) => ({
      org_id: orgId,
      property_id: classToPropertyId.get(line.className!) ?? null,
      sync_id: syncId,
      period_date: endDate,
      account_name: line.accountName,
      account_type: line.accountType,
      amount: line.amount,
    }))

  // Also include unclassified lines (Office, Overhead) as portfolio-level
  const unclassifiedLines = lines
    .filter((line) => line.className !== null && !classToPropertyId.has(line.className))
    .map((line) => ({
      org_id: orgId,
      property_id: null,
      sync_id: syncId,
      period_date: endDate,
      account_name: `${line.accountName} (${line.className})`,
      account_type: line.accountType,
      amount: line.amount,
    }))

  const allRows = [...rows, ...unclassifiedLines]

  if (allRows.length > 0) {
    const { error } = await supabase
      .from('financial_line_items')
      .insert(allRows)

    if (error) throw new Error(`Failed to insert financial data: ${error.message}`)
  }

  return { inserted: allRows.length }
}

/**
 * Sync Balance Sheet for a given date.
 */
export async function syncBalanceSheet(
  orgId: string,
  asOfDate: string,
  syncId: string
): Promise<{ inserted: number }> {
  const supabase = getAdminClient()

  const report = await qboGet<QboReport>(orgId, '/reports/BalanceSheet', {
    date_macro: '', // use as_of_date instead
    as_of_date: asOfDate,
    accounting_method: 'Cash',
  })

  const lines = parseBalanceSheet(report)

  const rows = lines.map((line) => ({
    org_id: orgId,
    property_id: null, // Balance sheet is always portfolio-level
    sync_id: syncId,
    period_date: asOfDate,
    account_name: line.accountName,
    account_type: line.accountType,
    amount: line.amount,
  }))

  if (rows.length > 0) {
    const { error } = await supabase
      .from('financial_line_items')
      .insert(rows)

    if (error) throw new Error(`Failed to insert balance sheet data: ${error.message}`)
  }

  return { inserted: rows.length }
}

/**
 * Full sync: Classes + P&L by Class + Balance Sheet.
 * Creates a sync record for audit trail.
 */
export async function runFullSync(
  orgId: string,
  userId: string,
  startDate: string,
  endDate: string
): Promise<{
  syncId: string
  classes: { matched: number; total: number }
  pnl: { inserted: number }
  balanceSheet: { inserted: number }
}> {
  const supabase = getAdminClient()

  // Create sync record
  const { data: syncRecord, error: syncError } = await supabase
    .from('qbo_sync_records')
    .insert({
      org_id: orgId,
      triggered_by: userId,
      status: 'running',
      sync_type: 'manual',
      period_start: startDate,
      period_end: endDate,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (syncError || !syncRecord) {
    throw new Error(`Failed to create sync record: ${syncError?.message}`)
  }

  const syncId = syncRecord.id

  try {
    // 1. Sync classes
    const classes = await syncClasses(orgId)

    // 2. Sync P&L by Class
    const pnl = await syncProfitAndLoss(orgId, startDate, endDate, syncId)

    // 3. Sync Balance Sheet
    const balanceSheet = await syncBalanceSheet(orgId, endDate, syncId)

    // Update sync record as success
    await supabase
      .from('qbo_sync_records')
      .update({
        status: 'success',
        records_synced: pnl.inserted + balanceSheet.inserted,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncId)

    return { syncId, classes, pnl, balanceSheet }
  } catch (err) {
    // Update sync record as failed
    await supabase
      .from('qbo_sync_records')
      .update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : String(err),
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncId)

    throw err
  }
}
