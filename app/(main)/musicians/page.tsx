import { Suspense } from 'react'
import { requireUser } from '@/lib/session'
import { getMusicians } from '@/lib/users/getMusicians'
import MusicianCard from '@/components/musicians/MusicianCard'
import MusicianFilters from '@/components/musicians/MusicianFilters'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function toArray(v: string | string[] | undefined): string[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

export default async function MusiciansPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser()

  const params = await searchParams

  const musicians = await getMusicians({
    city: typeof params.city === 'string' ? params.city : undefined,
    instruments: toArray(params.instrument),
    genres: toArray(params.genre),
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <Suspense fallback={null}>
        <MusicianFilters />
      </Suspense>

      <div>
        <h2 className="text-lg font-semibold text-primary mb-3">
          Musicians{musicians.length > 0 ? ` (${musicians.length})` : ''}
        </h2>

        {musicians.length === 0 ? (
          <p className="text-secondary text-sm">No musicians match your filters.</p>
        ) : (
          <div className="space-y-3">
            {musicians.map((musician) => (
              <MusicianCard key={musician.id} musician={musician} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
