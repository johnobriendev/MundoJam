import { LRUCache } from 'lru-cache'
import { NextResponse } from 'next/server'

type Entry = { count: number; resetAt: number }

const cache = new LRUCache<string, Entry>({ max: 10_000 })

export function rateLimit(req: Request, limit: number, windowMs = 60_000): NextResponse | null {
  const ip =
    (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  const key = `${ip}:${req.url}`
  const now = Date.now()

  const entry = cache.get(key)

  if (!entry || now > entry.resetAt) {
    cache.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  entry.count++
  return null
}
