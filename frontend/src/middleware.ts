import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // TEMPORARILY DISABLE MIDDLEWARE FOR TESTING
  console.log('Middleware: DISABLED - allowing all access for testing');
  return NextResponse.next();
  
  /* ORIGINAL MIDDLEWARE - DISABLED FOR TESTING
  // Allow access to auth pages and API routes
  if (pathname.startsWith('/auth/') || 
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // Check for authentication cookie (our custom auth system)
  const authCookie = request.cookies.get('isAuthenticated');
  
  if (!authCookie || authCookie.value !== 'true') {
    // No auth cookie - redirect to signin
    console.log('Middleware: No auth cookie found, redirecting to signin');
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }
  
  // Auth cookie exists - allow access
  console.log('Middleware: Auth cookie found, allowing access');
  return NextResponse.next();
  */
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
