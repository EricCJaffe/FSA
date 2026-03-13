'use client'

import { useState } from 'react'
import { MessageSquare, Save, Loader2, Pencil, X } from 'lucide-react'

interface Props {
  reportId: string
  initialCommentary: string | null
}

export default function ReportCommentary({ reportId, initialCommentary }: Props) {
  const [commentary, setCommentary] = useState(initialCommentary ?? '')
  const [savedCommentary, setSavedCommentary] = useState(initialCommentary ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/reports/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, commentary: commentary.trim() || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }

      setSavedCommentary(commentary.trim())
      setEditing(false)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setCommentary(savedCommentary)
    setEditing(false)
    setError(null)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Commentary
          </h2>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="h-3 w-3" />
            {savedCommentary ? 'Edit' : 'Add notes'}
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            rows={4}
            placeholder="Add your commentary, observations, or notes for this report..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : savedCommentary ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{savedCommentary}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">No commentary added yet. Click "Add notes" to annotate this report.</p>
      )}
    </div>
  )
}
