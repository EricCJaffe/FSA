'use client'

import { useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

export default function PopulateAddressesButton({ missingCount }: { missingCount: number }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  if (missingCount === 0) return null

  async function handlePopulate() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/properties/populate-addresses', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setResult(data.message)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setResult(data.error || 'Failed')
      }
    } catch {
      setResult('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <p className="text-xs text-emerald-600">{result}</p>
    )
  }

  return (
    <button
      onClick={handlePopulate}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
      {loading ? 'Updating...' : `Fill ${missingCount} missing addresses`}
    </button>
  )
}
