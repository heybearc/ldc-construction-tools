import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'

export default auth((req: any) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  console.log('NextAuth v5 Middleware: Path:', nextUrl.pathname, 'Authenticated:', isLoggedIn)

  // Allow access to auth pages and API routes
  if (
    nextUrl.pathname.startsWith('/auth/') ||
    nextUrl.pathname.startsWith('/api/') ||
    nextUrl.pathname.startsWith('/_next/') ||
    nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Redirect to signin if not authenticated
  if (!isLoggedIn) {
    console.log('NextAuth v5 Middleware: Redirecting to signin')
    const signinUrl = new URL('/auth/signin', nextUrl.origin)
    signinUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(signinUrl)
  }

  console.log('NextAuth v5 Middleware: User authenticated, allowing access')
  return NextResponse.next()
})

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
