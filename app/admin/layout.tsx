import { requireAdmin } from '@/lib/session'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen">
      <aside className="w-48 border-r border-gray-200 bg-gray-50 p-4 space-y-1 text-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Admin</p>
        <Link href="/admin" className="block px-2 py-1.5 rounded hover:bg-gray-200 text-gray-700">
          Pending Jams
        </Link>
        <Link
          href="/admin/users"
          className="block px-2 py-1.5 rounded hover:bg-gray-200 text-gray-700"
        >
          Users
        </Link>
        <Link
          href="/admin/reports"
          className="block px-2 py-1.5 rounded hover:bg-gray-200 text-gray-700"
        >
          Reports
        </Link>
        <Link
          href="/admin/audit"
          className="block px-2 py-1.5 rounded hover:bg-gray-200 text-gray-700"
        >
          Audit Log
        </Link>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
