import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function uploadFile(
  file: File,
  bucket: 'avatars' | 'jam-covers'
): Promise<string> {
  if (process.env.USE_REAL_STORAGE === 'true') {
    throw new Error('Real storage not yet configured. Set USE_REAL_STORAGE=false or implement the Supabase branch.')
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const filename = `${bucket}-${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await writeFile(join(uploadDir, filename), buffer)
  return `/uploads/${filename}`
}
