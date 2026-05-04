import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

const nextAuthHandler = NextAuth(authOptions)

function handler(req: Request, ctx: unknown) {
  if (req.method === 'POST') {
    const limited = rateLimit(req, 10)
    if (limited) return limited
  }
  return nextAuthHandler(req, ctx)
}

export { handler as GET, handler as POST }
