import { type NextRequest } from 'next/server'
import { requireUser } from '@/lib/session'
import { upsertRsvp, deleteRsvp } from '@/lib/occurrences/upsertRsvp'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const { status } = await request.json()
  if (status !== 'GOING' && status !== 'INTERESTED') {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }
  const rsvp = await upsertRsvp(user.id, id, status)
  return Response.json(rsvp)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  try {
    await deleteRsvp(user.id, id)
  } catch {
    // RSVP didn't exist, fine
  }
  return Response.json({ ok: true })
}
