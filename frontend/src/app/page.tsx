'use client'

// WMACS GUARDIAN: Clean Homepage
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OrganizationalDashboard from '@/components/OrganizationalDashboard'
import TradeTeamsDashboard from '@/components/TradeTeamsDashboard'
import TradeTeamsOverview from '@/components/TradeTeamsOverview'
import RoleManagement from '@/components/RoleManagement'
import { Loader2 } from 'lucide-react'

type ViewMode = 'organizational' | 'dashboard' | 'detailed' | 'roles'

export default function HomePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('organizational')
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check session from cookie
    const checkSession = () => {
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies.find(c => c.trim().startsWith('ldc-auth-session='))
      
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]))
          // Check if session is not expired
          if (new Date(sessionData.expires) > new Date()) {
            setSession(sessionData)
            console.log('WMACS Auth: Valid session found:', sessionData)
          } else {
            console.log('WMACS Auth: Session expired')
            // Clear expired session
            document.cookie = 'ldc-auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          }
        } catch (error) {
          console.error('WMACS Auth: Invalid session cookie')
        }
      }
      setLoading(false)
    }

    checkSession()
  }, [])

  console.log('WMACS Auth Homepage: Session:', session)

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, middleware will redirect (but this is backup)
  if (!session) {
    return null
  }

  const getTitle = () => {
    switch (viewMode) {
      case 'organizational': return 'Organizational Dashboard'
      case 'dashboard': return 'Trade Teams Dashboard'
      case 'detailed': return 'Trade Teams Overview'
      case 'roles': return 'Role Management'
      default: return 'LDC Construction Tools'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🛡️ WMACS Authentication Successful!
          </h1>
          <div className="space-y-4">
            <p className="text-lg text-green-600">
              Welcome to LDC Construction Tools - WMACS Guardian Protected
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Authentication Status:</h3>
              <p><strong>Authenticated:</strong> ✅ Yes (WMACS Guardian)</p>
              <p><strong>User:</strong> {session?.user?.name || 'Unknown'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'Not set'}</p>
              <p><strong>Role:</strong> {session?.user?.role || 'Not set'}</p>
              <p><strong>Region:</strong> {session?.user?.regionId || 'Not set'}</p>
              <p><strong>Zone:</strong> {session?.user?.zoneId || 'Not set'}</p>
              <p><strong>Expires:</strong> {session?.expires ? new Date(session.expires).toLocaleString() : 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  document.cookie = 'ldc-auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  window.location.href = '/auth/signin';
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout (WMACS Auth)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
