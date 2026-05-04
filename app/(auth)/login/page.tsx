'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const data = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: data.get('email'),
      password: data.get('password'),
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setPending(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="bg-surface shadow rounded-lg p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Sign in to MundoJam</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full border rounded-md px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full border rounded-md px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-primary text-center">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-accent hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
