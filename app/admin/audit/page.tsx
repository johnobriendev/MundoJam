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
      <h1 className="text-xl font-semibold text-primary mb-4">Audit Log</h1>
      {actions.length === 0 ? (
        <p className="text-sm text-secondary">No actions recorded yet.</p>
      ) : (
        <div className="border rounded-lg divide-y text-sm">
          {actions.map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <p className="font-medium text-primary">{a.actionType}</p>
                <p className="text-xs text-secondary">
                  {a.targetType} &middot;{' '}
                  <span className="font-mono">{a.targetId}</span>
                  {a.note && <span className="ml-2 text-secondary">— {a.note}</span>}
                </p>
                <p className="text-xs text-secondary">
                  by {a.admin.name} ({a.admin.email})
                </p>
              </div>
              <p className="text-xs text-secondary shrink-0">
                {format(a.createdAt, 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
