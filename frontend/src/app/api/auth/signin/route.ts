import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('Simple Auth API: POST /api/auth/signin')
  
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('Simple Auth API: Login attempt for:', email)

    // Battle-tested user validation
    const validUsers = [
      {
        id: "1",
        email: "admin@ldc-construction.local",
        password: "AdminPass123!",
        name: "LDC Admin",
        role: "SUPER_ADMIN",
        regionId: "01",
        zoneId: "12"
      },
      {
        id: "2", 
        email: "admin",
        password: "admin",
        name: "Test Admin",
        role: "ADMIN",
        regionId: "01",
        zoneId: "12"
      }
    ]

    const user = validUsers.find(u => u.email === email)
    
    if (!user || user.password !== password) {
      console.log('Simple Auth API: Invalid credentials for:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('Simple Auth API: Authentication successful for:', email)
    
    // Create simple session
    const session = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        regionId: user.regionId,
        zoneId: user.zoneId
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    // Set simple session cookie
    const response = NextResponse.json({ success: true, session })
    response.cookies.set('ldc-auth-session', JSON.stringify(session), {
      path: '/',
      maxAge: 86400, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    })

    return response
  } catch (error) {
    console.error('Simple Auth API: Error:', error)
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Simple auth signin endpoint' })
}
