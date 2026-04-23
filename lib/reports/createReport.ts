import { prisma } from '@/lib/prisma'

type ReportTargetType = 'JAM' | 'COMMENT' | 'USER'

export async function createReport({
  reporterId,
  targetType,
  targetId,
  reason,
}: {
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  reason: string
}) {
  return prisma.report.create({
    data: { reporterId, targetType, targetId, reason },
  })
}
