import { format } from 'date-fns'
import Link from 'next/link'
import type { JamOccurrenceWithJam } from '@/lib/jams/getJams'

const RECURRENCE_LABELS: Record<string, string> = {
  ONE_TIME: 'One-time',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
}

export default function JamCard({ occurrence }: { occurrence: JamOccurrenceWithJam }) {
  const { jam } = occurrence

  return (
    <Link
      href={`/jams/${occurrence.id}`}
      className="block rounded-lg border bg-surface p-4 hover:border-[var(--border-focus)] hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-accent font-medium mb-0.5">
            {format(occurrence.date, 'EEE, MMM d, yyyy · h:mm a')}
            {jam.endTime && ` – ${format(jam.endTime, 'h:mm a')}`}
          </p>
          <h3 className="font-semibold text-primary truncate">{jam.title}</h3>
          <p className="text-sm text-secondary mt-0.5">
            {jam.city}, {jam.country} · hosted by {jam.host.name}
          </p>
        </div>
        <span className="shrink-0 text-xs bg-muted text-secondary rounded-full px-2 py-0.5 whitespace-nowrap">
          {RECURRENCE_LABELS[jam.recurrenceType] ?? jam.recurrenceType}
        </span>
      </div>

      {jam.genres.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {jam.genres.map((g) => (
            <span
              key={g.genre}
              className="text-xs bg-muted text-accent rounded-full px-2 py-0.5"
            >
              {g.genre}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
