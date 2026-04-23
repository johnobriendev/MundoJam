'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

type CommentUser = { id: string; name: string; avatarUrl: string | null }
type CommentItem = {
  id: string
  body: string
  parentId: string | null
  createdAt: Date
  user: CommentUser
}

function CommentForm({
  occurrenceId,
  parentId,
  onDone,
}: {
  occurrenceId: string
  parentId?: string
  onDone?: () => void
}) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await fetch(`/api/occurrences/${occurrenceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), parentId }),
      })
      setBody('')
      router.refresh()
      onDone?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? 'Write a reply…' : 'Add a comment…'}
        className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <button
        type="submit"
        disabled={submitting || !body.trim()}
        className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        Post
      </button>
    </form>
  )
}

function CommentRow({
  comment,
  occurrenceId,
  replies,
  canReply,
}: {
  comment: CommentItem
  occurrenceId: string
  replies: CommentItem[]
  canReply: boolean
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
        {comment.user.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-900">{comment.user.name}</span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-gray-700 mt-0.5">{comment.body}</p>
        {canReply && (
          <button
            onClick={() => setShowReplyForm((s) => !s)}
            className="text-xs text-gray-400 hover:text-indigo-600 mt-1"
          >
            {showReplyForm ? 'Cancel' : 'Reply'}
          </button>
        )}
        {showReplyForm && (
          <div className="mt-2">
            <CommentForm
              occurrenceId={occurrenceId}
              parentId={comment.id}
              onDone={() => setShowReplyForm(false)}
            />
          </div>
        )}
        {replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium">
                  {reply.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-gray-900">{reply.user.name}</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{reply.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentThread({
  occurrenceId,
  comments,
  currentUserId,
}: {
  occurrenceId: string
  comments: CommentItem[]
  currentUserId: string | null
}) {
  const topLevel = comments.filter((c) => !c.parentId)
  const replies = comments.filter((c) => c.parentId)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">
        Comments{comments.length > 0 ? ` (${comments.length})` : ''}
      </h3>

      {topLevel.length === 0 && (
        <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
      )}

      <div className="space-y-5">
        {topLevel.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            occurrenceId={occurrenceId}
            replies={replies.filter((r) => r.parentId === comment.id)}
            canReply={!!currentUserId}
          />
        ))}
      </div>

      <div className="pt-3 border-t border-gray-100">
        {currentUserId ? (
          <CommentForm occurrenceId={occurrenceId} />
        ) : (
          <p className="text-sm text-gray-400">
            <a href="/login" className="text-indigo-600 hover:underline">
              Sign in
            </a>{' '}
            to comment
          </p>
        )}
      </div>
    </div>
  )
}
