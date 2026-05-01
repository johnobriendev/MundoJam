'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { GENRES } from '@/constants/genres'

export default function JamFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const genres = searchParams.getAll('genre')
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const city = searchParams.get('city') ?? ''
  const country = searchParams.get('country') ?? ''

  const push = useCallback(
    (updates: Record<string, string | string[]>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        params.delete(key)
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else if (value) {
          params.set(key, value)
        }
      }
      router.push(pathname + (params.size > 0 ? '?' + params.toString() : ''))
    },
    [searchParams, router, pathname],
  )

  const toggleMulti = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    push({ [key]: next })
  }

  const hasFilters =
    genres.length > 0 ||
    dateFrom ||
    dateTo ||
    city ||
    country

  const chipClass = (active: boolean) =>
    `text-xs rounded-full px-1.5 py-0.5 border transition-colors cursor-pointer ${
      active
        ? 'bg-accent text-white border-accent'
        : 'bg-surface text-secondary border hover:border-[var(--border-focus)]'
    }`

  return (
    <div className="rounded-lg border bg-surface p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          defaultValue={city}
          placeholder="City"
          className="flex-1 border rounded-md px-2.5 py-1 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          onBlur={(e) => push({ city: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') push({ city: (e.target as HTMLInputElement).value })
          }}
        />
        <input
          type="text"
          defaultValue={country}
          placeholder="Country"
          className="flex-1 border rounded-md px-2.5 py-1 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          onBlur={(e) => push({ country: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') push({ country: (e.target as HTMLInputElement).value })
          }}
        />
        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-accent hover:underline shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => push({ dateFrom: e.target.value })}
          className="w-full border rounded-md px-2 py-1 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => push({ dateTo: e.target.value })}
          className="w-full border rounded-md px-2 py-1 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Genres */}
      <details open={genres.length > 0}>
        <summary className="text-xs font-medium text-primary cursor-pointer select-none">
          Genre{genres.length > 0 ? ` (${genres.length})` : ''}
        </summary>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleMulti('genre', g, genres)}
              className={chipClass(genres.includes(g))}
            >
              {g}
            </button>
          ))}
        </div>
      </details>

    </div>
  )
}
