const CONFIG: Record<string, { label: string; className: string }> = {
  bullish: {
    label: 'Bullish',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  neutral: {
    label: 'Neutral',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  bearish: {
    label: 'Bearish',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

export default function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config = CONFIG[sentiment] ?? {
    label: sentiment,
    className: 'bg-gray-50 text-gray-600 border-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  )
}
