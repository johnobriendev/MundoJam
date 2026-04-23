import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/sender'
import { jamRejectedTemplate } from '@/lib/email/templates'

export async function rejectJam(jamId: string, adminId: string, reason: string) {
  const jam = await prisma.jam.update({
    where: { id: jamId },
    data: { status: 'REJECTED', rejectionReason: reason },
    include: { host: true },
  })

  await prisma.adminAction.create({
    data: {
      adminId,
      actionType: 'REJECT_JAM',
      targetType: 'JAM',
      targetId: jamId,
      note: reason,
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const { subject, text } = jamRejectedTemplate({
    title: jam.title,
    hostName: jam.host.name,
    reason,
    jamId,
    baseUrl,
  })
  await sendEmail({ to: jam.host.email, subject, text })

  return jam
}
