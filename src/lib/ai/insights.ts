/**
 * AI Insights generation and persistence.
 */

import { createClient } from '@/lib/supabase/server'
import { generateAiContent } from './client'
import {
  propertyHealthPrompt,
  anomalyDetectionPrompt,
  portfolioNarrativePrompt,
  holdSellPrompt,
} from './prompts'
import type { PropertyMetrics, PortfolioMetrics } from '@/lib/financial/metrics'
import { createHash } from 'crypto'

type InsightType =
  | 'property_health'
  | 'anomaly_flag'
  | 'monthly_narrative'
  | 'hold_sell_recommendation'
  | 'portfolio_observation'

function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex').slice(0, 16)
}

async function saveInsight(params: {
  orgId: string
  propertyId: string | null
  reportId: string | null
  insightType: InsightType
  content: string
  model: string
  promptHash: string
  contextJson: object
  severity?: number
  anomalyType?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('ai_insights').insert({
    org_id: params.orgId,
    property_id: params.propertyId,
    report_id: params.reportId,
    insight_type: params.insightType,
    anomaly_type: params.anomalyType ?? null,
    content: params.content,
    model_used: params.model,
    prompt_hash: params.promptHash,
    context_json: params.contextJson,
    severity: params.severity ?? null,
  })

  if (error) {
    console.error('Failed to save insight:', error)
    throw new Error(`Failed to save insight: ${error.message}`)
  }
}

/**
 * Generate a property health summary.
 */
export async function generatePropertyHealth(
  orgId: string,
  metrics: PropertyMetrics
): Promise<{ content: string; model: string }> {
  const { system, user } = propertyHealthPrompt(metrics)
  const result = await generateAiContent(user, system)

  await saveInsight({
    orgId,
    propertyId: metrics.propertyId,
    reportId: null,
    insightType: 'property_health',
    content: result.content,
    model: result.model,
    promptHash: hashPrompt(user),
    contextJson: {
      grossIncome: metrics.grossIncome,
      noiCash: metrics.noiCash,
      capRate: metrics.capRate,
      oer: metrics.operatingExpenseRatio,
    },
  })

  return result
}

/**
 * Run anomaly detection on a property.
 */
export async function generateAnomalyDetection(
  orgId: string,
  metrics: PropertyMetrics
): Promise<{ content: string; model: string }> {
  const { system, user } = anomalyDetectionPrompt(metrics)
  const result = await generateAiContent(user, system)

  await saveInsight({
    orgId,
    propertyId: metrics.propertyId,
    reportId: null,
    insightType: 'anomaly_flag',
    content: result.content,
    model: result.model,
    promptHash: hashPrompt(user),
    contextJson: {
      grossIncome: metrics.grossIncome,
      expenses: metrics.expenseBreakdown,
      oer: metrics.operatingExpenseRatio,
    },
  })

  return result
}

/**
 * Generate a portfolio monthly narrative.
 */
export async function generatePortfolioNarrative(
  orgId: string,
  portfolio: PortfolioMetrics,
  propertyMetrics: PropertyMetrics[],
  period: string,
  reportId: string | null
): Promise<{ content: string; model: string }> {
  const { system, user } = portfolioNarrativePrompt(portfolio, propertyMetrics, period)
  const result = await generateAiContent(user, system)

  await saveInsight({
    orgId,
    propertyId: null,
    reportId,
    insightType: 'monthly_narrative',
    content: result.content,
    model: result.model,
    promptHash: hashPrompt(user),
    contextJson: {
      period,
      grossIncome: portfolio.grossIncome,
      noiCash: portfolio.noiCash,
      propertyCount: propertyMetrics.length,
    },
  })

  return result
}

/**
 * Generate a hold/sell recommendation for a property.
 */
export async function generateHoldSellAnalysis(
  orgId: string,
  metrics: PropertyMetrics
): Promise<{ content: string; model: string }> {
  const { system, user } = holdSellPrompt(metrics)
  const result = await generateAiContent(user, system)

  await saveInsight({
    orgId,
    propertyId: metrics.propertyId,
    reportId: null,
    insightType: 'hold_sell_recommendation',
    content: result.content,
    model: result.model,
    promptHash: hashPrompt(user),
    contextJson: {
      noiCash: metrics.noiCash,
      capRate: metrics.capRate,
      equity: metrics.equity,
      marketValue: metrics.currentMarketValue,
    },
  })

  return result
}

/**
 * Generate all insights for a property (health + anomaly + hold/sell).
 */
export async function generateAllPropertyInsights(
  orgId: string,
  metrics: PropertyMetrics
): Promise<{
  health: { content: string; model: string }
  anomaly: { content: string; model: string }
  holdSell: { content: string; model: string }
}> {
  const [health, anomaly, holdSell] = await Promise.all([
    generatePropertyHealth(orgId, metrics),
    generateAnomalyDetection(orgId, metrics),
    generateHoldSellAnalysis(orgId, metrics),
  ])

  return { health, anomaly, holdSell }
}
