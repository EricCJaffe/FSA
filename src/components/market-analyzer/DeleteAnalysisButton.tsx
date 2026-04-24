'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteAnalysisButton({
  analysisId,
}: {
  analysisId: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    const res = await fetch(`/api/market-analyses/${analysisId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      router.push('/dashboard/market-analyzer')
      router.refresh()
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
        >
          Confirm delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors print:hidden"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  )
}
