import { format } from 'date-fns'
import { getUsers } from '@/lib/users/adminUsers'
import { UserRoleToggle } from '@/components/admin/UserRoleToggle'

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h1 className="text-xl font-semibold text-primary mb-4">Users</h1>
      <div className="border rounded-lg divide-y">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-primary truncate">{user.name}</p>
              <p className="text-xs text-secondary">
                {user.email} &middot; Joined {format(user.createdAt, 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-secondary">
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
