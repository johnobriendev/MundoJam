import { Suspense } from 'react'
import Link from 'next/link'
import PastJamCard from '@/components/jams/PastJamCard'
import JamFilters from '@/components/jams/JamFilters'
import { getPastJams } from '@/lib/jams/getPastJams'

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

function toPage(v: string | string[] | undefined): number {
  const n = parseInt(typeof v === 'string' ? v : '1', 10)
  return isNaN(n) || n < 1 ? 1 : n
}

export default async function PastJamsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const page = toPage(params.page)

  const { occurrences, hasMore } = await getPastJams({
    genres: toArray(params.genre),
    instruments: toArray(params.instrument),
    equipment: toArray(params.equipment),
    recurrenceType: typeof params.recurrence === 'string' ? params.recurrence : undefined,
    city: typeof params.city === 'string' ? params.city : undefined,
    country: typeof params.country === 'string' ? params.country : undefined,
    dateFrom: toDate(params.dateFrom),
    dateTo: toDate(params.dateTo),
    page,
  })

  const paramsWithoutPage = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      k === 'page' ? [] : Array.isArray(v) ? v.map((x) => [k, x]) : v ? [[k, v]] : []
    )
  )
  const base = paramsWithoutPage.size > 0 ? `?${paramsWithoutPage}&` : '?'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← Upcoming jams
        </Link>
      </div>

      <Suspense fallback={null}>
        <JamFilters />
      </Suspense>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-primary">
          Past jams{occurrences.length > 0 ? ` · page ${page}` : ''}
        </h2>
        {occurrences.length === 0 ? (
          <p className="text-secondary text-sm">No past jams match your filters.</p>
        ) : (
          occurrences.map((occurrence) => (
            <PastJamCard key={occurrence.id} occurrence={occurrence} />
          ))
        )}
      </div>

      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between pt-2">
          {page > 1 ? (
            <Link href={`${base}page=${page - 1}`} className="text-sm text-accent hover:underline">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link href={`${base}page=${page + 1}`} className="text-sm text-accent hover:underline">
              Older →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
