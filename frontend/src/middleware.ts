import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('Simple Auth Middleware: Path:', pathname)

  // Allow access to auth pages and API routes
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Check for simple session cookie
  const sessionCookie = request.cookies.get('ldc-auth-session')
  const isLoggedIn = !!sessionCookie

  console.log('Simple Auth Middleware: Authenticated:', isLoggedIn)

  // Redirect to signin if not authenticated
  if (!isLoggedIn) {
    console.log('Simple Auth Middleware: Redirecting to signin')
    const signinUrl = new URL('/auth/signin', request.url)
    signinUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signinUrl)
  }

  console.log('Simple Auth Middleware: User authenticated, allowing access')
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
