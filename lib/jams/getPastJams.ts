import { prisma } from '../prisma'
import type { JamFiltersInput } from './getJams'

const PAGE_SIZE = 10
const VALID_RECURRENCE = new Set(['ONE_TIME', 'WEEKLY', 'MONTHLY'])

export async function getPastJams(filters: JamFiltersInput & { page?: number } = {}) {
  const { genres, instruments, equipment, recurrenceType, dateFrom, dateTo, city, country, page = 1 } = filters

  const validRecurrence = recurrenceType && VALID_RECURRENCE.has(recurrenceType)
    ? (recurrenceType as 'ONE_TIME' | 'WEEKLY' | 'MONTHLY')
    : undefined

  const now = new Date()
  const upperBound = dateTo && dateTo < now ? dateTo : now

  const rows = await prisma.jamOccurrence.findMany({
    where: {
      date: {
        lt: upperBound,
        ...(dateFrom ? { gte: dateFrom } : {}),
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
    orderBy: { date: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE + 1,
  })

  const hasMore = rows.length > PAGE_SIZE
  return { occurrences: rows.slice(0, PAGE_SIZE), hasMore }
}

export { PAGE_SIZE }
