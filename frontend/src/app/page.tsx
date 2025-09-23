'use client'

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // TEMPORARILY DISABLE AUTH CHECK FOR TESTING
  useEffect(() => {
    console.log('Homepage: Auth check DISABLED for testing - showing success page');
    setIsAuthenticated(true);
    setUserEmail('test@example.com');
    setAuthChecked(true);
  }, [])

  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render content (will redirect)
  if (!isAuthenticated) {
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
            🎉 Login Successful!
          </h1>
          <div className="space-y-4">
            <p className="text-lg text-green-600">
              Welcome to LDC Construction Tools
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Authentication Status:</h3>
              <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User Email:</strong> {userEmail || 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  document.cookie = 'isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  window.location.href = '/auth/signin';
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
