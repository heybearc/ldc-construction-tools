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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name || 'User'}
              </span>
              <button
                onClick={() => {
                  document.cookie = 'ldc-auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  window.location.href = '/auth/signin';
                }}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <button
              onClick={() => setViewMode('organizational')}
              className={`px-3 py-2 rounded text-sm font-medium ${
                viewMode === 'organizational'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Organizational Dashboard
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-2 rounded text-sm font-medium ${
                viewMode === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trade Teams Dashboard
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 rounded text-sm font-medium ${
                viewMode === 'detailed'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trade Teams Overview
            </button>
            <button
              onClick={() => setViewMode('roles')}
              className={`px-3 py-2 rounded text-sm font-medium ${
                viewMode === 'roles'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Role Management
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'organizational' && <OrganizationalDashboard />}
        {viewMode === 'dashboard' && <TradeTeamsDashboard />}
        {viewMode === 'detailed' && <TradeTeamsOverview />}
        {viewMode === 'roles' && <RoleManagement />}
      </div>
    </div>
  )
}
