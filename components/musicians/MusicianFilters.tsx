'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { GENRES } from '@/constants/genres'
import { INSTRUMENTS } from '@/constants/instruments'

const SKILL_OPTIONS = [
  { value: '', label: 'Any level' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ALL_LEVELS', label: 'All levels' },
]

export default function MusicianFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const city = searchParams.get('city') ?? ''
  const skillLevel = searchParams.get('skillLevel') ?? ''
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

  const hasFilters = city || skillLevel || instruments.length > 0 || genres.length > 0

  const chipClass = (active: boolean) =>
    `text-xs rounded-full px-2 py-0.5 border transition-colors cursor-pointer ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
    }`

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Filters</span>
        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-indigo-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
        <input
          type="text"
          defaultValue={city}
          placeholder="e.g. Austin"
          className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          onBlur={(e) => push({ city: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') push({ city: (e.target as HTMLInputElement).value })
          }}
        />
      </div>

      {/* Skill level */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Skill level</label>
        <select
          value={skillLevel}
          onChange={(e) => push({ skillLevel: e.target.value })}
          className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          {SKILL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Instruments */}
      <details open={instruments.length > 0}>
        <summary className="text-xs font-medium text-gray-700 cursor-pointer select-none">
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
        <summary className="text-xs font-medium text-gray-700 cursor-pointer select-none">
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
