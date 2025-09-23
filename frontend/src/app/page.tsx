'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import OrganizationalDashboard from '@/components/OrganizationalDashboard'
import TradeTeamsDashboard from '@/components/TradeTeamsDashboard'
import TradeTeamsOverview from '@/components/TradeTeamsOverview'
import RoleManagement from '@/components/RoleManagement'
import { Loader2 } from 'lucide-react'

type ViewMode = 'organizational' | 'dashboard' | 'detailed' | 'roles'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('organizational')

  console.log('NextAuth Homepage: Session status:', status, 'Session data:', session)

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, middleware will redirect
  if (status === 'unauthenticated') {
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
            🎉 NextAuth Login Successful!
          </h1>
          <div className="space-y-4">
            <p className="text-lg text-green-600">
              Welcome to LDC Construction Tools
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Authentication Status:</h3>
              <p><strong>Authenticated:</strong> ✅ Yes (NextAuth)</p>
              <p><strong>User:</strong> {session?.user?.name || 'Unknown'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'Not set'}</p>
              <p><strong>Role:</strong> {session?.user?.role || 'Not set'}</p>
              <p><strong>Region:</strong> {session?.user?.regionId || 'Not set'}</p>
              <p><strong>Zone:</strong> {session?.user?.zoneId || 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  window.location.href = '/api/auth/signout';
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout (NextAuth)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
