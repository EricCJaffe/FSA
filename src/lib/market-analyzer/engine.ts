import { PORTFOLIO_BASELINE } from '../deal-analyzer/portfolio-baseline'
import { generateAiContent } from '../ai/client'

export interface PortfolioProperty {
  id?: string
  name: string
  address: string
  type: string
  county: string
  basis: number
  value: number
  monthlyRent: number
  annualCashFlow: number
  cashOnCash: number
  mortgageBalance?: number
  mortgageRate?: number
  mortgagePayment?: number
  notes?: string
}

export interface MarketAnalysisRequest {
  analysisType: 'portfolio_review' | 'market_update' | 'rebalancing'
  horizon: '6-month' | '12-month' | '24-month'
  properties: PortfolioProperty[]
  existingKnowledge: string[]
  additionalContext?: string
}

export interface PropertyRecommendation {
  propertyName: string
  recommendation: 'buy_more' | 'hold' | 'sell' | 'monitor'
  confidence: 'high' | 'medium' | 'low'
  rationale: string
  riskFactors: string[]
  upside: string
  targetAction?: string
}

export interface MarketConditions {
  overallSentiment: 'bullish' | 'neutral' | 'bearish'
  interestRateOutlook: string
  localMarketTrend: string
  rentalDemand: string
  supplyPipeline: string
  economicDrivers: string[]
  risks: string[]
}

export interface AllocationContext {
  currentAllocation: Record<string, number>
  recommendedAllocation: Record<string, number>
  rebalancingNotes: string
}

export interface KnowledgeEntryInput {
  category: string
  assetClass: string
  title: string
  content: string
  tags: string[]
  confidence: 'high' | 'medium' | 'low'
  validMonths: number
  propertyName?: string
}

export interface MarketAnalysisResult {
  marketConditions: MarketConditions
  propertyRecommendations: PropertyRecommendation[]
  portfolioRecommendation: string
  outlookSummary: string
  allocationContext: AllocationContext
  knowledgeEntries: KnowledgeEntryInput[]
  model: string
}

export async function runMarketAnalysis(
  request: MarketAnalysisRequest
): Promise<MarketAnalysisResult> {
  const portfolio = request.properties.length > 0
    ? request.properties
    : PORTFOLIO_BASELINE.properties.map((p) => ({
        name: p.name,
        address: p.address,
        type: p.type,
        county: p.county,
        basis: p.basis,
        value: p.value,
        monthlyRent: p.monthlyRent,
        annualCashFlow: p.annualCashFlow,
        cashOnCash: p.cashOnCash,
      }))

  const totalBasis = portfolio.reduce((s, p) => s + p.basis, 0)
  const totalValue = portfolio.reduce((s, p) => s + p.value, 0)
  const totalCashFlow = portfolio.reduce((s, p) => s + p.annualCashFlow, 0)
  const avgCoC = totalCashFlow / totalBasis
  const appreciation = ((totalValue - totalBasis) / totalBasis) * 100

  const systemPrompt = `You are a senior family office investment strategist with deep expertise in Northeast Florida real estate markets — specifically Clay County (Orange Park, Fleming Island, Middleburg) and Duval County (Jacksonville westside, Murray Hill, Riverside/Avondale, Arlington, beaches).

Your analysis must be SPECIFIC and DATA-DRIVEN, not generic. You know:

MARKET FUNDAMENTALS:
- Jacksonville MSA population growth, migration patterns (Northeast corridor inflow)
- Housing starts vs absorption rates in Clay and Duval counties
- Affordable housing supply deficit — new construction skews $300K+ while demand exists below $200K
- Rental vacancy rates by submarket and price tier
- Median home prices, $/sqft trends, days on market by ZIP code
- New multifamily pipeline and its impact on rental rates
- Military (NAS Jax, Mayport) and healthcare (Baptist, Mayo, UF Health) as demand drivers

PROPERTY-SPECIFIC CONTEXT:
- Waterfront/water-access properties in NE FL: premium factors, flood zone considerations, insurance implications
- Low-end housing (<$200K) market dynamics vs mid-market — these behave VERY differently
- STR vs LTR regulatory landscape in Duval and Clay counties
- Clay County growth corridor along Blanding Blvd and 17
- Westside Jacksonville gentrification patterns and displacement risk

MACRO/FAMILY OFFICE:
- Fed funds rate trajectory and mortgage rate implications
- Florida insurance crisis (Citizens, private market hardening, SB 4-D)
- Property tax trends by county (millage rates, homestead exemption impact on investors)
- How RE fits in a diversified family office portfolio alongside equities, fixed income, commodities, digital assets
- Risk-adjusted return comparisons across asset classes
- Tax harvesting and 1031 exchange considerations

CRITICAL INSTRUCTION: You MUST provide a recommendation for EVERY property listed. Do not skip any.

You MUST respond with valid JSON only — no markdown, no explanation, no code fences.`

  const knowledgeContext = request.existingKnowledge.length > 0
    ? `\n\nPrevious Knowledge Base Entries (build on these — reference prior findings and track changes):\n${request.existingKnowledge.slice(-15).map((k) => `- ${k}`).join('\n')}`
    : ''

  const propertyNames = portfolio.map((p) => p.name)

  const userPrompt = `Provide a comprehensive ${request.horizon} portfolio analysis with deep market intelligence.

## Portfolio Summary
- Total Properties: ${portfolio.length}
- Total Basis: $${totalBasis.toLocaleString()}
- Total Estimated Value: $${totalValue.toLocaleString()}
- Total Annual Cash Flow: $${totalCashFlow.toLocaleString()}
- Portfolio Avg Cash-on-Cash: ${(avgCoC * 100).toFixed(1)}%
- Unrealized Appreciation: ${appreciation.toFixed(1)}%
- Markets: ${[...new Set(portfolio.map((p) => `${p.county} County`))].join(', ')}
- Portfolio Positioning: Concentrated in affordable/workforce housing segment (<$200K per unit)

## Individual Properties — YOU MUST ANALYZE ALL ${portfolio.length}
${portfolio.map((p) => {
  const equityPct = p.basis > 0 ? (((p.value - p.basis) / p.basis) * 100).toFixed(0) : '0'
  const mortBal = ('mortgageBalance' in p && p.mortgageBalance) ? p.mortgageBalance as number : 0
  const mortRate = ('mortgageRate' in p && p.mortgageRate) ? p.mortgageRate as number : 0
  const notes = ('notes' in p && p.notes) ? p.notes as string : ''
  return `- **${p.name}** (${p.type}): ${p.address}
  Basis: $${p.basis.toLocaleString()} | Value: $${p.value.toLocaleString()} (+${equityPct}%) | Rent: $${p.monthlyRent.toLocaleString()}/mo | CoC: ${(p.cashOnCash * 100).toFixed(1)}% | ${p.county} County${mortBal ? ` | Mortgage: $${mortBal.toLocaleString()} @ ${(mortRate * 100).toFixed(2)}%` : ' | Free & clear'}${notes ? ` | Notes: ${notes}` : ''}`
}).join('\n')}

## Deep Analysis Required
Analyze the following dimensions for THIS SPECIFIC portfolio:

1. **Housing Supply/Demand Imbalance**: This portfolio is positioned in the affordable/workforce housing tier. Analyze housing starts vs population growth in Clay and Duval. How does the nationwide affordable housing deficit play out locally? Are builders targeting this price point or focusing on higher-margin homes?

2. **Rental Market Depth**: At $1,100-$1,300/mo rent points, where does this sit relative to market? What is the vacancy rate at this price tier vs higher-end rentals? Is there Section 8 / voucher demand?

3. **Submarket Analysis**: Orange Park (Clay) vs Jacksonville Westside (Duval) — which submarket is strengthening faster? Where are the gentrification and infrastructure investment signals?

4. **Waterfront/Location Premium**: If any properties have water access or unique location attributes, analyze the premium factor and whether it is growing or stable.

5. **Insurance & Tax Trajectory**: Florida insurance market hardening — what does this mean for cashflow projections at this portfolio's price tier? Property tax trajectory by county.

6. **Concentration Risk**: 3+ properties in Clay, 2 in Duval westside. Quantify the geographic and price-tier concentration risk.

7. **Macro Overlay**: How do current Fed policy, mortgage rates, and economic conditions affect properties at this specific price point differently than mid-market or luxury?

## Outlook Horizon: ${request.horizon}
${request.additionalContext ? `\n## Additional Context\n${request.additionalContext}` : ''}${knowledgeContext}

Return a JSON object with this structure:
{
  "marketConditions": {
    "overallSentiment": "bullish" | "neutral" | "bearish",
    "interestRateOutlook": "2-3 sentences on rate trajectory and specific impact on affordable RE investors",
    "localMarketTrend": "3-4 sentences on Jax/Clay/Duval market — housing starts, absorption, price trends by tier",
    "rentalDemand": "2-3 sentences on rental vacancy, demand drivers at $1,100-$1,300 price point, Section 8 dynamics",
    "supplyPipeline": "2-3 sentences on new construction pipeline and affordable housing gap",
    "economicDrivers": ["5-7 specific local economic factors — be specific with employers, infrastructure projects, population stats"],
    "risks": ["5-7 specific risks — not generic, tailored to THIS portfolio's price tier and locations"]
  },
  "propertyRecommendations": [
    YOU MUST INCLUDE EXACTLY ${portfolio.length} ENTRIES — one for each: ${propertyNames.join(', ')}
    {
      "propertyName": "exact name from list above",
      "recommendation": "buy_more" | "hold" | "sell" | "monitor",
      "confidence": "high" | "medium" | "low",
      "rationale": "3-4 sentences with specific market data points supporting this recommendation",
      "riskFactors": ["2-4 specific risks for THIS property at THIS location"],
      "upside": "specific upside scenario with realistic numbers",
      "targetAction": "concrete next step (e.g. get CMA, raise rent to $X, refinance, list at $Y)"
    }
  ],
  "portfolioRecommendation": "2-3 paragraphs: concentration risk assessment, next acquisition profile (what type/location/price would complement this portfolio), timing considerations",
  "outlookSummary": "3-4 paragraphs: executive summary covering macro conditions, local market position, portfolio performance in context, and forward guidance. Written for a family office quarterly review.",
  "allocationContext": {
    "currentAllocation": { "real_estate": 100, "equities": 0, "fixed_income": 0, "commodities": 0, "digital_assets": 0, "cash": 0 },
    "recommendedAllocation": { "real_estate": number, "equities": number, "fixed_income": number, "commodities": number, "digital_assets": number, "cash": number },
    "rebalancingNotes": "2-3 sentences: why this allocation, how to get there, what to do first"
  },
  "knowledgeEntries": [
    generate 4-6 entries with categories from: market_data, property_insight, portfolio_strategy, economic_indicator, asset_allocation, risk_assessment
    {
      "category": "category_name",
      "assetClass": "real_estate" or "mixed",
      "title": "specific title",
      "content": "1-2 paragraphs of actionable insight",
      "tags": ["specific", "tags"],
      "confidence": "high" | "medium" | "low",
      "validMonths": 3 or 6 or 12
    }
  ]
}`

  const response = await generateAiContent(userPrompt, systemPrompt, 12000)

  let cleaned = response.content.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  // Attempt to repair truncated JSON by closing open structures
  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    let repaired = cleaned
    const openBraces = (repaired.match(/{/g) || []).length
    const closeBraces = (repaired.match(/}/g) || []).length
    const openBrackets = (repaired.match(/\[/g) || []).length
    const closeBrackets = (repaired.match(/]/g) || []).length

    // Truncate to last complete entry if in an array
    const lastCompleteObj = repaired.lastIndexOf('}')
    if (lastCompleteObj > 0) {
      repaired = repaired.slice(0, lastCompleteObj + 1)
    }

    // Close unclosed brackets and braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']'
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}'

    parsed = JSON.parse(repaired)
  }

  return {
    marketConditions: parsed.marketConditions,
    propertyRecommendations: parsed.propertyRecommendations ?? [],
    portfolioRecommendation: parsed.portfolioRecommendation ?? '',
    outlookSummary: parsed.outlookSummary ?? '',
    allocationContext: parsed.allocationContext ?? {
      currentAllocation: { real_estate: 100 },
      recommendedAllocation: { real_estate: 60, equities: 20, fixed_income: 10, cash: 10 },
      rebalancingNotes: 'Analysis truncated — allocation data unavailable.',
    },
    knowledgeEntries: parsed.knowledgeEntries ?? [],
    model: response.model,
  }
}
