/**
 * Financial metrics computation.
 * Used by both portfolio-level and per-property dashboards.
 * Data source is always `financial_line_items` — whether imported manually or via QBO API.
 */

export interface FinancialLineItem {
  id: string
  account_name: string
  account_type: string
  amount: number
  period_date: string
  property_id: string | null
}

export interface PortfolioMetrics {
  grossIncome: number
  totalExpenses: number
  totalExpensesExDepreciation: number
  depreciation: number
  noi: number
  noiCash: number
  otherIncome: number
  netIncome: number
  netIncomeCash: number
  operatingExpenseRatio: number
  expenseBreakdown: { name: string; amount: number; pct: number }[]
}

export function computePortfolioMetrics(items: FinancialLineItem[]): PortfolioMetrics {
  let grossIncome = 0
  let otherIncome = 0
  let totalExpenses = 0
  let depreciation = 0
  const expenseMap = new Map<string, number>()

  for (const item of items) {
    const amount = Number(item.amount)
    if (item.account_type === 'income') {
      grossIncome += amount
    } else if (item.account_type === 'other_income') {
      otherIncome += amount
    } else if (item.account_type === 'expense') {
      totalExpenses += amount
      if (item.account_name === 'Depreciation') {
        depreciation += amount
      }
      expenseMap.set(item.account_name, (expenseMap.get(item.account_name) ?? 0) + amount)
    }
  }

  const totalExpensesExDepreciation = totalExpenses - depreciation
  const noi = grossIncome - totalExpenses
  const noiCash = grossIncome - totalExpensesExDepreciation
  const netIncome = noi + otherIncome
  const netIncomeCash = noiCash + otherIncome
  const operatingExpenseRatio = grossIncome > 0 ? totalExpensesExDepreciation / grossIncome : 0

  const expenseBreakdown = Array.from(expenseMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      pct: totalExpenses > 0 ? amount / totalExpenses : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  return {
    grossIncome,
    totalExpenses,
    totalExpensesExDepreciation,
    depreciation,
    noi,
    noiCash,
    otherIncome,
    netIncome,
    netIncomeCash,
    operatingExpenseRatio,
    expenseBreakdown,
  }
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
