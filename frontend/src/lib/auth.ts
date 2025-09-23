// WMACS GUARDIAN: Clean, Simple Authentication System
// Following WMACS principles: Simplicity over complexity, Stability over chaos

import { cookies } from 'next/headers'

export interface User {
  id: string
  email: string
  name: string
  role: string
  regionId: string
  zoneId: string
}

export interface AuthSession {
  user: User
  expires: string
}

// Battle-tested user credentials
const VALID_USERS = [
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

// Simple session management
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('ldc-auth-session')
    
    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      return null
    }

    return session
  } catch {
    return null
  }
}

// Authenticate user credentials
export async function authenticate(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  console.log('WMACS Auth: Login attempt for:', email)

  const user = VALID_USERS.find(u => u.email === email)
  
  if (!user || user.password !== password) {
    console.log('WMACS Auth: Invalid credentials')
    return { success: false, error: 'Invalid credentials' }
  }

  console.log('WMACS Auth: Authentication successful')
  
  // Remove password from returned user
  const { password: _, ...userWithoutPassword } = user
  return { success: true, user: userWithoutPassword }
}

// Create session cookie
export function createSessionCookie(user: User): string {
  const session: AuthSession = {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  }

  return JSON.stringify(session)
}
