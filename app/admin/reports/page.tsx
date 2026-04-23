import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { ResolveReportButton } from '@/components/admin/ResolveReportButton'

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'asc' },
    include: { reporter: { select: { name: true, email: true } } },
  })

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Open Reports</h1>
      {reports.length === 0 ? (
        <p className="text-sm text-gray-500">No open reports.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-lg p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    <span className="inline-block px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600 mr-2">
                      {r.targetType}
                    </span>
                    <span className="font-mono text-xs text-gray-500">{r.targetId}</span>
                  </p>
                  <p className="text-gray-700">{r.reason}</p>
                  <p className="text-xs text-gray-400">
                    Reported by {r.reporter.name} ({r.reporter.email}) &middot;{' '}
                    {format(r.createdAt, 'MMM d, yyyy')}
                  </p>
                </div>
                <ResolveReportButton reportId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
