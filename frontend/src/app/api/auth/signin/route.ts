// WMACS GUARDIAN: Clean Authentication API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { authenticate, createSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  console.log('WMACS Auth API: POST /api/auth/signin')
  
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const authResult = await authenticate(email, password)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Create session cookie
    const sessionData = createSessionCookie(authResult.user)
    
    const response = NextResponse.json({ 
      success: true, 
      user: authResult.user 
    })
    
    response.cookies.set('ldc-auth-session', sessionData, {
      path: '/',
      maxAge: 86400, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    return response
  } catch (error) {
    console.error('WMACS Auth API: Error:', error)
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'WMACS Authentication Endpoint' })
}
