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
    // Fetch financial data
    const { data: financials } = await supabase
      .from('financial_line_items')
      .select('*')
      .eq('org_id', role.org_id)

    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .eq('org_id', role.org_id)
      .eq('active', true)

    const items = (financials ?? []) as FinancialLineItem[]
    const props = (properties ?? []) as Property[]

    // Compute metrics
    const portfolioMetrics = computePortfolioMetrics(items.filter((i) => !propertyId || i.property_id === propertyId))
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
