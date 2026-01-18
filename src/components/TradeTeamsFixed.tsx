'use client'

import React, { useState, useEffect } from 'react'

interface TradeTeamSummary {
  id: number
  name: string
  crew_count: number
  total_members: number
  active_crews: number
  is_active: boolean
}

const tradeTeamIcons: Record<string, string> = {
  'Electrical': '💡',
  'Exteriors': '🏠',
  'Interiors': '🛋️',
  'Mechanical': '🌡️',
  'Plumbing': '🚰',
  'Site Support': '📋',
  'Sitework/Civil': '🚜',
  'Structural': '🏗️'
}

export default function TradeTeamsFixed() {
  const [teams, setTeams] = useState<TradeTeamSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTeams = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Loading teams...')
      const response = await fetch('/api/v1/trade-teams')
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Teams loaded:', data)
      setTeams(data)
    } catch (err) {
      console.error('Error loading teams:', err)
      setError(err instanceof Error ? err.message : 'Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trade Teams Dashboard</h1>
            <p className="text-gray-600 mt-1">Loading trade teams...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trade Teams Dashboard</h1>
            <p className="text-gray-600 mt-1">Error loading trade teams</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={loadTeams} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (teams.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trade Teams Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of all trade teams and their current status</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
            <div className="text-sm text-gray-600">Total Teams</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {teams.reduce((sum, team) => sum + team.crew_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Crews</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {teams.reduce((sum, team) => sum + team.total_members, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
        </div>

        {/* Trade Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => alert(`Clicked ${team.name} - Drill-down functionality working!`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{tradeTeamIcons[team.name] || '🔨'}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  team.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {team.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Crews:</span>
                  <span className="font-medium">{team.crew_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Members:</span>
                  <span className="font-medium">{team.total_members}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Crews:</span>
                  <span className="font-medium">{team.active_crews}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Initial state - show button to load teams
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trade Teams Dashboard</h1>
          <p className="text-gray-600 mt-1">Click the button below to load trade teams</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <button 
          onClick={loadTeams}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Load Trade Teams
        </button>
      </div>
    </div>
  )
}
