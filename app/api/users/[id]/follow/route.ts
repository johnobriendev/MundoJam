import { type NextRequest } from 'next/server'
import { requireUser } from '@/lib/session'
import { followUser, unfollowUser } from '@/lib/users/followUser'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  if (id === user.id) {
    return Response.json({ error: 'Cannot follow yourself' }, { status: 400 })
  }
  await followUser(user.id, id)
  return Response.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  try {
    await unfollowUser(user.id, id)
  } catch {
    // Not following, fine
  }
  return Response.json({ ok: true })
}
