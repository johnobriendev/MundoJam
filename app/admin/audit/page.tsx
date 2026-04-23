import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'

export default async function AdminAuditPage() {
  const actions = await prisma.adminAction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { admin: { select: { name: true, email: true } } },
  })

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Audit Log</h1>
      {actions.length === 0 ? (
        <p className="text-sm text-gray-500">No actions recorded yet.</p>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 text-sm">
          {actions.map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <p className="font-medium text-gray-900">{a.actionType}</p>
                <p className="text-xs text-gray-500">
                  {a.targetType} &middot;{' '}
                  <span className="font-mono">{a.targetId}</span>
                  {a.note && <span className="ml-2 text-gray-400">— {a.note}</span>}
                </p>
                <p className="text-xs text-gray-400">
                  by {a.admin.name} ({a.admin.email})
                </p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">
                {format(a.createdAt, 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
