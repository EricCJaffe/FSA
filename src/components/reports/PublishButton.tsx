'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, Loader2 } from 'lucide-react'

interface Props {
  reportId: string
  initialPublished: boolean
}

export default function PublishButton({ reportId, initialPublished }: Props) {
  const [published, setPublished] = useState(initialPublished)
  const [loading, setLoading] = useState(false)

  async function togglePublish() {
    setLoading(true)
    try {
      const res = await fetch('/api/reports/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, published: !published }),
      })

      if (res.ok) {
        setPublished(!published)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Updating...
      </span>
    )
  }

  return (
    <button
      onClick={togglePublish}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        published
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
      }`}
    >
      {published ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Published
        </>
      ) : (
        <>
          <Clock className="h-3.5 w-3.5" />
          Draft — click to publish
        </>
      )}
    </button>
  )
}
