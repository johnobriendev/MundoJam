import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { JamAdminActions } from '@/components/admin/JamAdminActions'

export default async function AdminJamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jam = await prisma.jam.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, name: true, email: true, city: true } },
      genres: true,
      instrumentsNeeded: true,
      equipment: true,
    },
  })

  if (!jam) notFound()

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
          &larr; Pending queue
        </Link>
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[jam.status]}`}
        >
          {jam.status}
        </span>
      </div>

      {jam.coverImageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image src={jam.coverImageUrl} alt={jam.title} fill className="object-cover" />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{jam.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submitted by{' '}
          <span className="font-medium text-gray-700">{jam.host.name}</span>{' '}
          ({jam.host.email})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
          <p className="text-gray-800">{jam.address}</p>
          <p className="text-gray-500">{jam.city}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Schedule</p>
          <p className="text-gray-800">
            {jam.recurrenceType === 'ONE_TIME'
              ? 'One-time'
              : jam.recurrenceType === 'WEEKLY'
                ? 'Weekly'
                : 'Monthly'}
          </p>
          <p className="text-gray-500">
            {format(new Date(jam.startDate), 'MMM d, yyyy')}
            {jam.endDate && ` – ${format(new Date(jam.endDate), 'MMM d, yyyy')}`}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{jam.description}</p>
      </div>

      {jam.genres.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Genres</p>
          <div className="flex flex-wrap gap-1.5">
            {jam.genres.map((g) => (
              <span
                key={g.genre}
                className="inline-block px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded"
              >
                {g.genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {jam.instrumentsNeeded.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Instruments needed
          </p>
          <div className="flex flex-wrap gap-1.5">
            {jam.instrumentsNeeded.map((i) => (
              <span
                key={i.instrument}
                className="inline-block px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded"
              >
                {i.instrument}
              </span>
            ))}
          </div>
        </div>
      )}

      {jam.equipment.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Equipment provided
          </p>
          <ul className="space-y-1">
            {jam.equipment.map((e) => (
              <li key={e.id} className="text-sm text-gray-700">
                {e.item}
                {e.notes && <span className="text-gray-400 ml-2 text-xs">— {e.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-xs text-gray-500">
        <p>Map pin preview: {jam.lat.toFixed(5)}, {jam.lng.toFixed(5)}</p>
      </div>

      {jam.rejectionReason && (
        <div className="border border-red-200 rounded-lg p-3 bg-red-50">
          <p className="text-xs font-semibold text-red-700 mb-0.5">Rejection reason</p>
          <p className="text-sm text-red-600">{jam.rejectionReason}</p>
        </div>
      )}

      <div className="pt-2 border-t border-gray-200">
        <JamAdminActions jamId={jam.id} status={jam.status} />
      </div>
    </div>
  )
}
