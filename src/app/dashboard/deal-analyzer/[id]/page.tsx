import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, MapPin, Home, Calendar, Ruler, Trash2 } from 'lucide-react'
import DealResults from '@/components/deal-analyzer/DealResults'
import DealOutcomeEditor from '@/components/deal-analyzer/DealOutcomeEditor'
import DeleteDealButton from '@/components/deal-analyzer/DeleteDealButton'
import { formatDealCurrency } from '@/lib/deal-analyzer/calculator'

const TYPE_LABELS: Record<string, string> = {
  sfh: 'Single Family Home',
  townhouse: 'Townhouse',
  condo: 'Condo',
  duplex: 'Duplex',
  multifamily: 'Multifamily',
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: analysis, error } = await supabase
    .from('deal_analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !analysis) notFound()

  const details = [
    analysis.property_type && {
      icon: Home,
      text: TYPE_LABELS[analysis.property_type] ?? analysis.property_type,
    },
    analysis.year_built && { icon: Calendar, text: `Built ${analysis.year_built}` },
    (analysis.beds || analysis.baths || analysis.sqft) && {
      icon: Ruler,
      text: [
        analysis.beds && `${analysis.beds} bed`,
        analysis.baths && `${analysis.baths} bath`,
        analysis.sqft && `${analysis.sqft.toLocaleString()} sqft`,
      ]
        .filter(Boolean)
        .join(' / '),
    },
    analysis.county && { icon: MapPin, text: `${analysis.county} County` },
  ].filter(Boolean) as { icon: React.ElementType; text: string }[]

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/dashboard/deal-analyzer"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Deal Analyzer
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {analysis.property_name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {analysis.property_address}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {details.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs text-gray-500"
              >
                <d.icon className="h-3.5 w-3.5" />
                {d.text}
              </span>
            ))}
            {analysis.mls_number && (
              <span className="text-xs text-gray-400">
                MLS# {analysis.mls_number}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>
              List: {formatDealCurrency(analysis.list_price)}
            </span>
            <span>
              All-in: {formatDealCurrency(analysis.all_in_cost)}
            </span>
            <span>
              Analyzed{' '}
              {new Date(analysis.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
        <DeleteDealButton analysisId={analysis.id} />
      </div>

      <DealResults analysis={analysis} />

      <div className="mt-6">
        <DealOutcomeEditor
          analysisId={analysis.id}
          initialNotes={analysis.user_notes}
          initialOutcome={analysis.outcome}
          initialOutcomeNotes={analysis.outcome_notes}
        />
      </div>
    </div>
  )
}
