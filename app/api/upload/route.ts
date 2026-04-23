import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { uploadFile } from '@/lib/storage'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const bucket = formData.get('bucket') as string

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (bucket !== 'avatars' && bucket !== 'jam-covers') {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  }

  try {
    const url = await uploadFile(file, bucket)
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
