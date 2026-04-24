import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { runMarketAnalysis, type MarketAnalysisRequest } from '@/lib/market-analyzer/engine'

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
      .select('id, name, address, property_type, county, purchase_price, market_value, monthly_rent')
      .eq('org_id', role.org_id)

    const portfolioProperties = (properties ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address || '',
      type: p.property_type || 'SFH',
      county: p.county || 'Unknown',
      basis: p.purchase_price || 0,
      value: p.market_value || p.purchase_price || 0,
      monthlyRent: p.monthly_rent || 0,
      annualCashFlow: (p.monthly_rent || 0) * 12 * 0.55,
      cashOnCash: p.purchase_price ? ((p.monthly_rent || 0) * 12 * 0.55) / p.purchase_price : 0,
    }))

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
