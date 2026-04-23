import { requireUser } from '@/lib/session'
import { getFollowingFeed } from '@/lib/users/getFollowingFeed'
import JamCard from '@/components/jams/JamCard'
import Link from 'next/link'

export default async function FollowingPage() {
  const user = await requireUser()
  const occurrences = await getFollowingFeed(user.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Following</h1>

      {occurrences.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="mb-4">No upcoming jams from people you follow.</p>
          <Link href="/musicians" className="text-indigo-600 hover:underline text-sm">
            Discover musicians to follow
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {occurrences.map((occ) => (
            <JamCard key={occ.id} occurrence={occ} />
          ))}
        </div>
      )}
    </div>
  )
}
