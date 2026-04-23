'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function ResolveReportButton({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleResolve() {
    startTransition(async () => {
      await fetch(`/api/reports/${reportId}/resolve`, { method: 'POST' })
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleResolve}
      disabled={isPending}
      className="shrink-0 px-3 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
    >
      Resolve
    </button>
  )
}
