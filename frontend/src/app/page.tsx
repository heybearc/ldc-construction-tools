'use client'

import React, { useState } from 'react'
import TradeTeamsDashboard from '@/components/TradeTeamsDashboard'
import TradeTeamsOverview from '@/components/TradeTeamsOverview'

type ViewMode = 'dashboard' | 'detailed'

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {viewMode === 'dashboard' ? 'Organizational Dashboard' : 'Trade Teams Overview'}
          </h1>
          <p className="mt-2 text-gray-600">
            Construction Group 01.12 organizational structure and crew management
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'dashboard'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'detailed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Detailed View
          </button>
        </div>
      </div>
      
      {viewMode === 'dashboard' ? <TradeTeamsDashboard /> : <TradeTeamsOverview />}
    </div>
  )
}
