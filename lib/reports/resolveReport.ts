import { prisma } from '@/lib/prisma'

export async function resolveReport(reportId: string, adminId: string) {
  const report = await prisma.report.update({
    where: { id: reportId },
    data: { status: 'RESOLVED' },
  })

  await prisma.adminAction.create({
    data: {
      adminId,
      actionType: 'RESOLVE_REPORT',
      targetType: 'REPORT',
      targetId: reportId,
    },
  })

  return report
}
