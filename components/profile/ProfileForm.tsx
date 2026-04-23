'use client'

import { useActionState, useState } from 'react'
import { updateProfileAction, type UpdateProfileState } from '@/app/(main)/profile/actions'
import { GENRES } from '@/constants/genres'
import { INSTRUMENTS } from '@/constants/instruments'
import type { UserProfile } from '@/lib/users/getUser'

const STANDARD_GENRES = GENRES.filter((g) => g !== 'Other')
const STANDARD_INSTRUMENTS = INSTRUMENTS.filter((i) => i !== 'Other')

const SKILL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All levels',
}

function fieldError(errors: Record<string, string[]> | undefined, key: string) {
  return errors?.[key]?.[0]
}

function CheckboxGrid({
  items,
  selected,
  onToggle,
}: {
  items: readonly string[]
  selected: Set<string>
  onToggle: (item: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={selected.has(item)}
            onChange={() => onToggle(item)}
          />
          {item}
        </label>
      ))}
    </div>
  )
}

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [state, action, pending] = useActionState<UpdateProfileState, FormData>(
    updateProfileAction,
    {},
  )

  const initialInstruments = new Set(profile.instruments.map((i) => i.instrument))
  const initialGenres = new Set(profile.genres.map((g) => g.genre))

  const [selectedInstruments, setSelectedInstruments] = useState<Set<string>>(initialInstruments)
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(initialGenres)
  const [skillLevel, setSkillLevel] = useState(profile.skillLevel)
  const [isDiscoverable, setIsDiscoverable] = useState(profile.isDiscoverable)

  function toggleInstrument(item: string) {
    setSelectedInstruments((prev) => {
      const next = new Set(prev)
      next.has(item) ? next.delete(item) : next.add(item)
      return next
    })
  }

  function toggleGenre(item: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev)
      next.has(item) ? next.delete(item) : next.add(item)
      return next
    })
  }

  const errors = state.errors

  return (
    <form action={action} encType="multipart/form-data" className="space-y-8">
      <input type="hidden" name="instrumentsJson" value={JSON.stringify([...selectedInstruments])} />
      <input type="hidden" name="genresJson" value={JSON.stringify([...selectedGenres])} />
      <input type="hidden" name="isDiscoverable" value={String(isDiscoverable)} />

      {state.success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          Profile saved successfully.
        </div>
      )}

      {fieldError(errors, '_form') && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {fieldError(errors, '_form')}
        </p>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={profile.name}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {fieldError(errors, 'name') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'name')}</p>
        )}
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Profile photo</label>
        {profile.avatarUrl && (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover mb-2"
          />
        )}
        <input
          name="avatar"
          type="file"
          accept="image/*"
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {fieldError(errors, 'avatar') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'avatar')}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ''}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Tell other musicians about yourself…"
        />
        {fieldError(errors, 'bio') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'bio')}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          City
        </label>
        <input
          id="city"
          name="city"
          type="text"
          defaultValue={profile.city ?? ''}
          placeholder="Austin"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {fieldError(errors, 'city') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'city')}</p>
        )}
      </div>

      {/* Skill level */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Skill level</p>
        <div className="flex flex-wrap gap-4">
          {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'] as const).map((level) => (
            <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="skillLevel"
                value={level}
                checked={skillLevel === level}
                onChange={() => setSkillLevel(level)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              {SKILL_LABELS[level]}
            </label>
          ))}
        </div>
      </div>

      {/* Instruments */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Instruments I play</p>
        <CheckboxGrid
          items={STANDARD_INSTRUMENTS}
          selected={selectedInstruments}
          onToggle={toggleInstrument}
        />
      </div>

      {/* Genres */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Genres I play</p>
        <CheckboxGrid items={STANDARD_GENRES} selected={selectedGenres} onToggle={toggleGenre} />
      </div>

      {/* Discoverability */}
      <div className="rounded-lg border border-gray-200 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={isDiscoverable}
            onChange={(e) => setIsDiscoverable(e.target.checked)}
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Appear in musician directory</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Other musicians can find your profile when searching the directory.
            </p>
          </div>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors"
        >
          {pending ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}
