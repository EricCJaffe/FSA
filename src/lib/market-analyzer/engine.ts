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

  const systemPrompt = `You are a senior family office investment strategist specializing in Northeast Florida real estate with expertise in multi-asset portfolio management. You provide institutional-quality analysis with actionable recommendations.

You understand:
- Clay County and Duval County FL real estate markets deeply
- Federal Reserve policy and its impact on RE cap rates
- Florida-specific risks (insurance, HOA SB 4-D, hurricanes, flood zones)
- Family office portfolio construction (RE + equities + fixed income + alternatives)
- Risk-adjusted returns and portfolio concentration

You MUST respond with valid JSON only — no markdown, no explanation, no code fences. Just the JSON object.`

  const knowledgeContext = request.existingKnowledge.length > 0
    ? `\n\nPrevious Knowledge Base Entries (use these for continuity):\n${request.existingKnowledge.slice(-10).map((k) => `- ${k}`).join('\n')}`
    : ''

  const userPrompt = `Analyze this real estate portfolio and provide a comprehensive ${request.horizon} market outlook with buy/sell/hold recommendations.

## Portfolio Summary
- Total Properties: ${portfolio.length}
- Total Basis: $${totalBasis.toLocaleString()}
- Total Estimated Value: $${totalValue.toLocaleString()}
- Total Annual Cash Flow: $${totalCashFlow.toLocaleString()}
- Portfolio Avg Cash-on-Cash: ${(avgCoC * 100).toFixed(1)}%
- Unrealized Appreciation: ${appreciation.toFixed(1)}%
- Markets: ${[...new Set(portfolio.map((p) => `${p.county} County`))].join(', ')}

## Individual Properties
${portfolio.map((p) => `- **${p.name}** (${p.type}): ${p.address}
  Basis: $${p.basis.toLocaleString()} | Value: $${p.value.toLocaleString()} | Rent: $${p.monthlyRent.toLocaleString()}/mo | CoC: ${(p.cashOnCash * 100).toFixed(1)}% | ${p.county} County`).join('\n')}

## Analysis Type: ${request.analysisType.replace(/_/g, ' ')}
## Outlook Horizon: ${request.horizon}
${request.additionalContext ? `\n## Additional Context\n${request.additionalContext}` : ''}${knowledgeContext}

Return a JSON object with this exact structure:
{
  "marketConditions": {
    "overallSentiment": "bullish" | "neutral" | "bearish",
    "interestRateOutlook": "narrative about rate trajectory and impact on RE",
    "localMarketTrend": "specific to Jax/Clay/Duval market conditions",
    "rentalDemand": "rental market strength and vacancy trends",
    "supplyPipeline": "new construction and inventory levels",
    "economicDrivers": ["list of 3-5 key economic factors driving the local market"],
    "risks": ["list of 3-5 key risks facing this portfolio"]
  },
  "propertyRecommendations": [
    {
      "propertyName": "exact property name from portfolio",
      "recommendation": "buy_more" | "hold" | "sell" | "monitor",
      "confidence": "high" | "medium" | "low",
      "rationale": "2-3 sentence explanation",
      "riskFactors": ["specific risks for this property"],
      "upside": "potential upside scenario",
      "targetAction": "specific next step if any"
    }
  ],
  "portfolioRecommendation": "2-3 paragraph overall portfolio strategy recommendation including concentration risk, geographic diversification, and optimal next acquisition profile",
  "outlookSummary": "3-4 paragraph executive summary suitable for a family office quarterly review. Include market conditions, portfolio performance context, and forward-looking guidance.",
  "allocationContext": {
    "currentAllocation": {
      "real_estate": percentage of portfolio in RE (use 100 for now since only RE),
      "equities": 0,
      "fixed_income": 0,
      "commodities": 0,
      "digital_assets": 0,
      "cash": 0
    },
    "recommendedAllocation": {
      "real_estate": recommended percentage,
      "equities": recommended percentage,
      "fixed_income": recommended percentage,
      "commodities": recommended percentage,
      "digital_assets": recommended percentage,
      "cash": recommended percentage
    },
    "rebalancingNotes": "explanation of why this allocation and how to get there over time"
  },
  "knowledgeEntries": [
    {
      "category": "market_data" | "property_insight" | "portfolio_strategy" | "economic_indicator" | "asset_allocation" | "risk_assessment",
      "assetClass": "real_estate" | "mixed",
      "title": "concise title for this insight",
      "content": "detailed markdown content (2-4 paragraphs) that will be valuable for future analysis sessions",
      "tags": ["relevant", "searchable", "tags"],
      "confidence": "high" | "medium" | "low",
      "validMonths": number of months this insight remains relevant (3, 6, or 12),
      "propertyName": "property name if property-specific, omit if portfolio-level"
    }
  ]
}

Generate 6-10 knowledge entries covering: market conditions, each property's outlook, portfolio strategy, risk factors, and allocation guidance. These entries build the knowledge base over time.`

  const response = await generateAiContent(userPrompt, systemPrompt)

  let cleaned = response.content.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const parsed = JSON.parse(cleaned)

  return {
    marketConditions: parsed.marketConditions,
    propertyRecommendations: parsed.propertyRecommendations,
    portfolioRecommendation: parsed.portfolioRecommendation,
    outlookSummary: parsed.outlookSummary,
    allocationContext: parsed.allocationContext,
    knowledgeEntries: parsed.knowledgeEntries,
    model: response.model,
  }
}
