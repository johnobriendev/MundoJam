import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">MundoJam</h1>
        <p className="text-gray-600">Discover and host jam sessions worldwide</p>

        {user ? (
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
        ) : (
          <div className="flex gap-3 justify-center mt-4">
            <Link
              href="/login"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm text-white hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
