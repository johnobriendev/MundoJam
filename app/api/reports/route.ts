import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { createReport } from '@/lib/reports/createReport'

const schema = z.object({
  targetType: z.enum(['JAM', 'COMMENT', 'USER']),
  targetId: z.string().min(1),
  reason: z.string().min(1).max(1000),
})

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { targetType, targetId, reason } = parsed.data
  await createReport({ reporterId: user.id, targetType, targetId, reason })
  return Response.json({ ok: true })
}
