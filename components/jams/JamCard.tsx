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
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-indigo-600 font-medium mb-0.5">
            {format(occurrence.date, 'EEE, MMM d, yyyy · h:mm a')}
          </p>
          <h3 className="font-semibold text-gray-900 truncate">{jam.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {jam.city} · hosted by {jam.host.name}
          </p>
        </div>
        <span className="shrink-0 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 whitespace-nowrap">
          {RECURRENCE_LABELS[jam.recurrenceType] ?? jam.recurrenceType}
        </span>
      </div>

      {jam.genres.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {jam.genres.map((g) => (
            <span
              key={g.genre}
              className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5"
            >
              {g.genre}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
