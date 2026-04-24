const VERDICT_CONFIG: Record<string, { label: string; className: string }> = {
  strong_recommend: {
    label: 'Strong Recommend',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  recommend: {
    label: 'Recommend',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  negotiate: {
    label: 'Negotiate',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  negotiate_marginal: {
    label: 'Negotiate (Marginal)',
    className: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  pass: {
    label: 'Pass',
    className: 'bg-red-50 text-red-600 border-red-200',
  },
  hard_pass: {
    label: 'Hard Pass',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

export default function DealVerdictBadge({
  verdict,
  size = 'sm',
}: {
  verdict: string
  size?: 'sm' | 'lg'
}) {
  const config = VERDICT_CONFIG[verdict] ?? {
    label: verdict,
    className: 'bg-gray-50 text-gray-600 border-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${config.className} ${
        size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {config.label}
    </span>
  )
}
