'use client'

import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ClipboardList,
  ArrowRightLeft,
  Copy,
  Check,
} from 'lucide-react'
import DealVerdictBadge from './DealVerdictBadge'
import { PORTFOLIO_BASELINE } from '@/lib/deal-analyzer/portfolio-baseline'
import {
  analyzeDeal,
  formatDealCurrency,
  formatDealPercent,
  type PropertyType,
} from '@/lib/deal-analyzer/calculator'

interface DealAnalysis {
  id: string
  property_name: string
  property_address: string
  property_type: string
  year_built: number | null
  beds: number | null
  baths: number | null
  sqft: number | null
  county: string | null
  mls_number: string | null
  list_price: number
  all_in_cost: number
  monthly_rent: number
  hoa_monthly: number
  annual_taxes: number | null
  annual_insurance: number | null
  management_pct: number
  annual_repairs: number | null
  vacancy_pct: number
  computed_noi: number
  computed_cash_on_cash: number
  computed_gross_yield: number
  verdict: string
  verdict_reason: string
  target_offer_price: number | null
  user_notes: string | null
  outcome: string | null
  outcome_notes: string | null
  created_at: string
  updated_at: string
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <Icon className={`h-4 w-4 mb-1 ${color}`} />
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  )
}

export default function DealResults({ analysis }: { analysis: DealAnalysis }) {
  const [copied, setCopied] = useState(false)

  // Re-run calculator to get full result (scenarios, warnings, DD)
  const result = analyzeDeal({
    propertyType: analysis.property_type as PropertyType,
    allInCost: analysis.all_in_cost,
    monthlyRent: analysis.monthly_rent,
    hoaMonthly: analysis.hoa_monthly,
    annualTaxes: analysis.annual_taxes,
    annualInsurance: analysis.annual_insurance,
    managementPct: Number(analysis.management_pct),
    annualRepairs: analysis.annual_repairs,
    vacancyPct: Number(analysis.vacancy_pct),
    yearBuilt: analysis.year_built,
    county: analysis.county,
  })

  function buildMarkdown(): string {
    const lines = [
      `# Deal Analysis: ${analysis.property_name}`,
      `**Address:** ${analysis.property_address}`,
      `**Type:** ${analysis.property_type.toUpperCase()} | **Year Built:** ${analysis.year_built ?? 'N/A'}`,
      analysis.beds || analysis.baths || analysis.sqft
        ? `**${analysis.beds ?? '—'} bed / ${analysis.baths ?? '—'} bath / ${analysis.sqft?.toLocaleString() ?? '—'} sqft**`
        : '',
      '',
      `## Verdict: ${analysis.verdict.replace(/_/g, ' ').toUpperCase()}`,
      analysis.verdict_reason,
      '',
      `## Key Metrics`,
      `| Metric | Value |`,
      `|---|---|`,
      `| All-In Cost | ${formatDealCurrency(analysis.all_in_cost)} |`,
      `| Monthly Rent | ${formatDealCurrency(analysis.monthly_rent)} |`,
      `| Annual NOI | ${formatDealCurrency(result.noi)} |`,
      `| Cash-on-Cash | ${formatDealPercent(result.cashOnCash)} |`,
      `| Gross Yield | ${formatDealPercent(result.grossYield)} |`,
      analysis.target_offer_price
        ? `| Target Offer | ${formatDealCurrency(analysis.target_offer_price)} |`
        : '',
      '',
      `## Operating Expenses`,
      `| Expense | Annual |`,
      `|---|---|`,
      `| HOA | ${formatDealCurrency(result.annualHOA)} |`,
      `| Taxes | ${formatDealCurrency(result.annualTaxes)}${result.taxesEstimated ? ' (est.)' : ''} |`,
      `| Insurance | ${formatDealCurrency(result.annualInsurance)}${result.insuranceEstimated ? ' (est.)' : ''} |`,
      `| Management | ${formatDealCurrency(result.annualMgmt)} |`,
      `| Repairs | ${formatDealCurrency(result.annualRepairs)}${result.repairsEstimated ? ' (est.)' : ''} |`,
      `| Vacancy | ${formatDealCurrency(result.annualVacancy)} |`,
      `| **Total** | **${formatDealCurrency(result.totalExpenses)}** |`,
      '',
      `## Sensitivity Scenarios`,
      ...result.scenarios.map(
        (s) => `- **${s.name}:** ${formatDealPercent(s.cashOnCash)} CoC`
      ),
      '',
      `---`,
      `*Generated ${new Date(analysis.created_at).toLocaleDateString()}*`,
    ]
    return lines.filter((l) => l !== '').join('\n')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildMarkdown())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const portfolioProps = PORTFOLIO_BASELINE.properties

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <DealVerdictBadge verdict={analysis.verdict} size="lg" />
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors print:hidden"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Markdown
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-700">{analysis.verdict_reason}</p>
        {analysis.target_offer_price && (
          <p className="mt-2 text-sm font-medium text-blue-700">
            Target offer: {formatDealCurrency(analysis.target_offer_price)}
          </p>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Annual NOI"
          value={formatDealCurrency(result.noi)}
          icon={DollarSign}
          color={result.noi >= 0 ? 'text-emerald-500' : 'text-red-500'}
        />
        <MetricCard
          label="Cash-on-Cash"
          value={formatDealPercent(result.cashOnCash)}
          icon={TrendingUp}
          color="text-blue-500"
        />
        <MetricCard
          label="Gross Yield"
          value={formatDealPercent(result.grossYield)}
          icon={BarChart3}
          color="text-violet-500"
        />
        <MetricCard
          label="Portfolio Avg CoC"
          value={formatDealPercent(PORTFOLIO_BASELINE.portfolioAvgCashOnCash)}
          icon={ArrowRightLeft}
          color="text-gray-400"
        />
      </div>

      {/* Operating Expenses Table */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Operating Expenses
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-500 font-medium">Expense</th>
              <th className="text-right py-2 text-gray-500 font-medium">Annual</th>
              <th className="text-right py-2 text-gray-500 font-medium">Monthly</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Gross Rent', annual: result.annualRent, highlight: true },
              { name: 'HOA', annual: -result.annualHOA },
              {
                name: `Taxes${result.taxesEstimated ? ' (est.)' : ''}`,
                annual: -result.annualTaxes,
              },
              {
                name: `Insurance${result.insuranceEstimated ? ' (est.)' : ''}`,
                annual: -result.annualInsurance,
              },
              {
                name: `Management (${formatDealPercent(Number(analysis.management_pct))})`,
                annual: -result.annualMgmt,
              },
              {
                name: `Repairs${result.repairsEstimated ? ' (est.)' : ''}`,
                annual: -result.annualRepairs,
              },
              {
                name: `Vacancy (${formatDealPercent(Number(analysis.vacancy_pct))})`,
                annual: -result.annualVacancy,
              },
            ].map((row) => (
              <tr
                key={row.name}
                className={`border-b border-gray-50 ${row.highlight ? 'font-medium' : ''}`}
              >
                <td className="py-2 text-gray-700">{row.name}</td>
                <td className={`py-2 text-right ${row.annual < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDealCurrency(Math.abs(row.annual))}
                </td>
                <td className={`py-2 text-right ${row.annual < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDealCurrency(Math.abs(Math.round(row.annual / 12)))}
                </td>
              </tr>
            ))}
            <tr className="font-semibold border-t-2 border-gray-200">
              <td className="py-2 text-gray-900">Net Operating Income</td>
              <td className={`py-2 text-right ${result.noi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatDealCurrency(result.noi)}
              </td>
              <td className={`py-2 text-right ${result.noi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatDealCurrency(Math.round(result.noi / 12))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Portfolio Comparison */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Portfolio Comparison
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-500 font-medium">Property</th>
              <th className="text-right py-2 text-gray-500 font-medium">Basis</th>
              <th className="text-right py-2 text-gray-500 font-medium">Rent/mo</th>
              <th className="text-right py-2 text-gray-500 font-medium">Cash Flow</th>
              <th className="text-right py-2 text-gray-500 font-medium">CoC</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-blue-100 bg-blue-50/50 font-medium">
              <td className="py-2 text-blue-700">
                {analysis.property_name}
                <span className="text-[11px] text-blue-400 ml-1">(candidate)</span>
              </td>
              <td className="py-2 text-right text-blue-700">
                {formatDealCurrency(analysis.all_in_cost)}
              </td>
              <td className="py-2 text-right text-blue-700">
                {formatDealCurrency(analysis.monthly_rent)}
              </td>
              <td className="py-2 text-right text-blue-700">
                {formatDealCurrency(result.noi)}
              </td>
              <td className="py-2 text-right text-blue-700">
                {formatDealPercent(result.cashOnCash)}
              </td>
            </tr>
            {portfolioProps.map((p) => (
              <tr key={p.name} className="border-b border-gray-50">
                <td className="py-2 text-gray-700">{p.name}</td>
                <td className="py-2 text-right text-gray-600">
                  {formatDealCurrency(p.basis)}
                </td>
                <td className="py-2 text-right text-gray-600">
                  {formatDealCurrency(p.monthlyRent)}
                </td>
                <td className="py-2 text-right text-gray-600">
                  {formatDealCurrency(p.annualCashFlow)}
                </td>
                <td className="py-2 text-right text-gray-600">
                  {formatDealPercent(p.cashOnCash)}
                </td>
              </tr>
            ))}
            <tr className="font-semibold border-t-2 border-gray-200">
              <td className="py-2 text-gray-900">Portfolio Average</td>
              <td className="py-2 text-right text-gray-600">
                {formatDealCurrency(PORTFOLIO_BASELINE.totalBasis / 4)}
              </td>
              <td className="py-2 text-right text-gray-400">—</td>
              <td className="py-2 text-right text-gray-600">
                {formatDealCurrency(PORTFOLIO_BASELINE.totalAnnualCashFlow / 4)}
              </td>
              <td className="py-2 text-right text-gray-600">
                {formatDealPercent(PORTFOLIO_BASELINE.portfolioAvgCashOnCash)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sensitivity Scenarios */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Sensitivity Scenarios
        </h3>
        <div className="space-y-2">
          {result.scenarios.map((s) => {
            const barWidth = Math.max(
              Math.min(((s.cashOnCash + 0.02) / 0.12) * 100, 100),
              2
            )
            const barColor =
              s.severity === 'best'
                ? 'bg-emerald-400'
                : s.severity === 'worst'
                  ? 'bg-red-400'
                  : 'bg-blue-400'

            return (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{s.name}</span>
                  <span
                    className={`font-medium ${
                      s.cashOnCash < 0.035
                        ? 'text-red-600'
                        : s.cashOnCash >= PORTFOLIO_BASELINE.portfolioAvgCashOnCash
                          ? 'text-emerald-600'
                          : 'text-gray-900'
                    }`}
                  >
                    {formatDealPercent(s.cashOnCash)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          Portfolio average: {formatDealPercent(PORTFOLIO_BASELINE.portfolioAvgCashOnCash)} | Treasury floor: 3.5%
        </p>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              Warnings
            </h3>
          </div>
          <ul className="space-y-2">
            {result.warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-800">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Due Diligence */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-4 w-4 text-gray-400" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Due Diligence Checklist
          </h3>
        </div>
        <div className="space-y-5">
          {Object.entries(result.dueDiligence).map(([category, questions]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {category}
              </h4>
              <ul className="space-y-1.5">
                {questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-gray-300 mt-0.5">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
