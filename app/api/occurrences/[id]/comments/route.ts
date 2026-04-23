import { type NextRequest } from 'next/server'
import { requireUser } from '@/lib/session'
import { createComment } from '@/lib/comments/createComment'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const { body, parentId } = await request.json()
  if (!body?.trim()) {
    return Response.json({ error: 'Body required' }, { status: 400 })
  }
  const comment = await createComment(user.id, id, body.trim(), parentId)
  return Response.json(comment)
}
