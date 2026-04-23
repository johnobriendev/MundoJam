import { sendReminders } from '@/lib/jobs/sendReminders'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not available in production' }, { status: 403 })
  }

  const result = await sendReminders()
  return Response.json(result)
}
