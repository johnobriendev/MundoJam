import { addMonths, addWeeks, endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from '../prisma'

export async function generateOccurrences(): Promise<{ created: number }> {
  const now = new Date()
  const cutoffDate = endOfMonth(addMonths(startOfMonth(now), 1))

  const jams = await prisma.jam.findMany({
    where: { status: 'APPROVED' },
  })

  let created = 0

  for (const jam of jams) {
    const effectiveCutoff =
      jam.endDate && jam.endDate < cutoffDate ? jam.endDate : cutoffDate

    const dates: Date[] = []

    if (jam.recurrenceType === 'ONE_TIME') {
      dates.push(jam.startDate)
    } else if (jam.recurrenceType === 'WEEKLY') {
      let d = jam.startDate
      while (d <= effectiveCutoff) {
        dates.push(new Date(d))
        d = addWeeks(d, 1)
      }
    } else if (jam.recurrenceType === 'MONTHLY') {
      let d = jam.startDate
      while (d <= effectiveCutoff) {
        dates.push(new Date(d))
        d = addMonths(d, 1)
      }
    }

    if (dates.length > 0) {
      const result = await prisma.jamOccurrence.createMany({
        data: dates.map((date) => ({ jamId: jam.id, date })),
        skipDuplicates: true,
      })
      created += result.count
    }
  }

  return { created }
}
