import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { getOccurrence } from '@/lib/occurrences/getOccurrence'
import { getCurrentUser } from '@/lib/session'
import { RsvpButtons } from '@/components/jams/RsvpButtons'
import { CommentThread } from '@/components/comments/CommentThread'
import { ReportButton } from '@/components/jams/ReportButton'
import JamDetailMapClient from '@/components/map/JamDetailMapClient'

export default async function OccurrencePage({
  params,
}: {
  params: Promise<{ occurrenceId: string }>
}) {
  const { occurrenceId } = await params
  const [occurrence, user] = await Promise.all([getOccurrence(occurrenceId), getCurrentUser()])

  if (!occurrence) notFound()

  const { jam } = occurrence

  const rsvpProps = occurrence.rsvps.map((r) => ({ userId: r.userId, status: r.status }))
  const commentProps = occurrence.comments.map((c) => ({
    id: c.id,
    body: c.body,
    parentId: c.parentId,
    createdAt: c.createdAt,
    user: { id: c.user.id, name: c.user.name, avatarUrl: c.user.avatarUrl },
  }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {jam.coverImageUrl && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
          <Image src={jam.coverImageUrl} alt={jam.title} fill className="object-cover" />
        </div>
      )}

      <div>
        <p className="text-sm text-accent font-medium">
          {format(occurrence.date, 'EEEE, MMMM d, yyyy · h:mm a')}
          {jam.endTime && ` – ${format(jam.endTime, 'h:mm a')}`}
        </p>
        <h1 className="text-2xl font-bold text-primary mt-1">{jam.title}</h1>
        <p className="text-sm text-secondary mt-1">
          Hosted by{' '}
          <Link href={`/musicians/${jam.host.id}`} className="text-accent hover:underline">
            {jam.host.name}
          </Link>
        </p>
      </div>

      <div className="text-sm">
        <p className="font-medium text-primary">{jam.address}</p>
        <p className="text-secondary">{jam.city}, {jam.country}</p>
      </div>

      <JamDetailMapClient lat={jam.lat} lng={jam.lng} />

      {jam.description && (
        <p className="text-sm text-primary whitespace-pre-wrap">{jam.description}</p>
      )}

      {jam.genres.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
            Genres
          </p>
          <div className="flex flex-wrap gap-1.5">
            {jam.genres.map((g) => (
              <span
                key={g.genre}
                className="text-xs bg-muted text-accent rounded-full px-2 py-0.5"
              >
                {g.genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {jam.instrumentsNeeded.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
            Instruments needed
          </p>
          <div className="flex flex-wrap gap-1.5">
            {jam.instrumentsNeeded.map((i) => (
              <span
                key={i.instrument}
                className="text-xs bg-muted text-accent-warm rounded-full px-2 py-0.5"
              >
                {i.instrument}
              </span>
            ))}
          </div>
        </div>
      )}

      {jam.equipment.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
            Equipment provided
          </p>
          <ul className="space-y-1">
            {jam.equipment.map((e) => (
              <li key={e.id} className="text-sm text-primary flex items-baseline gap-2">
                <span>{e.item}</span>
                {e.notes && <span className="text-xs text-secondary">— {e.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t pt-5">
        <RsvpButtons
          occurrenceId={occurrence.id}
          rsvps={rsvpProps}
          currentUserId={user?.id ?? null}
        />
      </div>

      <div className="border-t pt-5">
        <CommentThread
          occurrenceId={occurrence.id}
          comments={commentProps}
          currentUserId={user?.id ?? null}
        />
      </div>

      {user && (user.id === jam.host.id || user.role === 'ADMIN') && (
        <div className="flex justify-end pt-2">
          <Link
            href={`/jams/${occurrence.id}/edit`}
            className="text-sm text-accent hover:text-accent font-medium border rounded-md px-4 py-1.5 hover:bg-muted transition-colors"
          >
            Edit jam
          </Link>
        </div>
      )}

      {user && user.id !== jam.host.id && (
        <div className="flex justify-end pt-2">
          <ReportButton targetType="JAM" targetId={jam.id} />
        </div>
      )}
    </div>
  )
}
