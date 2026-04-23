import { type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { resolveReport } from '@/lib/reports/resolveReport'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const { id } = await params
  await resolveReport(id, admin.id)
  return Response.json({ ok: true })
}
