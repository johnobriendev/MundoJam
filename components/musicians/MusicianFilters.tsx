'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { GENRES } from '@/constants/genres'
import { INSTRUMENTS } from '@/constants/instruments'

export default function MusicianFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const city = searchParams.get('city') ?? ''
  const instruments = searchParams.getAll('instrument')
  const genres = searchParams.getAll('genre')

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

  const hasFilters = city || instruments.length > 0 || genres.length > 0

  const chipClass = (active: boolean) =>
    `text-xs rounded-full px-2 py-0.5 border transition-colors cursor-pointer ${
      active
        ? 'bg-accent text-white border-accent'
        : 'bg-surface text-secondary border hover:border-[var(--border-focus)]'
    }`

  return (
    <div className="rounded-lg border bg-surface p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">Filters</span>
        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-accent hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-medium text-primary mb-1">City</label>
        <input
          type="text"
          defaultValue={city}
          placeholder="e.g. Austin"
          className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          onBlur={(e) => push({ city: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') push({ city: (e.target as HTMLInputElement).value })
          }}
        />
      </div>

      {/* Instruments */}
      <details open={instruments.length > 0}>
        <summary className="text-xs font-medium text-primary cursor-pointer select-none">
          Instruments{instruments.length > 0 ? ` (${instruments.length})` : ''}
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {INSTRUMENTS.filter((i) => i !== 'Other').map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleMulti('instrument', i, instruments)}
              className={chipClass(instruments.includes(i))}
            >
              {i}
            </button>
          ))}
        </div>
      </details>

      {/* Genres */}
      <details open={genres.length > 0}>
        <summary className="text-xs font-medium text-primary cursor-pointer select-none">
          Genres{genres.length > 0 ? ` (${genres.length})` : ''}
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GENRES.filter((g) => g !== 'Other').map((g) => (
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
