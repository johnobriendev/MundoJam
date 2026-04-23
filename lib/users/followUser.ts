import { prisma } from '../prisma'

export async function followUser(followerId: string, followingId: string) {
  return prisma.follow.create({
    data: { followerId, followingId },
  })
}

export async function unfollowUser(followerId: string, followingId: string) {
  return prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  })
}

export async function isFollowing(followerId: string, followingId: string) {
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })
  return follow !== null
}
