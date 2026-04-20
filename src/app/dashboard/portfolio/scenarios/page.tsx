import { TrendingUp, CheckCircle2, RotateCcw, XCircle, Star } from 'lucide-react'

const STARTING_NET_WORTH = 1_089_000

type Scenario = {
  num: number
  label: string
  description: string
  reversible: boolean
  recommended: boolean
  y5NetWorth: number
  y10NetWorth: number
  y20NetWorth: number
  y20Multiple: number
  missionScore: number
  missionRank: number
  y5CashFlow: number
}

const SCENARIOS: Scenario[] = [
  {
    num: 1,
    label: 'Status Quo',
    description: 'Keep all 5 properties; Scenic continues as STR',
    reversible: true,
    recommended: false,
    y5NetWorth: 1_346_469,
    y10NetWorth: 1_752_262,
    y20NetWorth: 2_679_234,
    y20Multiple: 2.460,
    missionScore: 3.30,
    missionRank: 4,
    y5CashFlow: 17_368,
  },
  {
    num: 2,
    label: 'LTR Convert',
    description: 'Keep all 5; convert Scenic from STR to LTR at $3K/mo',
    reversible: true,
    recommended: false,
    y5NetWorth: 1_513_293,
    y10NetWorth: 2_020_056,
    y20NetWorth: 3_214_821,
    y20Multiple: 2.952,
    missionScore: 4.15,
    missionRank: 3,
    y5CashFlow: 46_217,
  },
  {
    num: 3,
    label: 'Sell Scenic + S&P 500',
    description: 'Sell Scenic (~$441K net); deploy proceeds to S&P 500',
    reversible: false,
    recommended: false,
    y5NetWorth: 1_507_297,
    y10NetWorth: 2_133_425,
    y20NetWorth: 4_086_388,
    y20Multiple: 3.752,
    missionScore: 4.35,
    missionRank: 1,
    y5CashFlow: 30_779,
  },
  {
    num: 4,
    label: 'Sell Scenic + Buy Beach House/Condo',
    description: 'Sell Scenic (~$441K net); buy $700K Jax Beach property with $300K down',
    reversible: false,
    recommended: false,
    y5NetWorth: 1_322_836,
    y10NetWorth: 0,
    y20NetWorth: 0,
    y20Multiple: 0,
    missionScore: 2.90,
    missionRank: 5,
    y5CashFlow: -42_316,
  },
  {
    num: 5,
    label: 'Sell Scenic + Buy Mountain STR',
    description: 'Sell Scenic (~$441K net); buy $600K Smokies cabin with $250K down',
    reversible: false,
    recommended: false,
    y5NetWorth: 1_640_755,
    y10NetWorth: 0,
    y20NetWorth: 0,
    y20Multiple: 0,
    missionScore: 2.55,
    missionRank: 6,
    y5CashFlow: 19_252,
  },
  {
    num: 6,
    label: 'LTR Convert + S&P Stack',
    description: 'Convert Scenic to LTR + auto-invest annual excess cash flow into S&P 500',
    reversible: true,
    recommended: true,
    y5NetWorth: 1_774_606,
    y10NetWorth: 2_232_642,
    y20NetWorth: 3_908_062,
    y20Multiple: 3.589,
    missionScore: 4.30,
    missionRank: 2,
    y5CashFlow: 46_217,
  },
]

function fmtM(n: number): string {
  if (n === 0) return 'N/A'
  return `$${(n / 1_000_000).toFixed(2)}M`
}

function fmtCashFlow(n: number): string {
  if (n < 0) return `-$${Math.abs(n).toLocaleString()}/yr`
  return `$${n.toLocaleString()}/yr`
}

function MissionBar({ score }: { score: number }) {
  const pct = (score / 5) * 100
  const color =
    score >= 4.0 ? 'bg-emerald-500' : score >= 3.0 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
        {score.toFixed(2)}/5.00
      </span>
    </div>
  )
}

function ScenarioCard({ s }: { s: Scenario }) {
  const isRec = s.recommended
  return (
    <div
      className={`rounded-xl border shadow-sm px-6 py-5 flex flex-col gap-4 ${
        isRec
          ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Title row */}
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest shrink-0">
              Scenario {s.num}
            </span>
            {isRec && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                <Star className="h-3 w-3" />
                Recommended
              </span>
            )}
          </div>
          <h2 className={`mt-1 font-bold leading-snug ${isRec ? 'text-lg text-blue-900' : 'text-base text-gray-900'}`}>
            {s.label}
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            s.reversible
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {s.reversible ? (
            <RotateCcw className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {s.reversible ? 'Reversible' : 'Irreversible'}
        </span>
      </div>

      {/* Net worth table */}
      <div className="grid grid-cols-3 divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden text-center">
        {[
          { horizon: '5Y', val: s.y5NetWorth },
          { horizon: '10Y', val: s.y10NetWorth },
          { horizon: '20Y', val: s.y20NetWorth },
        ].map(({ horizon, val }) => (
          <div key={horizon} className="px-2 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{horizon}</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">{fmtM(val)}</p>
          </div>
        ))}
      </div>

      {/* Mission score */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
          Mission Score
        </p>
        <MissionBar score={s.missionScore} />
      </div>

      {/* Cash flow + description */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1">
          <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
          <span className={`font-semibold ${s.y5CashFlow < 0 ? 'text-red-600' : 'text-gray-800'}`}>
            {fmtCashFlow(s.y5CashFlow)}
          </span>
          <span className="text-gray-400 text-xs">cash flow yr 5</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
    </div>
  )
}

const sortedByRank = [...SCENARIOS].sort((a, b) => a.missionRank - b.missionRank)

export default function ScenarioPlannerPage() {
  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scenario Planner</h1>
            <p className="mt-1 text-sm text-gray-500">
              6 strategic paths for the Yarash Eretz portfolio &middot; As of April 2026
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold text-emerald-800">
              ${STARTING_NET_WORTH.toLocaleString()} current portfolio value
            </span>
          </div>
        </div>
      </div>

      {/* Scenario cards grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-10">
        {SCENARIOS.map((s) => (
          <ScenarioCard key={s.num} s={s} />
        ))}
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Side-by-side comparison &mdash; ranked by mission score
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Scenario
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  5Y Net Worth
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  10Y Net Worth
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  20Y Net Worth
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  20Y Multiple
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Mission Score
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedByRank.map((s) => (
                <tr
                  key={s.num}
                  className={s.recommended ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs font-mono">#{s.num}</span>
                      <span className={`font-medium ${s.recommended ? 'text-blue-800' : 'text-gray-800'}`}>
                        {s.label}
                      </span>
                      {s.recommended && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                          <Star className="h-2.5 w-2.5" />
                          Rec
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {fmtM(s.y5NetWorth)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {fmtM(s.y10NetWorth)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {fmtM(s.y20NetWorth)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {s.y20Multiple > 0 ? `${s.y20Multiple.toFixed(3)}x` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        s.missionScore >= 4.0
                          ? 'text-emerald-700'
                          : s.missionScore >= 3.0
                          ? 'text-amber-600'
                          : 'text-red-500'
                      }`}
                    >
                      {s.missionScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block w-6 h-6 rounded-full text-xs font-bold leading-6 ${
                        s.missionRank === 1
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.missionRank <= 3
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {s.missionRank}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">
            Scenarios 4 &amp; 5 have no modeled 10Y/20Y projections in the source data.
            Mission score is a composite of cash flow, reversibility, diversification, and recession resilience.
          </p>
        </div>
      </div>
    </div>
  )
}
