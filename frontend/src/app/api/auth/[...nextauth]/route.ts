// Temporary bypass for NextAuth v5 beta compatibility issues
// This creates a minimal auth API that works without the problematic NextAuth library

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Handle session endpoint
  if (pathname.includes('/session')) {
    // Check for authentication cookie
    const cookieHeader = request.headers.get('cookie');
    const isAuthenticated = cookieHeader?.includes('isAuthenticated=true');
    
    console.log('Session check:', { cookieHeader, isAuthenticated });
    
    if (isAuthenticated) {
      return new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Handle other auth endpoints
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Handle signin endpoint
  if (pathname.includes('/signin') || pathname.includes('/callback/credentials')) {
    try {
      const body = await request.formData();
      const email = body.get('email') as string;
      const password = body.get('password') as string;
      
      console.log('Auth attempt for:', email);
      
      if (email === 'admin@ldc-construction.local' && password === 'AdminPass123!') {
        console.log('User found: YES');
        console.log('Password match: true');
        
        // Return success response with HTTP cookies
        const response = new Response(JSON.stringify({ 
          url: '/',
          ok: true
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        // Set cookies properly using Headers
        response.headers.set('Set-Cookie', `isAuthenticated=true; Path=/; Max-Age=86400; SameSite=Lax`);
        
        return response;
      }
      
      console.log('Authentication failed');
      return new Response(JSON.stringify({ 
        error: 'Invalid credentials',
        ok: false
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Auth error:', error);
      return new Response(JSON.stringify({ 
        error: 'Authentication error',
        ok: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
