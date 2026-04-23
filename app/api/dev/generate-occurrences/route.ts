import { generateOccurrences } from '@/lib/occurrences/generateOccurrences'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not available in production' }, { status: 403 })
  }

  const result = await generateOccurrences()
  return Response.json(result)
}
