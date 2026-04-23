'use client'

import { useState } from 'react'

export function FollowButton({
  profileUserId,
  initialIsFollowing,
}: {
  profileUserId: string
  initialIsFollowing: boolean
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [pending, setPending] = useState(false)

  async function toggle() {
    setPending(true)
    try {
      await fetch(`/api/users/${profileUserId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      })
      setIsFollowing(!isFollowing)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={
        isFollowing
          ? 'text-sm border border-gray-300 rounded-full px-4 py-1.5 text-gray-700 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50'
          : 'text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-1.5 transition-colors disabled:opacity-50'
      }
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
