import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  computePropertyMetrics,
  type FinancialLineItem,
} from '@/lib/financial/metrics'
import { generateAllPropertyInsights } from '@/lib/ai/insights'
import { generateAiContent } from '@/lib/ai/client'
import type { Property } from '@/types'

// Allow up to 60s for AI calls
export const maxDuration = 60

/**
 * POST /api/insights/property-lookup
 * AI-powered property research.
 *
 * Body: { propertyId: string, mode?: 'market' | 'financial' | 'all' }
 *  - 'market' (default): just market analysis (1 AI call, fast)
 *  - 'financial': health + anomaly + hold/sell (3 AI calls, needs financials)
 *  - 'all': both market + financial (4 AI calls, slower)
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

  let body: { propertyId?: string; mode?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { propertyId, mode = 'market' } = body

  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
  }

  try {
    const [{ data: property, error: propError }, { data: financials }] = await Promise.all([
      supabase.from('properties').select('*').eq('id', propertyId).single(),
      supabase.from('financial_line_items').select('*').eq('property_id', propertyId),
    ])

    if (propError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const p = property as Property
    const items = (financials ?? []) as FinancialLineItem[]

    let marketAnalysis = undefined
    let insights = undefined

    // Market analysis
    if (mode === 'market' || mode === 'all') {
      const addressParts = [p.address, p.city, p.state, p.zip].filter(Boolean)
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null

      const marketSystemPrompt = `You are a real estate market analyst specializing in Jacksonville, FL and surrounding areas. You provide concise, data-informed analysis based on your knowledge of local market conditions, neighborhoods, trends, and comparable properties. Be specific and cite market context. Keep responses under 400 words.`

      const marketUserPrompt = `Research and analyze this rental property:

Property: ${p.name}
${fullAddress ? `Address: ${fullAddress}` : 'Address: Not provided'}
Type: ${p.property_type === 'ltr' ? 'Long-term rental (LTR)' : 'Short-term rental (STR)'}
${p.purchase_price ? `Purchase Price: $${Number(p.purchase_price).toLocaleString()}` : ''}
${p.purchase_date ? `Purchase Date: ${p.purchase_date}` : ''}
${p.current_market_value ? `Current Market Value (owner estimate): $${Number(p.current_market_value).toLocaleString()}` : ''}
${p.mortgage_balance ? `Mortgage Balance: $${Number(p.mortgage_balance).toLocaleString()}` : ''}

${items.length > 0 ? `Annual Financial Summary:
- Total Income: $${items.filter(i => i.account_type === 'income' || i.account_type === 'other_income').reduce((s, i) => s + Number(i.amount), 0).toLocaleString()}
- Total Expenses: $${items.filter(i => i.account_type === 'expense').reduce((s, i) => s + Number(i.amount), 0).toLocaleString()}
` : 'No financial data available yet.'}

Provide a market analysis covering:
1. **Neighborhood & Location**: What you know about this area — rental demand, demographics, growth trajectory
2. **Market Position**: How this property likely compares to similar ${p.property_type === 'ltr' ? 'LTR' : 'STR'} rentals in the area
3. **Valuation Assessment**: Whether the owner's estimated market value seems reasonable based on area comps${items.length > 0 ? '\n4. **Rent Optimization**: Whether income levels align with market rates' : ''}
5. **Market Outlook**: Near-term trends for this submarket (rent growth, supply, demand drivers)

${!fullAddress ? 'Note: No address provided — provide general Jacksonville market analysis for this property type.' : ''}`

      marketAnalysis = await generateAiContent(marketUserPrompt, marketSystemPrompt)
    }

    // Financial insights (requires financials)
    if ((mode === 'financial' || mode === 'all') && items.length > 0) {
      const metrics = computePropertyMetrics(items, {
        id: p.id,
        name: p.name,
        property_type: p.property_type,
        purchase_price: p.purchase_price,
        current_market_value: p.current_market_value,
        mortgage_balance: p.mortgage_balance,
        mortgage_payment: p.mortgage_payment,
      })

      insights = await generateAllPropertyInsights(role.org_id, metrics)
    }

    return NextResponse.json({
      success: true,
      marketAnalysis,
      insights,
    })
  } catch (err) {
    console.error('Property lookup failed:', err)
    const message = err instanceof Error ? err.message : 'Property lookup failed'
    // Distinguish AI provider errors for better client messaging
    const isAiError = message.includes('API error') || message.includes('not configured')
    return NextResponse.json(
      { error: message, isAiError },
      { status: isAiError ? 502 : 500 }
    )
  }
}
