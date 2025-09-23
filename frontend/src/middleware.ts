import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    console.log('NextAuth Middleware: User authenticated, allowing access');
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('NextAuth Middleware: Checking authorization, token exists:', !!token);
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

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
