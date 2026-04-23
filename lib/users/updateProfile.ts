import { prisma } from '../prisma'

export interface UpdateProfileInput {
  userId: string
  name: string
  avatarUrl?: string
  bio?: string
  city?: string
  lat?: number
  lng?: number
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS'
  isDiscoverable: boolean
  instruments: string[]
  genres: string[]
}

export async function updateProfile(input: UpdateProfileInput) {
  const { userId, instruments, genres, ...fields } = input

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...fields,
      instruments: {
        deleteMany: {},
        createMany: { data: instruments.map((instrument) => ({ instrument })) },
      },
      genres: {
        deleteMany: {},
        createMany: { data: genres.map((genre) => ({ genre })) },
      },
    },
  })
}
