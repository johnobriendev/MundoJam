import { requireAdmin } from '@/lib/session'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen">
      <aside className="w-48 border-r bg-muted p-4 space-y-1 text-sm">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">Admin</p>
        <Link href="/admin" className="block px-2 py-1.5 rounded hover:bg-muted text-primary">
          Pending Jams
        </Link>
        <Link
          href="/admin/users"
          className="block px-2 py-1.5 rounded hover:bg-muted text-primary"
        >
          Users
        </Link>
        <Link
          href="/admin/reports"
          className="block px-2 py-1.5 rounded hover:bg-muted text-primary"
        >
          Reports
        </Link>
        <Link
          href="/admin/audit"
          className="block px-2 py-1.5 rounded hover:bg-muted text-primary"
        >
          Audit Log
        </Link>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
