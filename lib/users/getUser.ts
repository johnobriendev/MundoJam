import { prisma } from '../prisma'

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      city: true,
      skillLevel: true,
      isDiscoverable: true,
      instruments: { select: { instrument: true } },
      genres: { select: { genre: true } },
    },
  })
}

export type UserProfile = NonNullable<Awaited<ReturnType<typeof getUser>>>

export async function getUserWithActivity(id: string) {
  const now = new Date()

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      city: true,
      skillLevel: true,
      isDiscoverable: true,
      instruments: { select: { instrument: true } },
      genres: { select: { genre: true } },
      hostedJams: {
        where: { status: 'APPROVED' },
        select: {
          id: true,
          title: true,
          city: true,
          recurrenceType: true,
          occurrences: {
            where: { date: { gte: now }, cancelled: false },
            orderBy: { date: 'asc' },
            take: 5,
            select: { id: true, date: true },
          },
        },
      },
      rsvps: {
        where: {
          status: 'GOING',
          occurrence: { date: { gte: now }, cancelled: false, jam: { status: 'APPROVED' } },
        },
        select: {
          occurrence: {
            select: {
              id: true,
              date: true,
              jam: {
                select: {
                  id: true,
                  title: true,
                  city: true,
                  host: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  })
}

export type UserWithActivity = NonNullable<Awaited<ReturnType<typeof getUserWithActivity>>>
