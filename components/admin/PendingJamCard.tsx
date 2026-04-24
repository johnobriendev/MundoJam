'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface PendingJamCardProps {
  jam: {
    id: string
    title: string
    city: string
    country: string
    recurrenceType: string
    startDate: Date
    createdAt: Date
    host: { name: string; email: string }
    genres: { genre: string }[]
  }
}

export function PendingJamCard({ jam }: PendingJamCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  async function handleApprove() {
    startTransition(async () => {
      const res = await fetch(`/api/jams/${jam.id}/approve`, { method: 'POST' })
      if (res.ok) {
        router.refresh()
      }
    })
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }
    startTransition(async () => {
      const res = await fetch(`/api/jams/${jam.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (res.ok) {
        setRejectOpen(false)
        setReason('')
        setError('')
        router.refresh()
      }
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/jams/${jam.id}`}
            className="text-sm font-semibold text-gray-900 hover:underline truncate block"
          >
            {jam.title}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">
            {jam.host.name} &middot; {jam.city}, {jam.country} &middot;{' '}
            {jam.recurrenceType === 'ONE_TIME'
              ? 'One time'
              : jam.recurrenceType === 'WEEKLY'
                ? 'Weekly'
                : 'Monthly'}{' '}
            &middot; Starts {format(new Date(jam.startDate), 'MMM d, yyyy')}
          </p>
          {jam.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {jam.genres.map((g) => (
                <span
                  key={g.genre}
                  className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {g.genre}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Submitted {format(new Date(jam.createdAt), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => setRejectOpen(true)}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Reject &ldquo;{jam.title}&rdquo;</h2>
            <p className="text-xs text-gray-500 mb-3">
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
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
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
                className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
