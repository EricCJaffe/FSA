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

export interface PropertyMetrics extends PortfolioMetrics {
  propertyId: string
  propertyName: string
  propertyType: 'ltr' | 'str'
  // Investment metrics (require property-level data)
  purchasePrice: number | null
  currentMarketValue: number | null
  mortgageBalance: number | null
  equity: number | null
  capRate: number | null          // NOI / Market Value
  cashOnCash: number | null       // NOI cash / Total Cash Invested (approx equity)
  dscr: number | null             // NOI / Annual Debt Service
  grm: number | null              // Market Value / Gross Annual Income
}

export function computePropertyMetrics(
  items: FinancialLineItem[],
  property: {
    id: string
    name: string
    property_type: 'ltr' | 'str'
    purchase_price: number | null
    current_market_value: number | null
    mortgage_balance: number | null
    mortgage_payment: number | null
  }
): PropertyMetrics {
  const base = computePortfolioMetrics(items)

  const marketValue = property.current_market_value ? Number(property.current_market_value) : null
  const mortgageBalance = property.mortgage_balance ? Number(property.mortgage_balance) : null
  const mortgagePayment = property.mortgage_payment ? Number(property.mortgage_payment) : null
  const purchasePrice = property.purchase_price ? Number(property.purchase_price) : null

  const equity = marketValue != null && mortgageBalance != null
    ? marketValue - mortgageBalance
    : marketValue

  const capRate = marketValue && base.noiCash
    ? base.noiCash / marketValue
    : null

  const cashOnCash = equity && equity > 0 && base.noiCash
    ? base.noiCash / equity
    : null

  const annualDebtService = mortgagePayment ? mortgagePayment * 12 : null
  const dscr = annualDebtService && annualDebtService > 0 && base.noiCash
    ? base.noiCash / annualDebtService
    : null

  const grm = marketValue && base.grossIncome > 0
    ? marketValue / base.grossIncome
    : null

  return {
    ...base,
    propertyId: property.id,
    propertyName: property.name,
    propertyType: property.property_type,
    purchasePrice: purchasePrice,
    currentMarketValue: marketValue,
    mortgageBalance: mortgageBalance,
    equity,
    capRate,
    cashOnCash,
    dscr,
    grm,
  }
}

/**
 * Group financial line items by property, computing metrics for each.
 */
export function computeAllPropertyMetrics(
  items: FinancialLineItem[],
  properties: {
    id: string
    name: string
    property_type: 'ltr' | 'str'
    purchase_price: number | null
    current_market_value: number | null
    mortgage_balance: number | null
    mortgage_payment: number | null
  }[]
): PropertyMetrics[] {
  return properties.map((property) => {
    const propertyItems = items.filter((i) => i.property_id === property.id)
    return computePropertyMetrics(propertyItems, property)
  })
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
