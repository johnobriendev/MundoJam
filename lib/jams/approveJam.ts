import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/sender'
import { jamApprovedTemplate } from '@/lib/email/templates'
import { generateOccurrences } from '@/lib/occurrences/generateOccurrences'

export async function approveJam(jamId: string, adminId: string) {
  const jam = await prisma.jam.update({
    where: { id: jamId },
    data: { status: 'APPROVED' },
    include: { host: true },
  })

  await generateOccurrences()

  await prisma.adminAction.create({
    data: {
      adminId,
      actionType: 'APPROVE_JAM',
      targetType: 'JAM',
      targetId: jamId,
    },
  })

  const { subject, text } = jamApprovedTemplate({ title: jam.title, hostName: jam.host.name })
  await sendEmail({ to: jam.host.email, subject, text })

  return jam
}
