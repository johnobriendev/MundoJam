import { format } from 'date-fns'
import { getUsers } from '@/lib/users/adminUsers'
import { UserRoleToggle } from '@/components/admin/UserRoleToggle'

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Users</h1>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.email} &middot; Joined {format(user.createdAt, 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-gray-400">
                {user._count.hostedJams} jam{user._count.hostedJams !== 1 ? 's' : ''} hosted
              </p>
            </div>
            <UserRoleToggle userId={user.id} currentRole={user.role} />
          </div>
        ))}
      </div>
    </div>
  )
}
