import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  const isAuth = !!token
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedRoute =
    pathname.startsWith('/following') ||
    pathname.startsWith('/jams/new') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/musicians')

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect unauthenticated users from protected routes
  if ((isProtectedRoute || isAdminRoute) && !isAuth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect non-admins from admin routes
  if (isAdminRoute && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
