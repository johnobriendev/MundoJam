import { prisma } from '../prisma'

export interface MusicianFiltersInput {
  city?: string
  instruments?: string[]
  genres?: string[]
}

export async function getMusicians(filters: MusicianFiltersInput = {}) {
  const { city, instruments, genres } = filters

  return prisma.user.findMany({
    where: {
      isDiscoverable: true,
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(instruments?.length
        ? { instruments: { some: { instrument: { in: instruments } } } }
        : {}),
      ...(genres?.length ? { genres: { some: { genre: { in: genres } } } } : {}),
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      city: true,
      instruments: { select: { instrument: true } },
      genres: { select: { genre: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export type MusicianSummary = Awaited<ReturnType<typeof getMusicians>>[number]
