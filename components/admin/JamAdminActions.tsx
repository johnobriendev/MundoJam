'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function JamAdminActions({ jamId, status }: { jamId: string; status: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (status !== 'PENDING') {
    return (
      <p className="text-sm text-secondary">
        This jam has already been{' '}
        <span className="font-medium">{status.toLowerCase()}</span>.
      </p>
    )
  }

  async function handleApprove() {
    startTransition(async () => {
      const res = await fetch(`/api/jams/${jamId}/approve`, { method: 'POST' })
      if (res.ok) router.push('/admin')
    })
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }
    startTransition(async () => {
      const res = await fetch(`/api/jams/${jamId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (res.ok) router.push('/admin')
    })
  }

  return (
    <div>
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => setRejectOpen(true)}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-sm font-semibold text-primary mb-1">Reject this jam</h2>
            <p className="text-xs text-secondary mb-3">
              The host will receive an email with this reason and a link to resubmit.
            </p>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('')
              }}
              rows={4}
              placeholder="Explain why this jam cannot be approved..."
              className="w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setRejectOpen(false)
                  setReason('')
                  setError('')
                }}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-medium rounded border text-primary hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
