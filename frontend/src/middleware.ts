import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log("Middleware: Processing request for", req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages and API routes
        if (req.nextUrl.pathname.startsWith('/auth/') || 
            req.nextUrl.pathname.startsWith('/api/auth/')) {
          return true;
        }
        
        // Require authentication for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Note: We DO want to process /api/auth routes through middleware
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
