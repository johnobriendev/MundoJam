'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { uploadFile } from '@/lib/storage'
import { geocodeAddress } from '@/lib/geocoding'
import { createJam } from '@/lib/jams/createJam'

const equipmentItemSchema = z.object({
  item: z.string().min(1),
  notes: z.string().optional(),
})

const jamSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  recurrenceType: z.enum(['ONE_TIME', 'WEEKLY', 'MONTHLY'], {
    error: 'Select a recurrence type',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endTime: z.string().optional(),
  endDate: z.string().optional(),
  genres: z.array(z.string().min(1)).min(1, 'Select at least one genre'),
  instruments: z.array(z.string().min(1)),
  equipment: z.array(equipmentItemSchema),
  resubmittedFromId: z.string().optional(),
})

export type SubmitJamState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function submitJam(
  _prevState: SubmitJamState,
  formData: FormData
): Promise<SubmitJamState> {
  const user = await requireUser()

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
    recurrenceType: formData.get('recurrenceType'),
    startDate: startDateCombined,
    endTime: endTimeCombined,
    endDate: (formData.get('endDate') as string) || undefined,
    genres,
    instruments,
    equipment,
    resubmittedFromId: (formData.get('resubmittedFromId') as string) || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { title, description, address, city, recurrenceType, startDate, endTime, endDate, resubmittedFromId } =
    validated.data

  let coverImageUrl: string | undefined
  const coverImage = formData.get('coverImage') as File | null
  if (coverImage && coverImage.size > 0) {
    try {
      coverImageUrl = await uploadFile(coverImage, 'jam-covers')
    } catch {
      return { errors: { coverImage: ['Failed to upload image — please try again'] } }
    }
  }

  const { lat, lng } = await geocodeAddress(address)

  await createJam({
    title,
    description,
    coverImageUrl,
    hostId: user.id,
    address,
    city,
    lat,
    lng,
    genres: validated.data.genres,
    instruments: validated.data.instruments,
    equipment: validated.data.equipment,
    recurrenceType,
    startDate: new Date(startDate),
    endTime: endTime ? new Date(endTime) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    resubmittedFromId,
  })

  redirect('/?submitted=1')
}
