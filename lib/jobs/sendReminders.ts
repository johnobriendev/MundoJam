import { format } from 'date-fns'
import { sendEmail } from '../email/sender'
import { jamReminderTemplate } from '../email/templates'
import { prisma } from '../prisma'

export async function sendReminders(): Promise<{ sent: number }> {
  const now = new Date()
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const occurrences = await prisma.jamOccurrence.findMany({
    where: {
      cancelled: false,
      date: { gte: now, lte: in24Hours },
    },
    include: {
      jam: true,
      rsvps: {
        where: { status: 'GOING' },
        include: { user: true },
      },
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  let sent = 0

  for (const occurrence of occurrences) {
    for (const rsvp of occurrence.rsvps) {
      const template = jamReminderTemplate({
        attendeeName: rsvp.user.name,
        jamTitle: occurrence.jam.title,
        date: format(occurrence.date, 'EEEE, MMMM d, yyyy h:mm a'),
        address: occurrence.jam.address,
        occurrenceId: occurrence.id,
        baseUrl,
      })

      await sendEmail({ to: rsvp.user.email, subject: template.subject, text: template.text })
      sent++
    }
  }

  return { sent }
}
