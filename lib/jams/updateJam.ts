import { prisma } from '@/lib/prisma'

interface EquipmentItem {
  item: string
  notes?: string
}

export interface UpdateJamInput {
  jamId: string
  title: string
  description: string
  coverImageUrl?: string
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
}

export async function updateJam(input: UpdateJamInput) {
  const { jamId, genres, instruments, equipment, coverImageUrl, ...fields } = input

  return prisma.jam.update({
    where: { id: jamId },
    data: {
      ...fields,
      ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      genres: {
        deleteMany: {},
        createMany: { data: genres.map((genre) => ({ genre })) },
      },
      instrumentsNeeded: {
        deleteMany: {},
        createMany: { data: instruments.map((instrument) => ({ instrument })) },
      },
      equipment: {
        deleteMany: {},
        createMany: { data: equipment },
      },
    },
  })
}
