'use client'

import { useActionState, useState } from 'react'
import { submitJam, type SubmitJamState } from '@/app/(main)/jams/new/actions'
import { GENRES } from '@/constants/genres'
import { INSTRUMENTS } from '@/constants/instruments'
import { EQUIPMENT } from '@/constants/equipment'

interface EquipmentEntry {
  item: string
  notes: string
}

export interface JamFormInitialValues {
  title?: string
  description?: string
  address?: string
  city?: string
  genres?: string[]
  instruments?: string[]
  equipment?: EquipmentEntry[]
  recurrenceType?: 'ONE_TIME' | 'WEEKLY' | 'MONTHLY'
  startDate?: string
  endTime?: string
  endDate?: string
  resubmittedFromId?: string
}

const STANDARD_GENRES = GENRES.filter((g) => g !== 'Other')
const STANDARD_INSTRUMENTS = INSTRUMENTS.filter((i) => i !== 'Other')
const STANDARD_EQUIPMENT = EQUIPMENT.filter((e) => e !== 'Other')

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

export function JamForm({ initialValues }: { initialValues?: JamFormInitialValues }) {
  const [state, action, pending] = useActionState<SubmitJamState, FormData>(submitJam, {})

  // --- Genres ---
  const initialGenreSet = new Set(
    (initialValues?.genres ?? []).filter((g) => STANDARD_GENRES.includes(g as (typeof STANDARD_GENRES)[number]))
  )
  const initialGenreOther =
    initialValues?.genres?.find((g) => !GENRES.includes(g as (typeof GENRES)[number])) ?? ''

  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(initialGenreSet)
  const [genreOther, setGenreOther] = useState(initialGenreOther)
  const [genreOtherChecked, setGenreOtherChecked] = useState(!!initialGenreOther)

  // --- Instruments ---
  const initialInstrumentSet = new Set(
    (initialValues?.instruments ?? []).filter((i) =>
      STANDARD_INSTRUMENTS.includes(i as (typeof STANDARD_INSTRUMENTS)[number])
    )
  )
  const initialInstrumentOther =
    initialValues?.instruments?.find(
      (i) => !INSTRUMENTS.includes(i as (typeof INSTRUMENTS)[number])
    ) ?? ''

  const [selectedInstruments, setSelectedInstruments] = useState<Set<string>>(initialInstrumentSet)
  const [instrumentOther, setInstrumentOther] = useState(initialInstrumentOther)
  const [instrumentOtherChecked, setInstrumentOtherChecked] = useState(!!initialInstrumentOther)

  // --- Equipment ---
  const initialEquipmentMap = new Map<string, string>(
    (initialValues?.equipment ?? [])
      .filter((e) => STANDARD_EQUIPMENT.includes(e.item as (typeof STANDARD_EQUIPMENT)[number]))
      .map((e) => [e.item, e.notes])
  )
  const initialEquipmentOther = initialValues?.equipment?.find(
    (e) => !EQUIPMENT.includes(e.item as (typeof EQUIPMENT)[number])
  )

  const [equipmentMap, setEquipmentMap] = useState<Map<string, string>>(initialEquipmentMap)
  const [equipmentOtherChecked, setEquipmentOtherChecked] = useState(!!initialEquipmentOther)
  const [equipmentOtherName, setEquipmentOtherName] = useState(initialEquipmentOther?.item ?? '')
  const [equipmentOtherNotes, setEquipmentOtherNotes] = useState(initialEquipmentOther?.notes ?? '')

  // --- Recurrence ---
  const [recurrenceType, setRecurrenceType] = useState<'ONE_TIME' | 'WEEKLY' | 'MONTHLY'>(
    initialValues?.recurrenceType ?? 'ONE_TIME'
  )

  // --- Computed serialized values ---
  const finalGenres = [
    ...[...selectedGenres],
    ...(genreOtherChecked && genreOther ? [genreOther] : []),
  ]

  const finalInstruments = [
    ...[...selectedInstruments],
    ...(instrumentOtherChecked && instrumentOther ? [instrumentOther] : []),
  ]

  const finalEquipment: EquipmentEntry[] = [
    ...[...equipmentMap.entries()].map(([item, notes]) => ({ item, notes })),
    ...(equipmentOtherChecked && equipmentOtherName
      ? [{ item: equipmentOtherName, notes: equipmentOtherNotes }]
      : []),
  ]

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev)
      next.has(genre) ? next.delete(genre) : next.add(genre)
      return next
    })
  }

  function toggleInstrument(instrument: string) {
    setSelectedInstruments((prev) => {
      const next = new Set(prev)
      next.has(instrument) ? next.delete(instrument) : next.add(instrument)
      return next
    })
  }

  function toggleEquipment(item: string) {
    setEquipmentMap((prev) => {
      const next = new Map(prev)
      next.has(item) ? next.delete(item) : next.set(item, '')
      return next
    })
  }

  function updateEquipmentNotes(item: string, notes: string) {
    setEquipmentMap((prev) => new Map(prev).set(item, notes))
  }

  const errors = state.errors

  return (
    <form action={action} encType="multipart/form-data" className="space-y-8">
      {/* Hidden serialized multi-select data */}
      <input type="hidden" name="genresJson" value={JSON.stringify(finalGenres)} />
      <input type="hidden" name="instrumentsJson" value={JSON.stringify(finalInstruments)} />
      <input type="hidden" name="equipmentJson" value={JSON.stringify(finalEquipment)} />
      {initialValues?.resubmittedFromId && (
        <input type="hidden" name="resubmittedFromId" value={initialValues.resubmittedFromId} />
      )}

      {fieldError(errors, '_form') && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {fieldError(errors, '_form')}
        </p>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialValues?.title}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Wednesday Night Blues Jam"
        />
        {fieldError(errors, 'title') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'title')}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={initialValues?.description}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Tell musicians what to expect…"
        />
        {fieldError(errors, 'description') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'description')}</p>
        )}
      </div>

      {/* Cover image */}
      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
          Cover image
        </label>
        <input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/*"
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {fieldError(errors, 'coverImage') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'coverImage')}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          defaultValue={initialValues?.address}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="123 Main St, Austin, TX 78701"
        />
        {fieldError(errors, 'address') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'address')}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <input
          id="city"
          name="city"
          type="text"
          required
          defaultValue={initialValues?.city}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Austin"
        />
        {fieldError(errors, 'city') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'city')}</p>
        )}
      </div>

      {/* Genres */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Genres <span className="text-red-500">*</span>
        </p>
        <CheckboxGrid items={STANDARD_GENRES} selected={selectedGenres} onToggle={toggleGenre} />
        {/* Other */}
        <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={genreOtherChecked}
            onChange={() => setGenreOtherChecked((v) => !v)}
          />
          Other
        </label>
        {genreOtherChecked && (
          <input
            type="text"
            value={genreOther}
            onChange={(e) => setGenreOther(e.target.value)}
            placeholder="Specify genre…"
            className="mt-2 w-full max-w-xs border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
        {fieldError(errors, 'genres') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'genres')}</p>
        )}
      </div>

      {/* Instruments needed */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Instruments needed</p>
        <CheckboxGrid
          items={STANDARD_INSTRUMENTS}
          selected={selectedInstruments}
          onToggle={toggleInstrument}
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={instrumentOtherChecked}
            onChange={() => setInstrumentOtherChecked((v) => !v)}
          />
          Other
        </label>
        {instrumentOtherChecked && (
          <input
            type="text"
            value={instrumentOther}
            onChange={(e) => setInstrumentOther(e.target.value)}
            placeholder="Specify instrument…"
            className="mt-2 w-full max-w-xs border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
      </div>

      {/* Equipment provided */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Equipment provided</p>
        <div className="space-y-3">
          {STANDARD_EQUIPMENT.map((item) => (
            <div key={item}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={equipmentMap.has(item)}
                  onChange={() => toggleEquipment(item)}
                />
                {item}
              </label>
              {equipmentMap.has(item) && (
                <input
                  type="text"
                  value={equipmentMap.get(item) ?? ''}
                  onChange={(e) => updateEquipmentNotes(item, e.target.value)}
                  placeholder="Notes (optional)…"
                  className="mt-1 ml-6 w-full max-w-sm border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          ))}
          {/* Other equipment */}
          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={equipmentOtherChecked}
                onChange={() => setEquipmentOtherChecked((v) => !v)}
              />
              Other
            </label>
            {equipmentOtherChecked && (
              <div className="mt-1 ml-6 space-y-1">
                <input
                  type="text"
                  value={equipmentOtherName}
                  onChange={(e) => setEquipmentOtherName(e.target.value)}
                  placeholder="Equipment name…"
                  className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={equipmentOtherNotes}
                  onChange={(e) => setEquipmentOtherNotes(e.target.value)}
                  placeholder="Notes (optional)…"
                  className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recurrence type */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Recurrence <span className="text-red-500">*</span>
        </p>
        <div className="flex gap-4">
          {(['ONE_TIME', 'WEEKLY', 'MONTHLY'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="recurrenceType"
                value={type}
                checked={recurrenceType === type}
                onChange={() => setRecurrenceType(type)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              {type === 'ONE_TIME' ? 'One-time' : type === 'WEEKLY' ? 'Weekly' : 'Monthly'}
            </label>
          ))}
        </div>
        {fieldError(errors, 'recurrenceType') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'recurrenceType')}</p>
        )}
      </div>

      {/* Start date + time */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-3">
          {recurrenceType === 'ONE_TIME' ? 'Date & time' : 'First occurrence'}{' '}
          <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-lg">
          <div>
            <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">
              Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={initialValues?.startDate?.slice(0, 10)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-xs font-medium text-gray-500 mb-1">
              Start time
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue={initialValues?.startDate?.slice(11, 16)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-xs font-medium text-gray-500 mb-1">
              End time <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={initialValues?.endTime}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        {fieldError(errors, 'startDate') && (
          <p className="text-xs text-red-600 mt-1">{fieldError(errors, 'startDate')}</p>
        )}
      </div>

      {/* End date — only for recurring jams */}
      {recurrenceType !== 'ONE_TIME' && (
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End date <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={initialValues?.endDate?.slice(0, 10)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank for an ongoing {recurrenceType === 'WEEKLY' ? 'weekly' : 'monthly'} jam.
          </p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors"
        >
          {pending ? 'Submitting…' : 'Submit for approval'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Your jam will be reviewed by our team before appearing on the site.
        </p>
      </div>
    </form>
  )
}
