/**
 * AI prompt templates for property intelligence insights.
 */

import type { PropertyMetrics, PortfolioMetrics } from '@/lib/financial/metrics'

const SYSTEM_PROMPT = `You are a property investment analyst for a family office managing a small portfolio of rental properties in Jacksonville, FL. You provide concise, actionable insights about property financial performance. Be direct and specific — cite actual numbers. Keep responses under 300 words unless asked for more detail.`

export function propertyHealthPrompt(metrics: PropertyMetrics): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPT,
    user: `Analyze the financial health of this property and provide a brief health summary:

Property: ${metrics.propertyName}
Type: ${metrics.propertyType === 'ltr' ? 'Long-term rental' : 'Short-term rental'}
Market Value: ${metrics.currentMarketValue ? `$${metrics.currentMarketValue.toLocaleString()}` : 'Unknown'}
Mortgage Balance: ${metrics.mortgageBalance ? `$${metrics.mortgageBalance.toLocaleString()}` : 'None'}
Equity: ${metrics.equity ? `$${metrics.equity.toLocaleString()}` : 'Unknown'}

Annual Financials:
- Gross Rental Income: $${metrics.grossIncome.toLocaleString()}
- Operating Expenses (excl. depreciation): $${metrics.totalExpensesExDepreciation.toLocaleString()}
- NOI (Cash Basis): $${metrics.noiCash.toLocaleString()}
- Depreciation: $${metrics.depreciation.toLocaleString()}

Key Metrics:
- Cap Rate: ${metrics.capRate ? (metrics.capRate * 100).toFixed(1) + '%' : 'N/A'}
- Cash-on-Cash Return: ${metrics.cashOnCash ? (metrics.cashOnCash * 100).toFixed(1) + '%' : 'N/A'}
- DSCR: ${metrics.dscr ? metrics.dscr.toFixed(2) + 'x' : 'N/A'}
- OER: ${(metrics.operatingExpenseRatio * 100).toFixed(1)}%
- GRM: ${metrics.grm ? metrics.grm.toFixed(1) + 'x' : 'N/A'}

Expense Breakdown:
${metrics.expenseBreakdown.map((e) => `- ${e.name}: $${e.amount.toLocaleString()} (${(e.pct * 100).toFixed(1)}%)`).join('\n')}

Provide:
1. Overall health assessment (1-2 sentences)
2. Top strength
3. Top concern or area to watch
4. One actionable recommendation`,
  }
}

export function anomalyDetectionPrompt(metrics: PropertyMetrics): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPT + `\n\nYou are also an anomaly detection specialist. Flag any unusual patterns — compare metrics to typical Jacksonville rental market benchmarks. Types of anomalies: point (one-off spike), contextual (unusual for this property type), structural (persistent trend).`,
    user: `Review these financials for anomalies:

Property: ${metrics.propertyName} (${metrics.propertyType === 'ltr' ? 'LTR' : 'STR'})

- Gross Income: $${metrics.grossIncome.toLocaleString()}
- NOI (Cash): $${metrics.noiCash.toLocaleString()}
- OER: ${(metrics.operatingExpenseRatio * 100).toFixed(1)}%
- Cap Rate: ${metrics.capRate ? (metrics.capRate * 100).toFixed(1) + '%' : 'N/A'}

Expenses:
${metrics.expenseBreakdown.map((e) => `- ${e.name}: $${e.amount.toLocaleString()}`).join('\n')}

For each anomaly found, provide:
- Type: point / contextual / structural
- Severity: 1 (low) to 5 (critical)
- What: describe the anomaly
- Why it matters: one sentence

If no significant anomalies, say so briefly.`,
  }
}

export function portfolioNarrativePrompt(
  portfolio: PortfolioMetrics,
  propertyMetrics: PropertyMetrics[],
  period: string
): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPT + `\n\nYou are writing a monthly portfolio narrative for the family office principal. Be professional but readable — this is an executive summary, not a detailed report.`,
    user: `Write a monthly narrative summary for the portfolio for ${period}.

Portfolio Overview:
- ${propertyMetrics.length} properties (${propertyMetrics.filter(p => p.propertyType === 'ltr').length} LTR, ${propertyMetrics.filter(p => p.propertyType === 'str').length} STR)
- Gross Rental Income: $${portfolio.grossIncome.toLocaleString()}
- Operating Expenses: $${portfolio.totalExpensesExDepreciation.toLocaleString()}
- NOI (Cash): $${portfolio.noiCash.toLocaleString()}
- OER: ${(portfolio.operatingExpenseRatio * 100).toFixed(1)}%
- Net Income (GAAP): $${portfolio.netIncome.toLocaleString()}

Per-Property Summary:
${propertyMetrics.map((p) => `- ${p.propertyName} (${p.propertyType.toUpperCase()}): Income $${p.grossIncome.toLocaleString()}, NOI $${p.noiCash.toLocaleString()}, OER ${(p.operatingExpenseRatio * 100).toFixed(1)}%`).join('\n')}

Top Expense Categories:
${portfolio.expenseBreakdown.slice(0, 5).map((e) => `- ${e.name}: $${e.amount.toLocaleString()}`).join('\n')}

Write a 200-300 word executive narrative covering:
1. Portfolio performance summary
2. Notable property-level highlights or concerns
3. Key expense trends
4. Forward-looking outlook or recommendations`,
  }
}

export function holdSellPrompt(metrics: PropertyMetrics): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPT + `\n\nYou are providing a hold/sell analysis. Be balanced and consider both financial metrics and market context. Always note that this is analytical input, not investment advice.`,
    user: `Provide a hold/sell analysis for:

Property: ${metrics.propertyName} (${metrics.propertyType === 'ltr' ? 'LTR' : 'STR'}, Jacksonville FL)
Market Value: ${metrics.currentMarketValue ? `$${metrics.currentMarketValue.toLocaleString()}` : 'Unknown'}
Equity: ${metrics.equity ? `$${metrics.equity.toLocaleString()}` : 'Unknown'}
NOI (Cash): $${metrics.noiCash.toLocaleString()}
Cap Rate: ${metrics.capRate ? (metrics.capRate * 100).toFixed(1) + '%' : 'N/A'}
Cash-on-Cash: ${metrics.cashOnCash ? (metrics.cashOnCash * 100).toFixed(1) + '%' : 'N/A'}
OER: ${(metrics.operatingExpenseRatio * 100).toFixed(1)}%

Provide:
1. Hold case (2-3 points)
2. Sell case (2-3 points)
3. Recommendation with confidence level (Low/Medium/High)

Note: This is analytical input for the property owner, not investment advice.`,
  }
}

export { SYSTEM_PROMPT }
