'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { uploadFile } from '@/lib/storage'
import { geocodeAddress } from '@/lib/geocoding'
import { updateJam } from '@/lib/jams/updateJam'
import { jamSchema, type JamFormState } from '@/lib/jams/jamSchema'
import { prisma } from '@/lib/prisma'

export async function updateJamAction(
  occurrenceId: string,
  _prevState: JamFormState,
  formData: FormData
): Promise<JamFormState> {
  const user = await requireUser()

  const occurrence = await prisma.jamOccurrence.findUnique({
    where: { id: occurrenceId },
    include: { jam: true },
  })

  if (!occurrence) {
    return { errors: { _form: ['Jam not found'] } }
  }

  const { jam } = occurrence

  if (jam.hostId !== user.id && user.role !== 'ADMIN') {
    return { errors: { _form: ['You are not authorized to edit this jam'] } }
  }

  if (jam.status === 'CANCELLED') {
    return { errors: { _form: ['This jam cannot be edited because it has been cancelled'] } }
  }

  let genres: string[] = []
  let instruments: string[] = []
  let equipment: { item: string; notes?: string }[] = []

  try {
    genres = JSON.parse((formData.get('genresJson') as string) || '[]')
    instruments = JSON.parse((formData.get('instrumentsJson') as string) || '[]')
    equipment = JSON.parse((formData.get('equipmentJson') as string) || '[]')
  } catch {
    return { errors: { _form: ['Invalid form data — please try again'] } }
  }

  const startDateStr = formData.get('startDate') as string
  const startTimeStr = formData.get('startTime') as string
  const endTimeStr = formData.get('endTime') as string
  const startDateCombined =
    startDateStr && startTimeStr ? `${startDateStr}T${startTimeStr}` : ''
  const endTimeCombined =
    startDateStr && endTimeStr ? `${startDateStr}T${endTimeStr}` : undefined

  const validated = jamSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    address: formData.get('address'),
    city: formData.get('city'),
    country: formData.get('country'),
    recurrenceType: formData.get('recurrenceType'),
    startDate: startDateCombined,
    endTime: endTimeCombined,
    endDate: (formData.get('endDate') as string) || undefined,
    genres,
    instruments,
    equipment,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { title, description, address, city, country, recurrenceType, startDate, endTime, endDate } =
    validated.data

  let newCoverImageUrl: string | undefined
  const coverImage = formData.get('coverImage') as File | null
  if (coverImage && coverImage.size > 0) {
    try {
      newCoverImageUrl = await uploadFile(coverImage, 'jam-covers')
    } catch {
      return { errors: { coverImage: ['Failed to upload image — please try again'] } }
    }
  }

  const { lat, lng } = await geocodeAddress(address)

  await updateJam({
    jamId: jam.id,
    title,
    description,
    coverImageUrl: newCoverImageUrl,
    address,
    city,
    country,
    lat,
    lng,
    genres: validated.data.genres,
    instruments: validated.data.instruments,
    equipment: validated.data.equipment,
    recurrenceType,
    startDate: new Date(startDate),
    endTime: endTime ? new Date(endTime) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  })

  redirect(`/jams/${occurrenceId}`)
}
