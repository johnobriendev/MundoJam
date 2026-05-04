import { prisma } from '../prisma'

export async function getUserProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      city: true,
      instruments: { select: { instrument: true } },
    },
  })
}

export type UserProfileSidebar = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>
