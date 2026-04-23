import { prisma } from '../prisma'

export async function createComment(
  userId: string,
  occurrenceId: string,
  body: string,
  parentId?: string,
) {
  return prisma.comment.create({
    data: { userId, occurrenceId, body, parentId: parentId ?? null },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })
}
