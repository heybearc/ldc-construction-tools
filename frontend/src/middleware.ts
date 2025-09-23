// WMACS GUARDIAN: Clean Middleware
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('WMACS Auth Middleware: Path:', pathname)

  // Allow access to auth pages and API routes
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('ldc-auth-session')
  let isLoggedIn = false

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value)
      // Check if session is not expired
      isLoggedIn = new Date(session.expires) > new Date()
    } catch {
      // Invalid session cookie
      isLoggedIn = false
    }
  }

  console.log('WMACS Auth Middleware: Authenticated:', isLoggedIn)

  // Redirect to signin if not authenticated
  if (!isLoggedIn) {
    console.log('WMACS Auth Middleware: Redirecting to signin')
    const signinUrl = new URL('/auth/signin', request.url)
    signinUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signinUrl)
  }

  console.log('WMACS Auth Middleware: User authenticated, allowing access')
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
