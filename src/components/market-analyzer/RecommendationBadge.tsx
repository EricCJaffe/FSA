const CONFIG: Record<string, { label: string; className: string }> = {
  buy_more: {
    label: 'Buy More',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  hold: {
    label: 'Hold',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  sell: {
    label: 'Sell',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  monitor: {
    label: 'Monitor',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
}

export default function RecommendationBadge({
  recommendation,
  size = 'sm',
}: {
  recommendation: string
  size?: 'sm' | 'lg'
}) {
  const config = CONFIG[recommendation] ?? {
    label: recommendation,
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
