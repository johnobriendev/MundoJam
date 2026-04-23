import { prisma } from '../prisma'

export async function upsertRsvp(
  userId: string,
  occurrenceId: string,
  status: 'GOING' | 'INTERESTED',
) {
  return prisma.rsvp.upsert({
    where: { userId_occurrenceId: { userId, occurrenceId } },
    create: { userId, occurrenceId, status },
    update: { status },
  })
}

export async function deleteRsvp(userId: string, occurrenceId: string) {
  return prisma.rsvp.delete({
    where: { userId_occurrenceId: { userId, occurrenceId } },
  })
}
