import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getUserWithActivity } from '@/lib/users/getUser'
import { getCurrentUser } from '@/lib/session'
import { isFollowing } from '@/lib/users/followUser'
import { FollowButton } from '@/components/musicians/FollowButton'

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
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-accent font-bold text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-primary">{user.name}</h1>
            {currentUser && currentUser.id !== id && (
              <FollowButton profileUserId={id} initialIsFollowing={following} />
            )}
          </div>
          {user.city && <p className="text-secondary mt-0.5">{user.city}</p>}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <section>
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
            About
          </h2>
          <p className="text-primary whitespace-pre-line">{user.bio}</p>
        </section>
      )}

      {/* Instruments */}
      {user.instruments.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
            Instruments
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.instruments.map((i) => (
              <span
                key={i.instrument}
                className="text-sm bg-muted text-accent rounded-full px-3 py-0.5"
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
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
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
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
            Hosting upcoming
          </h2>
          <div className="space-y-2">
            {hostedOccurrences.map((occ) => (
              <Link
                key={occ.id}
                href={`/jams/${occ.id}`}
                className="flex items-center justify-between rounded-lg border bg-surface px-4 py-3 hover:border-[var(--border-focus)] hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-medium text-primary">{occ.jam.title}</p>
                  <p className="text-sm text-secondary">{occ.jam.city}</p>
                </div>
                <p className="text-xs text-accent font-medium whitespace-nowrap">
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
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
            Attending upcoming
          </h2>
          <div className="space-y-2">
            {attendingOccurrences.map((occ) => (
              <Link
                key={occ.id}
                href={`/jams/${occ.id}`}
                className="flex items-center justify-between rounded-lg border bg-surface px-4 py-3 hover:border-[var(--border-focus)] hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-medium text-primary">{occ.jam.title}</p>
                  <p className="text-sm text-secondary">
                    {occ.jam.city} · hosted by {occ.jam.host.name}
                  </p>
                </div>
                <p className="text-xs text-accent font-medium whitespace-nowrap">
                  {format(occ.date, 'EEE, MMM d, yyyy')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {hostedOccurrences.length === 0 && attendingOccurrences.length === 0 && (
        <p className="text-secondary text-sm">No upcoming jam activity.</p>
      )}
    </div>
  )
}
