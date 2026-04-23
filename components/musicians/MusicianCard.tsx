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
      className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      {musician.avatarUrl ? (
        <img
          src={musician.avatarUrl}
          alt={musician.name}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <span className="text-indigo-600 font-semibold text-lg">
            {musician.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900">{musician.name}</h3>
          <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
            {SKILL_LABELS[musician.skillLevel] ?? musician.skillLevel}
          </span>
        </div>

        {musician.city && (
          <p className="text-sm text-gray-500 mt-0.5">{musician.city}</p>
        )}

        {musician.bio && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{musician.bio}</p>
        )}

        {musician.instruments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {musician.instruments.slice(0, 5).map((i) => (
              <span
                key={i.instrument}
                className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5"
              >
                {i.instrument}
              </span>
            ))}
            {musician.instruments.length > 5 && (
              <span className="text-xs text-gray-400 py-0.5">
                +{musician.instruments.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
