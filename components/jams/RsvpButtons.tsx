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
      <p className="text-sm text-gray-500">
        <a href="/login" className="text-indigo-600 hover:underline">
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
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50'
        }`}
      >
        Going{goingCount > 0 ? ` (${goingCount})` : ''}
      </button>
      <button
        onClick={() => handleRsvp('INTERESTED')}
        disabled={pending}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
          myRsvp?.status === 'INTERESTED'
            ? 'bg-amber-500 text-white'
            : 'bg-white text-amber-600 border border-amber-300 hover:bg-amber-50'
        }`}
      >
        Interested{interestedCount > 0 ? ` (${interestedCount})` : ''}
      </button>
    </div>
  )
}
