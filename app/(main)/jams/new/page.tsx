import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { JamForm, type JamFormInitialValues } from '@/components/jams/JamForm'
import { submitJam } from './actions'

export default async function NewJamPage({
  searchParams,
}: {
  searchParams: Promise<{ resubmitFrom?: string }>
}) {
  await requireUser()

  const { resubmitFrom } = await searchParams

  let initialValues: JamFormInitialValues | undefined

  if (resubmitFrom) {
    const jam = await prisma.jam.findUnique({
      where: { id: resubmitFrom, status: 'REJECTED' },
      include: { genres: true, instrumentsNeeded: true, equipment: true },
    })

    if (jam) {
      initialValues = {
        title: jam.title,
        description: jam.description,
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
        resubmittedFromId: jam.id,
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {initialValues?.resubmittedFromId ? 'Resubmit Jam' : 'Host a Jam'}
      </h1>
      {initialValues?.resubmittedFromId && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-6">
          Your previous submission was rejected. Review the feedback, make changes, and resubmit.
        </p>
      )}
      <JamForm initialValues={initialValues} action={submitJam} />
    </div>
  )
}
