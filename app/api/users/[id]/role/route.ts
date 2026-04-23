import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/session'
import { updateUserRole } from '@/lib/users/adminUsers'

const schema = z.object({
  role: z.enum(['USER', 'ADMIN']),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const { id } = await params
  if (id === admin.id) {
    return Response.json({ error: 'Cannot change your own role' }, { status: 400 })
  }
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid role' }, { status: 400 })
  }
  await updateUserRole(id, parsed.data.role, admin.id)
  return Response.json({ ok: true })
}
