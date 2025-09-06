'use client'

import React, { useState } from 'react'
import OrganizationalDashboard from '@/components/OrganizationalDashboard'
import TradeTeamsDashboard from '@/components/TradeTeamsDashboard'
import TradeTeamsOverview from '@/components/TradeTeamsOverview'
import RoleManagement from '@/components/RoleManagement'

type ViewMode = 'organizational' | 'dashboard' | 'detailed' | 'roles'

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('organizational')

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getTitle()}
          </h1>
          <p className="mt-2 text-gray-600">
            Construction Group 01.12 organizational structure and crew management
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('organizational')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'organizational'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏢 Org Chart
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'dashboard'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'detailed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Detailed
          </button>
          <button
            onClick={() => setViewMode('roles')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'roles'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Roles
          </button>
        </div>
      </div>
      
      {viewMode === 'organizational' && <OrganizationalDashboard />}
      {viewMode === 'dashboard' && <TradeTeamsDashboard />}
      {viewMode === 'detailed' && <TradeTeamsOverview />}
      {viewMode === 'roles' && <RoleManagement />}
    </div>
  )
}
