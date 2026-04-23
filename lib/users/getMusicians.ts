import { prisma } from '../prisma'

export interface MusicianFiltersInput {
  city?: string
  instruments?: string[]
  genres?: string[]
  skillLevel?: string
}

const VALID_SKILL = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'])

export async function getMusicians(filters: MusicianFiltersInput = {}) {
  const { city, instruments, genres, skillLevel } = filters

  const validSkill =
    skillLevel && VALID_SKILL.has(skillLevel)
      ? (skillLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS')
      : undefined

  return prisma.user.findMany({
    where: {
      isDiscoverable: true,
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(validSkill ? { skillLevel: validSkill } : {}),
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
      skillLevel: true,
      instruments: { select: { instrument: true } },
      genres: { select: { genre: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export type MusicianSummary = Awaited<ReturnType<typeof getMusicians>>[number]
