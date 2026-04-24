import { PORTFOLIO_BASELINE } from './portfolio-baseline'

export type PropertyType = 'sfh' | 'townhouse' | 'condo' | 'duplex' | 'multifamily'

export type Verdict =
  | 'strong_recommend'
  | 'recommend'
  | 'negotiate'
  | 'negotiate_marginal'
  | 'pass'
  | 'hard_pass'

export interface DealInputs {
  propertyType: PropertyType
  allInCost: number
  monthlyRent: number
  hoaMonthly: number
  annualTaxes?: number | null
  annualInsurance?: number | null
  managementPct: number
  annualRepairs?: number | null
  vacancyPct: number
  yearBuilt?: number | null
  county?: string | null
}

export interface DealResult {
  annualRent: number
  annualHOA: number
  annualTaxes: number
  annualInsurance: number
  annualMgmt: number
  annualRepairs: number
  annualVacancy: number
  totalExpenses: number
  noi: number
  cashOnCash: number
  grossYield: number
  verdict: Verdict
  verdictReason: string
  targetOfferPrice: number | null
  scenarios: Scenario[]
  warnings: string[]
  dueDiligence: Record<string, string[]>
  taxesEstimated: boolean
  insuranceEstimated: boolean
  repairsEstimated: boolean
}

export interface Scenario {
  name: string
  cashOnCash: number
  severity: 'best' | 'neutral' | 'worst'
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function estimateTaxes(allInCost: number): number {
  return Math.round(allInCost * 0.011)
}

function estimateInsurance(propertyType: PropertyType): number {
  switch (propertyType) {
    case 'sfh':
      return 1500
    case 'townhouse':
    case 'condo':
      return 800
    case 'duplex':
    case 'multifamily':
      return 2000
    default:
      return 1200
  }
}

function estimateRepairs(hoaMonthly: number): number {
  return hoaMonthly > 100 ? 800 : 1500
}

function getVerdict(
  noi: number,
  coc: number,
  portfolioAvg: number
): { verdict: Verdict; reason: string; targetOfferPrice: number | null } {
  if (noi < 0) {
    return {
      verdict: 'hard_pass',
      reason: `Negative cash flow in base case. NOI of ${fmt(noi)}/yr means this loses money even before considering downside scenarios.`,
      targetOfferPrice: null,
    }
  }

  if (coc < 0.035) {
    return {
      verdict: 'hard_pass',
      reason: `Cash-on-cash of ${pct(coc)} is below treasury rates. Money is better elsewhere.`,
      targetOfferPrice: null,
    }
  }

  if (coc < portfolioAvg - 0.015) {
    const targetAllIn = Math.round(noi / portfolioAvg)
    return {
      verdict: 'negotiate',
      reason: `Cash-on-cash of ${pct(coc)} is ${pct(portfolioAvg - coc)} below portfolio average. At ${fmt(targetAllIn)} all-in, this matches portfolio performance.`,
      targetOfferPrice: targetAllIn,
    }
  }

  if (coc < portfolioAvg) {
    const targetAllIn = Math.round(noi / portfolioAvg)
    return {
      verdict: 'negotiate_marginal',
      reason: `Cash-on-cash of ${pct(coc)} is slightly below portfolio average. Negotiate toward ${fmt(targetAllIn)} for a clear win.`,
      targetOfferPrice: targetAllIn,
    }
  }

  if (coc < 0.07) {
    return {
      verdict: 'recommend',
      reason: `Cash-on-cash of ${pct(coc)} is at or above portfolio average. Sound deal at listed terms.`,
      targetOfferPrice: null,
    }
  }

  return {
    verdict: 'strong_recommend',
    reason: `Cash-on-cash of ${pct(coc)} materially beats portfolio average. Move quickly.`,
    targetOfferPrice: null,
  }
}

function buildScenarios(
  annualRent: number,
  annualHOA: number,
  annualTaxes: number,
  annualInsurance: number,
  annualMgmt: number,
  annualRepairs: number,
  annualVacancy: number,
  totalExpenses: number,
  allInCost: number,
  hoaMonthly: number,
  coc: number
): Scenario[] {
  return [
    {
      name: 'Base case',
      cashOnCash: coc,
      severity: 'neutral' as const,
    },
    {
      name: hoaMonthly > 100 ? 'HOA +10%/yr, year 5' : 'Expenses +15%',
      cashOnCash:
        hoaMonthly > 100
          ? (annualRent * 1.025 ** 5 -
              (annualHOA * 1.1 ** 5 +
                annualTaxes * 1.15 +
                annualInsurance * 1.4 +
                annualMgmt * 1.13 +
                annualRepairs * 1.15 +
                annualVacancy)) /
            allInCost
          : (annualRent - totalExpenses * 1.15) / allInCost,
      severity: 'worst' as const,
    },
    {
      name: 'Rent softens 10% (recession)',
      cashOnCash: (annualRent * 0.9 - totalExpenses) / allInCost,
      severity: 'worst' as const,
    },
    {
      name: 'Vacancy doubles to 10%',
      cashOnCash:
        (annualRent * 0.9 - (totalExpenses - annualVacancy + annualRent * 0.1)) /
        allInCost,
      severity: 'worst' as const,
    },
    {
      name: 'Rent grows 5%, expenses flat',
      cashOnCash: (annualRent * 1.05 - totalExpenses) / allInCost,
      severity: 'best' as const,
    },
  ]
}

function buildWarnings(inputs: DealInputs, taxesEstimated: boolean, insuranceEstimated: boolean, repairsEstimated: boolean): string[] {
  const warnings: string[] = []

  if (insuranceEstimated) {
    const est = estimateInsurance(inputs.propertyType)
    warnings.push(
      `Insurance auto-estimated at ${fmt(est)}/yr for ${inputs.propertyType.toUpperCase()}. Get 2-3 actual quotes before closing.`
    )
  }

  if (taxesEstimated) {
    warnings.push(
      'Property tax auto-estimated at 1.1% of value. Verify with county records.'
    )
  }

  if (repairsEstimated) {
    warnings.push(
      'Repairs auto-estimated based on HOA presence. Adjust for specific condition.'
    )
  }

  if (inputs.hoaMonthly > 200) {
    warnings.push(
      'HOA is significant. Florida SB 4-D environment means HOA fees growing 10%+/yr. Get reserve study.'
    )
  }

  if (inputs.county?.toLowerCase() === 'clay') {
    warnings.push(
      'Portfolio already has 3 properties in Clay County. Adds to concentration risk.'
    )
  }

  return warnings
}

function buildDueDiligenceQuestions(inputs: DealInputs): Record<string, string[]> {
  const questions: Record<string, string[]> = {}

  if (inputs.hoaMonthly > 0) {
    questions['HOA Due Diligence'] = [
      'Get current reserve study — what are reserve balances?',
      'Any pending special assessments? Any in past 3 years?',
      'HOA fee history — what was it 3 years ago? 5 years ago? Calculate CAGR.',
      'Last major capital items replaced (roof, paint, parking, pool)?',
      "What's scheduled in next 5 years?",
      'Current operating budget — surplus or deficit?',
      'Owner-occupancy ratio (investor-heavy = risk)?',
      'Any current litigation?',
      ...(inputs.propertyType === 'condo'
        ? ['SB 4-D milestone inspection status?']
        : []),
      'Exactly what does HOA include? Get statement of services.',
    ]
  }

  questions['Property-Level'] = [
    'HVAC age and condition?',
    `Roof age${inputs.hoaMonthly > 0 ? ' (HOA responsibility but affects future assessments)' : ''}?`,
    'Plumbing — any known issues? Slab leak history in area?',
    ...(inputs.yearBuilt && inputs.yearBuilt < 2005
      ? ['Windows likely original — impact rating?']
      : ['Window condition?']),
    'Interior condition — paint, flooring, appliances age?',
  ]

  questions['Market'] = [
    'Recent sold comps in this specific neighborhood — $/sqft?',
    `Is $${inputs.monthlyRent.toLocaleString()}/mo rent validated by recent leases nearby?`,
    'Days on market for this listing — how long has it been listed?',
    'Why is seller motivated? What is their story?',
    'Property manager coverage — who would manage this?',
  ]

  questions['Financial Validation'] = [
    `Get ${inputs.annualInsurance ? 'additional' : ''} insurance quotes from 2-3 carriers`,
    'Verify tax history — any CDD fees, special districts?',
    'Estimated closing costs (title, inspection, HOA transfer fees)',
    'Expected time to rent after close — what vacancy period to budget?',
  ]

  return questions
}

export function analyzeDeal(inputs: DealInputs): DealResult {
  const taxesEstimated = inputs.annualTaxes == null
  const insuranceEstimated = inputs.annualInsurance == null
  const repairsEstimated = inputs.annualRepairs == null

  const annualTaxes = inputs.annualTaxes ?? estimateTaxes(inputs.allInCost)
  const annualInsurance =
    inputs.annualInsurance ?? estimateInsurance(inputs.propertyType)
  const annualRepairs =
    inputs.annualRepairs ?? estimateRepairs(inputs.hoaMonthly)

  const annualRent = inputs.monthlyRent * 12
  const annualHOA = inputs.hoaMonthly * 12
  const annualMgmt = Math.round(annualRent * inputs.managementPct)
  const annualVacancy = Math.round(annualRent * inputs.vacancyPct)

  const totalExpenses =
    annualHOA +
    annualTaxes +
    annualInsurance +
    annualMgmt +
    annualRepairs +
    annualVacancy

  const noi = annualRent - totalExpenses
  const cashOnCash = noi / inputs.allInCost
  const grossYield = annualRent / inputs.allInCost

  const portfolioAvg = PORTFOLIO_BASELINE.portfolioAvgCashOnCash
  const { verdict, reason, targetOfferPrice } = getVerdict(
    noi,
    cashOnCash,
    portfolioAvg
  )

  const scenarios = buildScenarios(
    annualRent,
    annualHOA,
    annualTaxes,
    annualInsurance,
    annualMgmt,
    annualRepairs,
    annualVacancy,
    totalExpenses,
    inputs.allInCost,
    inputs.hoaMonthly,
    cashOnCash
  )

  const warnings = buildWarnings(inputs, taxesEstimated, insuranceEstimated, repairsEstimated)
  const dueDiligence = buildDueDiligenceQuestions(inputs)

  return {
    annualRent,
    annualHOA,
    annualTaxes,
    annualInsurance,
    annualMgmt,
    annualRepairs,
    annualVacancy,
    totalExpenses,
    noi,
    cashOnCash,
    grossYield,
    verdict,
    verdictReason: reason,
    targetOfferPrice,
    scenarios,
    warnings,
    dueDiligence,
    taxesEstimated,
    insuranceEstimated,
    repairsEstimated,
  }
}

export function formatDealCurrency(value: number): string {
  return fmt(value)
}

export function formatDealPercent(value: number): string {
  return pct(value)
}
