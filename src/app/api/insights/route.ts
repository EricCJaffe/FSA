import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  computePropertyMetrics,
  computePortfolioMetrics,
  type FinancialLineItem,
} from '@/lib/financial/metrics'
import {
  generateAllPropertyInsights,
  generatePortfolioNarrative,
} from '@/lib/ai/insights'
import type { Property } from '@/types'

/**
 * POST /api/insights
 * Generate AI insights.
 * Body: { type: 'property' | 'portfolio', propertyId?: string, period?: string }
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

  if (!role) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 })
  }

  const body = await request.json()
  const { type, propertyId, period } = body

  try {
    if (type === 'property' && propertyId) {
      // Generate insights for a single property
      const [{ data: property }, { data: financials }] = await Promise.all([
        supabase.from('properties').select('*').eq('id', propertyId).single(),
        supabase.from('financial_line_items').select('*').eq('property_id', propertyId),
      ])

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }

      const items = (financials ?? []) as FinancialLineItem[]
      if (items.length === 0) {
        return NextResponse.json({ error: 'No financial data for this property' }, { status: 400 })
      }

      const p = property as Property
      const metrics = computePropertyMetrics(items, {
        id: p.id,
        name: p.name,
        property_type: p.property_type,
        purchase_price: p.purchase_price,
        current_market_value: p.current_market_value,
        mortgage_balance: p.mortgage_balance,
        mortgage_payment: p.mortgage_payment,
      })

      const results = await generateAllPropertyInsights(role.org_id, metrics)
      return NextResponse.json({ success: true, ...results })

    } else if (type === 'portfolio') {
      // Generate portfolio narrative
      const [{ data: financials }, { data: properties }] = await Promise.all([
        supabase.from('financial_line_items').select('*').eq('org_id', role.org_id),
        supabase.from('properties').select('*').eq('active', true).eq('org_id', role.org_id),
      ])

      const items = (financials ?? []) as FinancialLineItem[]
      const props = (properties ?? []) as Property[]

      const portfolioMetrics = computePortfolioMetrics(items)
      const propertyMetrics = props.map((p) => {
        const propItems = items.filter((i) => i.property_id === p.id)
        return computePropertyMetrics(propItems, {
          id: p.id,
          name: p.name,
          property_type: p.property_type,
          purchase_price: p.purchase_price,
          current_market_value: p.current_market_value,
          mortgage_balance: p.mortgage_balance,
          mortgage_payment: p.mortgage_payment,
        })
      })

      const result = await generatePortfolioNarrative(
        role.org_id,
        portfolioMetrics,
        propertyMetrics,
        period || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        null
      )

      return NextResponse.json({ success: true, narrative: result })
    }

    return NextResponse.json({ error: 'Invalid type. Use "property" or "portfolio".' }, { status: 400 })
  } catch (err) {
    console.error('Insight generation failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Insight generation failed' },
      { status: 500 }
    )
  }
}
