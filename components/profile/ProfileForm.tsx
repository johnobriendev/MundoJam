'use client'

import { useActionState, useRef, useState } from 'react'
import { updateProfileAction, type UpdateProfileState } from '@/app/(main)/profile/actions'
import { GENRES } from '@/constants/genres'
import { INSTRUMENTS } from '@/constants/instruments'
import type { UserProfile } from '@/lib/users/getUser'

const STANDARD_GENRES = GENRES.filter((g) => g !== 'Other')
const STANDARD_INSTRUMENTS = INSTRUMENTS.filter((i) => i !== 'Other')

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
            className="rounded border text-accent focus:ring-accent"
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
  const [isDiscoverable, setIsDiscoverable] = useState(profile.isDiscoverable)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [avatarTypeError, setAvatarTypeError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']

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
    <form action={action} className="space-y-8">
      <input type="hidden" name="instrumentsJson" value={JSON.stringify([...selectedInstruments])} />
      <input type="hidden" name="genresJson" value={JSON.stringify([...selectedGenres])} />
      <input type="hidden" name="isDiscoverable" value={String(isDiscoverable)} />
      <input type="hidden" name="removeAvatar" value={String(removeAvatar)} />

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
        <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={profile.name}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {fieldError(errors, 'name') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'name')}</p>
        )}
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1">Profile photo</label>
        {profile.avatarUrl && !removeAvatar && (
          <div className="flex items-center gap-3 mb-2">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setRemoveAvatar(true)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-xs text-secondary hover:text-red-600 underline"
            >
              Remove photo
            </button>
          </div>
        )}
        {removeAvatar && (
          <p className="text-xs text-secondary mb-2">Photo will be removed on save.</p>
        )}
        <input
          ref={fileInputRef}
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && !ALLOWED_AVATAR_TYPES.includes(file.type)) {
              setAvatarTypeError(true)
              e.target.value = ''
            } else {
              setAvatarTypeError(false)
              setRemoveAvatar(false)
            }
          }}
          className="w-full text-sm text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-muted file:text-accent hover:file:bg-muted"
        />
        {avatarTypeError && (
          <p className="text-xs text-red-600 mt-1">
            Unsupported format. Please upload a JPEG, PNG, WebP, AVIF, or GIF.
          </p>
        )}
        {!avatarTypeError && fieldError(errors, 'avatar') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'avatar')}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-primary mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ''}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-y"
          placeholder="Tell other musicians about yourself…"
        />
        {fieldError(errors, 'bio') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'bio')}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-primary mb-1">
          City
        </label>
        <input
          id="city"
          name="city"
          type="text"
          defaultValue={profile.city ?? ''}
          placeholder="Austin"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {fieldError(errors, 'city') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'city')}</p>
        )}
      </div>

      {/* Instruments */}
      <div>
        <p className="block text-sm font-medium text-primary mb-2">Instruments I play</p>
        <CheckboxGrid
          items={STANDARD_INSTRUMENTS}
          selected={selectedInstruments}
          onToggle={toggleInstrument}
        />
      </div>

      {/* Genres */}
      <div>
        <p className="block text-sm font-medium text-primary mb-2">Genres I play</p>
        <CheckboxGrid items={STANDARD_GENRES} selected={selectedGenres} onToggle={toggleGenre} />
      </div>

      {/* Discoverability */}
      <div className="rounded-lg border p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 rounded border text-accent focus:ring-accent"
            checked={isDiscoverable}
            onChange={(e) => setIsDiscoverable(e.target.checked)}
          />
          <div>
            <span className="text-sm font-medium text-primary">Appear in musician directory</span>
            <p className="text-xs text-secondary mt-0.5">
              Other musicians can find your profile when searching the directory.
            </p>
          </div>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors"
        >
          {pending ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}
