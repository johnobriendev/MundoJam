import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { approveJam } from '@/lib/jams/approveJam'

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const { id } = await ctx.params
  await approveJam(id, admin.id)
  return Response.json({ ok: true })
}
