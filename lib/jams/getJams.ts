import { prisma } from '../prisma'

export interface JamFiltersInput {
  genres?: string[]
  instruments?: string[]
  equipment?: string[]
  recurrenceType?: string
  dateFrom?: Date
  dateTo?: Date
  city?: string
  country?: string
}

const VALID_RECURRENCE = new Set(['ONE_TIME', 'WEEKLY', 'MONTHLY'])

export async function getJams(filters: JamFiltersInput = {}) {
  const { genres, instruments, equipment, recurrenceType, dateFrom, dateTo, city, country } = filters

  const validRecurrence = recurrenceType && VALID_RECURRENCE.has(recurrenceType)
    ? (recurrenceType as 'ONE_TIME' | 'WEEKLY' | 'MONTHLY')
    : undefined

  return prisma.jamOccurrence.findMany({
    where: {
      date: {
        gte: dateFrom ?? new Date(),
        ...(dateTo ? { lte: dateTo } : {}),
      },
      cancelled: false,
      jam: {
        status: 'APPROVED',
        ...(validRecurrence ? { recurrenceType: validRecurrence } : {}),
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        ...(country ? { country: { contains: country, mode: 'insensitive' } } : {}),
        ...(genres?.length ? { genres: { some: { genre: { in: genres } } } } : {}),
        ...(instruments?.length ? { instrumentsNeeded: { some: { instrument: { in: instruments } } } } : {}),
        ...(equipment?.length ? { equipment: { some: { item: { in: equipment } } } } : {}),
      },
    },
    include: {
      jam: {
        include: {
          host: { select: { id: true, name: true } },
          genres: true,
          instrumentsNeeded: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  })
}

export type JamOccurrenceWithJam = Awaited<ReturnType<typeof getJams>>[number]
