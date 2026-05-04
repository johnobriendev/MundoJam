import { Suspense } from 'react'
import JamCard from '@/components/jams/JamCard'
import JamFilters from '@/components/jams/JamFilters'
import { getJams } from '@/lib/jams/getJams'
import HeroSection from '@/components/HeroSection'
import { getCurrentUser } from '@/lib/session'
import { getUserProfile } from '@/lib/users/getUserProfile'
import ProfileSidebar from '@/components/dashboard/ProfileSidebar'
import DashboardVantaLoader from '@/components/dashboard/DashboardVantaLoader'

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
  const user = await getCurrentUser()

  const [occurrences, profile] = await Promise.all([
    getJams({
      genres: toArray(params.genre),
      instruments: toArray(params.instrument),
      equipment: toArray(params.equipment),
      recurrenceType: typeof params.recurrence === 'string' ? params.recurrence : undefined,
      city: typeof params.city === 'string' ? params.city : undefined,
      country: typeof params.country === 'string' ? params.country : undefined,
      dateFrom: toDate(params.dateFrom),
      dateTo: toDate(params.dateTo),
    }),
    user ? getUserProfile(user.id) : Promise.resolve(null),
  ])

  const centerColumn = (
    <div className="flex-1 min-w-0 space-y-4">
      <Suspense fallback={null}>
        <JamFilters />
      </Suspense>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            Upcoming jams{occurrences.length > 0 ? ` (${occurrences.length})` : ''}
          </h2>
          <a href="/past-jams" className="text-sm text-accent hover:underline">
            Past jams →
          </a>
        </div>
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
    </div>
  )

  if (user && profile) {
    return (
      <>
        <DashboardVantaLoader />
        <div className="max-w-4xl mx-auto px-4 py-6 lg:flex lg:gap-6 lg:items-start">
          <ProfileSidebar profile={profile} />
          {centerColumn}
        </div>
      </>
    )
  }

  return (
    <>
      <HeroSection initialAuthenticated={false} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {centerColumn}
      </div>
    </>
  )
}
