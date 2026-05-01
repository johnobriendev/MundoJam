import Link from 'next/link'
import type { MusicianSummary } from '@/lib/users/getMusicians'

const SKILL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All levels',
}

export default function MusicianCard({ musician }: { musician: MusicianSummary }) {
  return (
    <Link
      href={`/musicians/${musician.id}`}
      className="flex items-start gap-4 rounded-lg border bg-surface p-4 hover:border-[var(--border-focus)] hover:shadow-sm transition-all"
    >
      {musician.avatarUrl ? (
        <img
          src={musician.avatarUrl}
          alt={musician.name}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="text-accent font-semibold text-lg">
            {musician.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-primary">{musician.name}</h3>
          <span className="text-xs bg-muted text-secondary rounded-full px-2 py-0.5">
            {SKILL_LABELS[musician.skillLevel] ?? musician.skillLevel}
          </span>
        </div>

        {musician.city && (
          <p className="text-sm text-secondary mt-0.5">{musician.city}</p>
        )}

        {musician.bio && (
          <p className="text-sm text-secondary mt-1 line-clamp-2">{musician.bio}</p>
        )}

        {musician.instruments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {musician.instruments.slice(0, 5).map((i) => (
              <span
                key={i.instrument}
                className="text-xs bg-muted text-accent rounded-full px-2 py-0.5"
              >
                {i.instrument}
              </span>
            ))}
            {musician.instruments.length > 5 && (
              <span className="text-xs text-secondary py-0.5">
                +{musician.instruments.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
