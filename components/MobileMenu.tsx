'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Props {
  isSignedIn: boolean
  isAdmin: boolean
}

export function MobileMenu({ isSignedIn, isAdmin }: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1 text-secondary hover:text-primary"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="17" y2="6" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="14" x2="17" y2="14" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-44 bg-surface border rounded-lg shadow-lg py-1.5 z-50 flex flex-col text-sm">
          <Link href="/" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted">
            Discover
          </Link>

          {isSignedIn ? (
            <>
              <Link href="/following" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted">
                Following
              </Link>
              <Link href="/musicians" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted">
                Musicians
              </Link>
              <Link href="/jams/new" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted">
                Host a Jam
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted">
                  Admin
                </Link>
              )}
              <Link href="/profile" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted font-medium">
                Profile
              </Link>
              <Link href="/api/auth/signout" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted">
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted">
                Sign in
              </Link>
              <Link href="/signup" onClick={close} className="px-4 py-2 text-secondary hover:text-primary hover:bg-muted">
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
