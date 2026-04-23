'use client'

import { useState, useTransition } from 'react'

type TargetType = 'JAM' | 'COMMENT' | 'USER'

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: TargetType
  targetId: string
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }
    startTransition(async () => {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason }),
      })
      if (res.ok) {
        setDone(true)
        setOpen(false)
      } else {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  if (done) {
    return <p className="text-xs text-gray-400">Report submitted</p>
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-gray-400 hover:text-red-500">
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Report this content</h2>
            <p className="text-xs text-gray-500 mb-3">
              Describe why this should be reviewed by an admin.
            </p>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('')
              }}
              rows={4}
              placeholder="Explain the issue..."
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setOpen(false)
                  setReason('')
                  setError('')
                }}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
