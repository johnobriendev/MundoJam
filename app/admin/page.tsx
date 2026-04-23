import { prisma } from '@/lib/prisma'
import { PendingJamCard } from '@/components/admin/PendingJamCard'

export default async function AdminPage() {
  const pending = await prisma.jam.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: {
      host: { select: { name: true, email: true } },
      genres: true,
    },
  })

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Pending Jams</h1>
      {pending.length === 0 ? (
        <p className="text-sm text-gray-500">No pending jams — all caught up.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((jam) => (
            <PendingJamCard key={jam.id} jam={jam} />
          ))}
        </div>
      )}
    </div>
  )
}
