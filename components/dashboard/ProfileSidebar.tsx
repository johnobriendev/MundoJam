import Link from 'next/link'
import type { UserProfileSidebar } from '@/lib/users/getUserProfile'

export default function ProfileSidebar({ profile }: { profile: UserProfileSidebar }) {
  return (
    <aside className="w-56 shrink-0 sticky top-6 hidden lg:block">
      <div className="rounded-lg border bg-surface p-4 flex flex-col items-center gap-3">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-accent font-semibold text-2xl">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="text-center min-w-0 w-full">
          <p className="font-semibold text-primary truncate">{profile.name}</p>
          {profile.city && (
            <p className="text-sm text-secondary truncate">{profile.city}</p>
          )}
        </div>

        {profile.instruments.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {profile.instruments.slice(0, 4).map((i) => (
              <span
                key={i.instrument}
                className="text-xs bg-muted text-accent rounded-full px-2 py-0.5"
              >
                {i.instrument}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5 w-full pt-1">
          <Link
            href={`/musicians/${profile.id}`}
            className="text-sm text-center text-accent hover:underline"
          >
            View profile
          </Link>
          <Link
            href="/profile"
            className="text-sm text-center text-secondary hover:text-primary hover:underline"
          >
            Edit profile
          </Link>
        </div>
      </div>
    </aside>
  )
}
