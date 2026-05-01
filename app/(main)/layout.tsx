import { SessionProvider } from '@/components/SessionProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { getCurrentUser } from '@/lib/session'
import Link from 'next/link'

async function Nav() {
  const user = await getCurrentUser()

  return (
    <nav className="border-b bg-surface">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-accent text-lg">
          MundoJam
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-secondary hover:text-primary">
            Discover
          </Link>

          {user ? (
            <>
              <Link href="/following" className="text-secondary hover:text-primary">
                Following
              </Link>
              <Link href="/musicians" className="text-secondary hover:text-primary">
                Musicians
              </Link>
              <Link href="/jams/new" className="text-secondary hover:text-primary">
                Host a Jam
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="text-secondary hover:text-primary">
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="text-secondary hover:text-primary font-medium"
              >
                Profile
              </Link>
              <Link
                href="/api/auth/signout"
                className="text-secondary hover:text-primary"
              >
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-secondary hover:text-primary">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-accent hover:bg-accent/90 text-white px-3 py-1.5 rounded-md"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Nav />
      <main className="flex-1">{children}</main>
    </SessionProvider>
  )
}
