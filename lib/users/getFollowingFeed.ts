import { prisma } from '../prisma'

export async function getFollowingFeed(userId: string) {
  const now = new Date()

  return prisma.jamOccurrence.findMany({
    where: {
      date: { gte: now },
      cancelled: false,
      jam: { status: 'APPROVED' },
      OR: [
        {
          jam: {
            host: { followers: { some: { followerId: userId } } },
          },
        },
        {
          rsvps: {
            some: {
              status: 'GOING',
              user: { followers: { some: { followerId: userId } } },
            },
          },
        },
      ],
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

export type FollowingFeedItem = Awaited<ReturnType<typeof getFollowingFeed>>[number]
