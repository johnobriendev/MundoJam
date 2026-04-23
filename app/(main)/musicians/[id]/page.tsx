import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getUserWithActivity } from '@/lib/users/getUser'
import { getCurrentUser } from '@/lib/session'
import { isFollowing } from '@/lib/users/followUser'
import { FollowButton } from '@/components/musicians/FollowButton'

const SKILL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All levels',
}

export default async function MusicianProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, currentUser] = await Promise.all([getUserWithActivity(id), getCurrentUser()])

  if (!user) notFound()

  const following =
    currentUser && currentUser.id !== id ? await isFollowing(currentUser.id, id) : false

  const hostedOccurrences = user.hostedJams.flatMap((jam) =>
    jam.occurrences.map((occ) => ({ ...occ, jam })),
  )

  const attendingOccurrences = user.rsvps
    .map((r) => r.occurrence)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-start gap-6">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-indigo-600 font-bold text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {currentUser && currentUser.id !== id && (
              <FollowButton profileUserId={id} initialIsFollowing={following} />
            )}
          </div>
          {user.city && <p className="text-gray-500 mt-0.5">{user.city}</p>}
          <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
            {SKILL_LABELS[user.skillLevel] ?? user.skillLevel}
          </span>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            About
          </h2>
          <p className="text-gray-700 whitespace-pre-line">{user.bio}</p>
        </section>
      )}

      {/* Instruments */}
      {user.instruments.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Instruments
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.instruments.map((i) => (
              <span
                key={i.instrument}
                className="text-sm bg-indigo-50 text-indigo-700 rounded-full px-3 py-0.5"
              >
                {i.instrument}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Genres */}
      {user.genres.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Genres
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.genres.map((g) => (
              <span
                key={g.genre}
                className="text-sm bg-purple-50 text-purple-700 rounded-full px-3 py-0.5"
              >
                {g.genre}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming hosted jams */}
      {hostedOccurrences.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Hosting upcoming
          </h2>
          <div className="space-y-2">
            {hostedOccurrences.map((occ) => (
              <Link
                key={occ.id}
                href={`/jams/${occ.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{occ.jam.title}</p>
                  <p className="text-sm text-gray-500">{occ.jam.city}</p>
                </div>
                <p className="text-xs text-indigo-600 font-medium whitespace-nowrap">
                  {format(occ.date, 'EEE, MMM d, yyyy')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming attending jams */}
      {attendingOccurrences.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Attending upcoming
          </h2>
          <div className="space-y-2">
            {attendingOccurrences.map((occ) => (
              <Link
                key={occ.id}
                href={`/jams/${occ.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{occ.jam.title}</p>
                  <p className="text-sm text-gray-500">
                    {occ.jam.city} · hosted by {occ.jam.host.name}
                  </p>
                </div>
                <p className="text-xs text-indigo-600 font-medium whitespace-nowrap">
                  {format(occ.date, 'EEE, MMM d, yyyy')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {hostedOccurrences.length === 0 && attendingOccurrences.length === 0 && (
        <p className="text-gray-500 text-sm">No upcoming jam activity.</p>
      )}
    </div>
  )
}
