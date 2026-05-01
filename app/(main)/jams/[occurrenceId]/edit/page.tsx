import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getOccurrence } from '@/lib/occurrences/getOccurrence'
import { JamForm, type JamFormInitialValues } from '@/components/jams/JamForm'
import { updateJamAction } from './actions'

export default async function EditJamPage({
  params,
}: {
  params: Promise<{ occurrenceId: string }>
}) {
  const { occurrenceId } = await params
  const user = await requireUser()

  const occurrence = await getOccurrence(occurrenceId)
  if (!occurrence) notFound()

  const { jam } = occurrence

  if (jam.host.id !== user.id && user.role !== 'ADMIN') notFound()

  if (jam.status === 'REJECTED' || jam.status === 'CANCELLED') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          This jam cannot be edited because it has been{' '}
          {jam.status === 'REJECTED' ? 'rejected' : 'cancelled'}.
        </p>
      </div>
    )
  }

  const initialValues: JamFormInitialValues = {
    title: jam.title,
    description: jam.description,
    coverImageUrl: jam.coverImageUrl ?? undefined,
    address: jam.address,
    city: jam.city,
    country: jam.country,
    genres: jam.genres.map((g) => g.genre),
    instruments: jam.instrumentsNeeded.map((i) => i.instrument),
    equipment: jam.equipment.map((e) => ({ item: e.item, notes: e.notes ?? '' })),
    recurrenceType: jam.recurrenceType,
    startDate: jam.startDate.toISOString().slice(0, 16),
    endTime: jam.endTime?.toISOString().slice(11, 16),
    endDate: jam.endDate?.toISOString().slice(0, 10),
  }

  const boundAction = updateJamAction.bind(null, occurrenceId)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-primary mb-6">Edit Jam</h1>
      <JamForm initialValues={initialValues} action={boundAction} submitLabel="Save changes" />
    </div>
  )
}
