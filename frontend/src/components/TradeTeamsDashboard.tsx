'use client'

import React, { useState, useEffect } from 'react'
import { apiClient, TradeTeamSummary } from '@/lib/api'

// Trade team icons mapping
const tradeTeamIcons: Record<string, string> = {
  'Electrical': '⚡',
  'Exteriors': '🏢',
  'Interiors': '🏠',
  'Mechanical': '⚙️',
  'Plumbing': '🔧',
  'Site Support': '🚧',
  'Sitework/Civil': '🚜',
  'Structural': '🏗️'
}

// Trade team color schemes
const tradeTeamColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  'Electrical': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', accent: 'bg-yellow-500' },
  'Exteriors': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', accent: 'bg-blue-500' },
  'Interiors': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', accent: 'bg-green-500' },
  'Mechanical': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', accent: 'bg-red-500' },
  'Plumbing': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', accent: 'bg-cyan-500' },
  'Site Support': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', accent: 'bg-orange-500' },
  'Sitework/Civil': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', accent: 'bg-amber-500' },
  'Structural': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', accent: 'bg-gray-500' }
}

interface TradeTeamCardProps {
  team: TradeTeamSummary
  onClick: () => void
}

function TradeTeamCard({ team, onClick }: TradeTeamCardProps) {
  const colors = tradeTeamColors[team.name] || tradeTeamColors['Structural']
  const icon = tradeTeamIcons[team.name] || '🔨'

  return (
    <div
      className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 transform`}
      onClick={onClick}
    >
      {/* Header with icon and status */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl">{icon}</div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          team.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {team.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Team name */}
      <h3 className={`text-xl font-bold ${colors.text} mb-2`}>
        {team.name}
      </h3>

      {/* Statistics */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${colors.text} opacity-75`}>Active Crews</span>
          <span className={`text-lg font-semibold ${colors.text}`}>{team.active_crews}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${colors.text} opacity-75`}>Total Members</span>
          <span className={`text-lg font-semibold ${colors.text}`}>{team.total_members}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${colors.text} opacity-75`}>Total Crews</span>
          <span className={`text-lg font-semibold ${colors.text}`}>{team.crew_count}</span>
        </div>
      </div>

      {/* Progress bar for crew utilization */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className={`${colors.text} opacity-75`}>Crew Utilization</span>
          <span className={`${colors.text} opacity-75`}>
            {team.crew_count > 0 ? Math.round((team.active_crews / team.crew_count) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
          <div
            className={`${colors.accent} h-2 rounded-full transition-all duration-300`}
            style={{
              width: team.crew_count > 0 ? `${(team.active_crews / team.crew_count) * 100}%` : '0%'
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default function TradeTeamsDashboard() {
  const [teams, setTeams] = useState<TradeTeamSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<TradeTeamSummary | null>(null)

  useEffect(() => {
    loadTradeTeams()
  }, [])

  const loadTradeTeams = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getTradeTeams()
      setTeams(data)
    } catch (err) {
      setError('Failed to load trade teams')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamClick = (team: TradeTeamSummary) => {
    setSelectedTeam(team)
  }

  const totalMembers = teams.reduce((sum, team) => sum + team.total_members, 0)
  const totalCrews = teams.reduce((sum, team) => sum + team.crew_count, 0)
  const activeTeams = teams.filter(team => team.is_active).length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadTradeTeams}
                className="btn-primary text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header with Summary Stats */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-6">LDC Construction Group 01.12</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{activeTeams}</div>
            <div className="text-primary-100">Active Trade Teams</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{totalCrews}</div>
            <div className="text-primary-100">Total Crews</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{totalMembers}</div>
            <div className="text-primary-100">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{teams.length}</div>
            <div className="text-primary-100">Trade Specialties</div>
          </div>
        </div>
      </div>

      {/* Trade Teams Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Trade Teams Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teams.map((team) => (
            <TradeTeamCard
              key={team.id}
              team={team}
              onClick={() => handleTeamClick(team)}
            />
          ))}
        </div>
      </div>

      {/* Selected Team Details Modal/Panel */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-5xl">{tradeTeamIcons[selectedTeam.name] || '🔨'}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h3>
                  <p className="text-gray-600">Trade Team Details</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{selectedTeam.active_crews}</div>
                <div className="text-gray-600">Active Crews</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{selectedTeam.total_members}</div>
                <div className="text-gray-600">Total Members</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{selectedTeam.crew_count}</div>
                <div className="text-gray-600">Total Crews</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className={`text-2xl font-bold ${selectedTeam.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedTeam.is_active ? 'Active' : 'Inactive'}
                </div>
                <div className="text-gray-600">Status</div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedTeam(null)}
                className="btn-secondary flex-1"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Navigate to detailed view - this would be implemented with routing
                  console.log('Navigate to detailed view for team:', selectedTeam.id)
                  setSelectedTeam(null)
                }}
                className="btn-primary flex-1"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
