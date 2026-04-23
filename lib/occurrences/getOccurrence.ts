import { prisma } from '../prisma'

export async function getOccurrence(id: string) {
  return prisma.jamOccurrence.findUnique({
    where: { id },
    include: {
      jam: {
        include: {
          host: { select: { id: true, name: true, avatarUrl: true } },
          genres: true,
          instrumentsNeeded: true,
          equipment: true,
        },
      },
      rsvps: {
        include: { user: { select: { id: true, name: true } } },
      },
      comments: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export type OccurrenceDetail = NonNullable<Awaited<ReturnType<typeof getOccurrence>>>
