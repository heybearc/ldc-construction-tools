import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to auth pages and API routes
  if (pathname.startsWith('/auth/') || 
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // Check for session cookie (simple validation - just check if it exists)
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie || !sessionCookie.value) {
    // No session cookie - redirect to signin
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }
  
  // Session cookie exists - allow access
  // (Full validation will happen in API routes if needed)
  return NextResponse.next();
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
