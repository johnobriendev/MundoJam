'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type RsvpStatus = 'GOING' | 'INTERESTED'
type Rsvp = { userId: string; status: RsvpStatus }

export function RsvpButtons({
  occurrenceId,
  rsvps,
  currentUserId,
}: {
  occurrenceId: string
  rsvps: Rsvp[]
  currentUserId: string | null
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const myRsvp = currentUserId ? rsvps.find((r) => r.userId === currentUserId) : undefined
  const goingCount = rsvps.filter((r) => r.status === 'GOING').length
  const interestedCount = rsvps.filter((r) => r.status === 'INTERESTED').length

  async function handleRsvp(status: RsvpStatus) {
    if (!currentUserId) return
    setPending(true)
    try {
      if (myRsvp?.status === status) {
        await fetch(`/api/occurrences/${occurrenceId}/rsvp`, { method: 'DELETE' })
      } else {
        await fetch(`/api/occurrences/${occurrenceId}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      }
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  if (!currentUserId) {
    return (
      <p className="text-sm text-secondary">
        <a href="/login" className="text-accent hover:underline">
          Sign in
        </a>{' '}
        to RSVP
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleRsvp('GOING')}
        disabled={pending}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
          myRsvp?.status === 'GOING'
            ? 'bg-accent text-white'
            : 'bg-surface text-accent border border-[var(--border-focus)] hover:bg-muted'
        }`}
      >
        Going{goingCount > 0 ? ` (${goingCount})` : ''}
      </button>
      <button
        onClick={() => handleRsvp('INTERESTED')}
        disabled={pending}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
          myRsvp?.status === 'INTERESTED'
            ? 'bg-accent-warm text-white'
            : 'bg-surface text-accent-warm border hover:bg-muted'
        }`}
      >
        Interested{interestedCount > 0 ? ` (${interestedCount})` : ''}
      </button>
    </div>
  )
}
