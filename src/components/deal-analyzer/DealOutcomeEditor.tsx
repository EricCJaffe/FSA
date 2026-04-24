'use client'

import { useState } from 'react'
import { Save, Pencil, X } from 'lucide-react'

interface Props {
  analysisId: string
  initialNotes: string | null
  initialOutcome: string | null
  initialOutcomeNotes: string | null
}

const OUTCOMES = [
  { value: '', label: 'Not set' },
  { value: 'pending', label: 'Pending' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'passed', label: 'Passed' },
  { value: 'negotiated_success', label: 'Negotiated (Won)' },
  { value: 'negotiated_failed', label: 'Negotiated (Lost)' },
]

export default function DealOutcomeEditor({
  analysisId,
  initialNotes,
  initialOutcome,
  initialOutcomeNotes,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [outcome, setOutcome] = useState(initialOutcome ?? '')
  const [outcomeNotes, setOutcomeNotes] = useState(initialOutcomeNotes ?? '')

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/deal-analyses/${analysisId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userNotes: notes || null,
          outcome: outcome || null,
          outcomeNotes: outcomeNotes || null,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setEditing(false)
    } catch {
      // keep editing open on failure
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Notes & Outcome
          </h3>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>
        {outcome && (
          <div className="mb-2">
            <span className="text-xs text-gray-500">Outcome: </span>
            <span className="text-sm font-medium text-gray-900">
              {OUTCOMES.find((o) => o.value === outcome)?.label ?? outcome}
            </span>
            {outcomeNotes && (
              <p className="text-sm text-gray-600 mt-1">{outcomeNotes}</p>
            )}
          </div>
        )}
        {notes ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No notes yet. Click edit to add.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-white px-6 py-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Notes & Outcome
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Outcome
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            {OUTCOMES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Outcome Notes
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={outcomeNotes}
            onChange={(e) => setOutcomeNotes(e.target.value)}
            placeholder="e.g. Closed at $120K on 4/15"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes about this deal..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
