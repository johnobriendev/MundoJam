import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { rejectJam } from '@/lib/jams/rejectJam'

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const { id } = await ctx.params
  const body = await req.json()
  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
  if (!reason) {
    return Response.json({ error: 'Rejection reason is required' }, { status: 400 })
  }
  await rejectJam(id, admin.id, reason)
  return Response.json({ ok: true })
}
