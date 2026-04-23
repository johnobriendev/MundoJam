export function jamApprovedTemplate(jam: { title: string; hostName: string }) {
  return {
    subject: `Your jam "${jam.title}" has been approved!`,
    text: `Hi ${jam.hostName},\n\nGreat news — your jam "${jam.title}" has been approved and is now live on MundoJam. Musicians can now discover and RSVP to your sessions.\n\nKeep jamming,\nThe MundoJam Team`,
  }
}

export function jamRejectedTemplate(jam: {
  title: string
  hostName: string
  reason: string
  jamId: string
  baseUrl: string
}) {
  const resubmitUrl = `${jam.baseUrl}/jams/new?resubmitFrom=${jam.jamId}`
  return {
    subject: `Update on your jam "${jam.title}"`,
    text: `Hi ${jam.hostName},\n\nUnfortunately your jam "${jam.title}" was not approved at this time.\n\nReason: ${jam.reason}\n\nYou can update and resubmit your jam here:\n${resubmitUrl}\n\nThe MundoJam Team`,
  }
}

export function jamReminderTemplate(data: {
  attendeeName: string
  jamTitle: string
  date: string
  address: string
  occurrenceId: string
  baseUrl: string
}) {
  const jamUrl = `${data.baseUrl}/jams/${data.occurrenceId}`
  return {
    subject: `Reminder: "${data.jamTitle}" is coming up`,
    text: `Hi ${data.attendeeName},\n\nJust a reminder that "${data.jamTitle}" is happening on ${data.date} at ${data.address}.\n\nView details: ${jamUrl}\n\nSee you there,\nThe MundoJam Team`,
  }
}
