import { Suspense } from 'react'
import JamCard from '@/components/jams/JamCard'
import JamFilters from '@/components/jams/JamFilters'
import JamMap from '@/components/map/JamMap'
import { getJams } from '@/lib/jams/getJams'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function toArray(v: string | string[] | undefined): string[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

function toDate(v: string | string[] | undefined): Date | undefined {
  if (typeof v !== 'string' || !v) return undefined
  const d = new Date(v)
  return isNaN(d.getTime()) ? undefined : d
}

export default async function DiscoverPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const occurrences = await getJams({
    genres: toArray(params.genre),
    instruments: toArray(params.instrument),
    equipment: toArray(params.equipment),
    recurrenceType: typeof params.recurrence === 'string' ? params.recurrence : undefined,
    city: typeof params.city === 'string' ? params.city : undefined,
    country: typeof params.country === 'string' ? params.country : undefined,
    dateFrom: toDate(params.dateFrom),
    dateTo: toDate(params.dateTo),
  })

  const pins = occurrences.map((o) => ({
    id: o.id,
    title: o.jam.title,
    lat: o.jam.lat,
    lng: o.jam.lng,
    city: o.jam.city,
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <Suspense fallback={null}>
        <JamFilters />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-primary">
            Upcoming jams{occurrences.length > 0 ? ` (${occurrences.length})` : ''}
          </h2>
          {occurrences.length === 0 ? (
            <p className="text-secondary text-sm">
              No upcoming jams match your filters.{' '}
              <a href="/jams/new" className="text-accent hover:underline">
                Host one!
              </a>
            </p>
          ) : (
            occurrences.map((occurrence) => (
              <JamCard key={occurrence.id} occurrence={occurrence} />
            ))
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <JamMap jams={pins} />
        </div>
      </div>
    </div>
  )
}
