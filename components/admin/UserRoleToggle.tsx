'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function UserRoleToggle({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: 'USER' | 'ADMIN'
}) {
  const router = useRouter()
  const [role, setRole] = useState(currentRole)
  const [isPending, startTransition] = useTransition()

  function handleChange(newRole: 'USER' | 'ADMIN') {
    startTransition(async () => {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        setRole(newRole)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span
        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
          role === 'ADMIN' ? 'bg-muted text-accent' : 'bg-muted text-secondary'
        }`}
      >
        {role}
      </span>
      <button
        onClick={() => handleChange(role === 'ADMIN' ? 'USER' : 'ADMIN')}
        disabled={isPending}
        className="text-xs text-secondary hover:text-primary disabled:opacity-50"
      >
        {role === 'ADMIN' ? 'Revoke admin' : 'Make admin'}
      </button>
    </div>
  )
}
