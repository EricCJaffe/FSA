import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { runMarketAnalysis, type MarketAnalysisRequest } from '@/lib/market-analyzer/engine'
import { PORTFOLIO_BASELINE } from '@/lib/deal-analyzer/portfolio-baseline'

export const maxDuration = 120

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (
    !role ||
    (role.role !== 'family_office_admin' && role.role !== 'org_admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const analysisType = body.analysisType || 'portfolio_review'
    const horizon = body.horizon || '12-month'
    const additionalContext = body.additionalContext || ''

    // Fetch portfolio properties
    const { data: properties } = await supabase
      .from('properties')
      .select('id, name, address, city, state, zip, property_type, purchase_price, current_market_value, mortgage_balance, mortgage_rate, mortgage_payment, notes, active')
      .eq('org_id', role.org_id)
      .eq('active', true)

    // Build baseline lookup by name for enrichment
    const baselineByName = new Map(
      PORTFOLIO_BASELINE.properties.map((bp) => [bp.name.toLowerCase(), bp])
    )

    const portfolioProperties = (properties ?? []).map((p) => {
      // Match to baseline by name for financial data
      const baseline = baselineByName.get(p.name.toLowerCase())

      // Derive county from address/city or baseline
      const addr = (p.address || '') + ' ' + (p.city || '')
      const county = addr.toLowerCase().includes('orange park') || addr.toLowerCase().includes('32065')
        ? 'Clay'
        : addr.toLowerCase().includes('jacksonville') || addr.toLowerCase().includes('322')
          ? 'Duval'
          : baseline?.county || 'Unknown'

      const basis = Number(p.purchase_price) || baseline?.basis || 0
      const value = Number(p.current_market_value) || baseline?.value || basis
      const monthlyRent = baseline?.monthlyRent || Math.round(value * 0.007)
      const annualCashFlow = baseline?.annualCashFlow || monthlyRent * 12 * 0.55
      const cashOnCash = baseline?.cashOnCash || (basis > 0 ? annualCashFlow / basis : 0)

      return {
        id: p.id,
        name: p.name,
        address: baseline?.address || [p.address, p.city, p.state, p.zip].filter(Boolean).join(', '),
        type: p.property_type || baseline?.type || 'LTR',
        county,
        basis,
        value,
        monthlyRent,
        annualCashFlow,
        cashOnCash,
        mortgageBalance: Number(p.mortgage_balance) || 0,
        mortgageRate: Number(p.mortgage_rate) || 0,
        mortgagePayment: Number(p.mortgage_payment) || 0,
        notes: p.notes || '',
      }
    })

    // Fetch recent knowledge entries for context
    const { data: knowledgeEntries } = await supabase
      .from('knowledge_entries')
      .select('title, content')
      .eq('org_id', role.org_id)
      .order('created_at', { ascending: false })
      .limit(10)

    const existingKnowledge = (knowledgeEntries ?? []).map(
      (k) => `${k.title}: ${k.content.slice(0, 200)}`
    )

    const req: MarketAnalysisRequest = {
      analysisType,
      horizon,
      properties: portfolioProperties,
      existingKnowledge,
      additionalContext,
    }

    const result = await runMarketAnalysis(req)

    const admin = getAdmin()

    // Build portfolio snapshot
    const portfolioSnapshot = {
      properties: portfolioProperties,
      totalBasis: portfolioProperties.reduce((s, p) => s + p.basis, 0),
      totalValue: portfolioProperties.reduce((s, p) => s + p.value, 0),
      totalCashFlow: portfolioProperties.reduce((s, p) => s + p.annualCashFlow, 0),
      avgCashOnCash: portfolioProperties.length > 0
        ? portfolioProperties.reduce((s, p) => s + p.annualCashFlow, 0) /
          portfolioProperties.reduce((s, p) => s + p.basis, 0)
        : 0,
    }

    // Insert analysis
    const { data: analysis, error: insertError } = await admin
      .from('market_analyses')
      .insert({
        org_id: role.org_id,
        user_id: user.id,
        analysis_type: analysisType,
        market_region: 'Northeast Florida',
        portfolio_snapshot: portfolioSnapshot,
        market_conditions: result.marketConditions,
        recommendations: {
          properties: result.propertyRecommendations,
          portfolio: result.portfolioRecommendation,
        },
        outlook_summary: result.outlookSummary,
        outlook_horizon: horizon,
        allocation_context: result.allocationContext,
        ai_model: result.model,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert market analysis error:', insertError)
      return NextResponse.json(
        { error: `Failed to save: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Insert knowledge entries
    if (result.knowledgeEntries.length > 0) {
      // Map property names to IDs
      const propertyMap = new Map(
        (properties ?? []).map((p) => [p.name, p.id])
      )

      const keRows = result.knowledgeEntries.map((ke) => ({
        org_id: role.org_id,
        category: ke.category,
        asset_class: ke.assetClass,
        title: ke.title,
        content: ke.content,
        tags: ke.tags,
        property_id: ke.propertyName ? propertyMap.get(ke.propertyName) || null : null,
        market_analysis_id: analysis.id,
        source: 'market_analysis',
        confidence: ke.confidence,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: ke.validMonths
          ? new Date(Date.now() + ke.validMonths * 30 * 86400000)
              .toISOString()
              .split('T')[0]
          : null,
        metadata: {},
      }))

      const { error: keError } = await admin
        .from('knowledge_entries')
        .insert(keRows)

      if (keError) {
        console.error('Knowledge entries insert error:', keError)
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      knowledgeEntriesCreated: result.knowledgeEntries.length,
    })
  } catch (err) {
    console.error('Market analysis failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const { data: analyses } = await supabase
    .from('market_analyses')
    .select('*')
    .eq('org_id', role.org_id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ analyses: analyses ?? [] })
}
