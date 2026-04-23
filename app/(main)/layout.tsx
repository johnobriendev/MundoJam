import { SessionProvider } from '@/components/SessionProvider'
import { getCurrentUser } from '@/lib/session'
import Link from 'next/link'

async function Nav() {
  const user = await getCurrentUser()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-indigo-600 text-lg">
          MundoJam
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Discover
          </Link>

          {user ? (
            <>
              <Link href="/following" className="text-gray-600 hover:text-gray-900">
                Following
              </Link>
              <Link href="/musicians" className="text-gray-600 hover:text-gray-900">
                Musicians
              </Link>
              <Link href="/jams/new" className="text-gray-600 hover:text-gray-900">
                Host a Jam
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                {user.name}
              </Link>
              <Link
                href="/api/auth/signout"
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md"
              >
                Sign up
              </Link>
            </>
          )}
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
