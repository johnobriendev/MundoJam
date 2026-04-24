import { prisma } from '@/lib/prisma'

interface EquipmentItem {
  item: string
  notes?: string
}

export interface CreateJamInput {
  title: string
  description: string
  coverImageUrl?: string
  hostId: string
  address: string
  city: string
  country: string
  lat: number
  lng: number
  genres: string[]
  instruments: string[]
  equipment: EquipmentItem[]
  recurrenceType: 'ONE_TIME' | 'WEEKLY' | 'MONTHLY'
  startDate: Date
  endTime?: Date
  endDate?: Date
  resubmittedFromId?: string
}

export async function createJam(input: CreateJamInput) {
  return prisma.jam.create({
    data: {
      title: input.title,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
      hostId: input.hostId,
      address: input.address,
      city: input.city,
      country: input.country,
      lat: input.lat,
      lng: input.lng,
      recurrenceType: input.recurrenceType,
      startDate: input.startDate,
      endTime: input.endTime,
      endDate: input.endDate,
      status: 'PENDING',
      resubmittedFromId: input.resubmittedFromId,
      genres: { create: input.genres.map((genre) => ({ genre })) },
      instrumentsNeeded: { create: input.instruments.map((instrument) => ({ instrument })) },
      equipment: { create: input.equipment },
    },
  })
}
