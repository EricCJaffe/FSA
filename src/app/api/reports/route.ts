import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  computePortfolioMetrics,
  computePropertyMetrics,
  computeAllPropertyMetrics,
  type FinancialLineItem,
} from '@/lib/financial/metrics'
import { generatePortfolioNarrative } from '@/lib/ai/insights'
import type { Property } from '@/types'

// Allow up to 60s for AI narrative generation
export const maxDuration = 60

/**
 * POST /api/reports
 * Generate a monthly report for a given period.
 * Body: { year: number, month: number, propertyId?: string }
 *
 * Creates a monthly_reports record with computed metrics snapshot,
 * then generates an AI narrative if an AI provider is configured.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!role || (role.role !== 'family_office_admin' && role.role !== 'org_admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await request.json()
  const { year, month, propertyId } = body

  if (!year || !month) {
    return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
  }

  try {
    // Date range for the report month
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const periodEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    // Prior month
    const priorDate = new Date(year, month - 2, 1) // month-1 in 0-indexed, minus 1 more
    const priorStart = `${priorDate.getFullYear()}-${String(priorDate.getMonth() + 1).padStart(2, '0')}-01`
    const priorLastDay = new Date(priorDate.getFullYear(), priorDate.getMonth() + 1, 0).getDate()
    const priorEnd = `${priorDate.getFullYear()}-${String(priorDate.getMonth() + 1).padStart(2, '0')}-${String(priorLastDay).padStart(2, '0')}`

    // Same month prior year
    const yoyStart = `${year - 1}-${String(month).padStart(2, '0')}-01`
    const yoyLastDay = new Date(year - 1, month, 0).getDate()
    const yoyEnd = `${year - 1}-${String(month).padStart(2, '0')}-${String(yoyLastDay).padStart(2, '0')}`

    // Trailing 12 months for trend data
    const trailingDate = new Date(year, month - 12, 1)
    const trailingStart = `${trailingDate.getFullYear()}-${String(trailingDate.getMonth() + 1).padStart(2, '0')}-01`

    // Fetch current period, prior month, YoY, trailing trend, and properties in parallel
    const [currentRes, priorRes, yoyRes, trendRes, propertiesRes] = await Promise.all([
      supabase
        .from('financial_line_items')
        .select('*')
        .eq('org_id', role.org_id)
        .gte('period_date', periodStart)
        .lte('period_date', periodEnd)
        .in('account_type', ['income', 'other_income', 'expense']),
      supabase
        .from('financial_line_items')
        .select('*')
        .eq('org_id', role.org_id)
        .gte('period_date', priorStart)
        .lte('period_date', priorEnd)
        .in('account_type', ['income', 'other_income', 'expense']),
      supabase
        .from('financial_line_items')
        .select('*')
        .eq('org_id', role.org_id)
        .gte('period_date', yoyStart)
        .lte('period_date', yoyEnd)
        .in('account_type', ['income', 'other_income', 'expense']),
      supabase
        .from('financial_line_items')
        .select('account_type, amount, period_date')
        .eq('org_id', role.org_id)
        .gte('period_date', trailingStart)
        .lte('period_date', periodEnd)
        .in('account_type', ['income', 'other_income', 'expense'])
        .order('period_date'),
      supabase
        .from('properties')
        .select('*')
        .eq('org_id', role.org_id)
        .eq('active', true),
    ])

    const items = (currentRes.data ?? []) as FinancialLineItem[]
    const priorItems = (priorRes.data ?? []) as FinancialLineItem[]
    const yoyItems = (yoyRes.data ?? []) as FinancialLineItem[]
    const props = (propertiesRes.data ?? []) as Property[]

    // Compute metrics for current, prior, and YoY periods
    const portfolioMetrics = computePortfolioMetrics(
      items.filter((i) => !propertyId || i.property_id === propertyId)
    )
    const priorMetrics = priorItems.length > 0
      ? computePortfolioMetrics(priorItems.filter((i) => !propertyId || i.property_id === propertyId))
      : null
    const yoyMetrics = yoyItems.length > 0
      ? computePortfolioMetrics(yoyItems.filter((i) => !propertyId || i.property_id === propertyId))
      : null

    const allPropertyMetrics = computeAllPropertyMetrics(
      items,
      props.map((p) => ({
        id: p.id,
        name: p.name,
        property_type: p.property_type,
        purchase_price: p.purchase_price,
        current_market_value: p.current_market_value,
        mortgage_balance: p.mortgage_balance,
        mortgage_payment: p.mortgage_payment,
      }))
    )

    // Build trailing trend data grouped by month
    const monthMap = new Map<string, { income: number; expenses: number }>()
    for (const item of trendRes.data ?? []) {
      const d = new Date(item.period_date + 'T00:00:00')
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const entry = monthMap.get(key) ?? { income: 0, expenses: 0 }
      const amount = Number(item.amount)
      if (item.account_type === 'income' || item.account_type === 'other_income') {
        entry.income += amount
      } else if (item.account_type === 'expense') {
        entry.expenses += amount
      }
      monthMap.set(key, entry)
    }

    const trend = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => {
        const [y, m] = key.split('-').map(Number)
        const label = new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        return {
          month: label,
          income: Math.round(vals.income),
          expenses: Math.round(vals.expenses),
          noi: Math.round(vals.income - vals.expenses),
        }
      })

    // Helper for period comparison
    function buildComparison(current: typeof portfolioMetrics, prior: typeof portfolioMetrics | null) {
      if (!prior) return null
      const pct = (cur: number, prev: number) =>
        prev === 0 ? null : Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10
      return {
        grossIncome: { value: prior.grossIncome, change: pct(current.grossIncome, prior.grossIncome) },
        noiCash: { value: prior.noiCash, change: pct(current.noiCash, prior.noiCash) },
        totalExpenses: { value: prior.totalExpensesExDepreciation, change: pct(current.totalExpensesExDepreciation, prior.totalExpensesExDepreciation) },
        netIncome: { value: prior.netIncome, change: pct(current.netIncome, prior.netIncome) },
        oer: prior.operatingExpenseRatio,
      }
    }

    // Build summary JSON
    const summaryJson = {
      period: { year, month },
      portfolio: {
        grossIncome: portfolioMetrics.grossIncome,
        totalExpenses: portfolioMetrics.totalExpenses,
        noiCash: portfolioMetrics.noiCash,
        noi: portfolioMetrics.noi,
        oer: portfolioMetrics.operatingExpenseRatio,
        netIncome: portfolioMetrics.netIncome,
        expenseBreakdown: portfolioMetrics.expenseBreakdown,
      },
      comparisons: {
        mom: buildComparison(portfolioMetrics, priorMetrics),
        yoy: buildComparison(portfolioMetrics, yoyMetrics),
      },
      trend,
      properties: allPropertyMetrics.map((m) => ({
        id: m.propertyId,
        name: m.propertyName,
        type: m.propertyType,
        grossIncome: m.grossIncome,
        noiCash: m.noiCash,
        capRate: m.capRate,
        oer: m.operatingExpenseRatio,
      })),
    }

    // Create report record
    const { data: report, error: reportError } = await supabase
      .from('monthly_reports')
      .upsert(
        {
          org_id: role.org_id,
          property_id: propertyId || null,
          period_year: year,
          period_month: month,
          generated_by: user.id,
          summary_json: summaryJson,
          published: false,
        },
        { onConflict: 'org_id,property_id,period_year,period_month' }
      )
      .select()
      .single()

    if (reportError) {
      throw new Error(`Failed to create report: ${reportError.message}`)
    }

    // Generate AI narrative if provider is configured
    let narrative = null
    const period = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
      try {
        narrative = await generatePortfolioNarrative(
          role.org_id,
          portfolioMetrics,
          allPropertyMetrics,
          period,
          report.id
        )
      } catch (aiErr) {
        console.warn('AI narrative generation failed:', aiErr)
        // Continue without narrative — report still saved
      }
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        year,
        month,
        summaryJson,
        narrative: narrative?.content ?? null,
        narrativeModel: narrative?.model ?? null,
      },
    })
  } catch (err) {
    console.error('Report generation failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Report generation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/reports
 * List all reports for the user's org.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!role) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 })
  }

  const { data: reports } = await supabase
    .from('monthly_reports')
    .select('id, period_year, period_month, property_id, generated_at, published, summary_json')
    .eq('org_id', role.org_id)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })

  return NextResponse.json({ reports: reports ?? [] })
}
