import { requireUser } from '@/lib/session'
import { getUser } from '@/lib/users/getUser'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { notFound } from 'next/navigation'

export default async function ProfilePage() {
  const session = await requireUser()
  const profile = await getUser(session.id)

  if (!profile) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-primary mb-8">Edit profile</h1>
      <ProfileForm profile={profile} />
    </div>
  )
}
