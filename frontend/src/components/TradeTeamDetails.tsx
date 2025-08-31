'use client'

import React, { useState, useEffect } from 'react'
import { apiClient, TradeTeamSummary } from '@/lib/api'
import TradeCrewDetails from './TradeCrewDetails'

interface TradeCrew {
  id: number
  name: string
  specialization: string | undefined
  capacity: number | null
  member_count: number
  overseer_name: string | null
  is_active: boolean
}

interface TradeTeamDetailsProps {
  teamId: number
  onBack: () => void
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

export default function TradeTeamDetails({ teamId, onBack }: TradeTeamDetailsProps) {
  const [team, setTeam] = useState<TradeTeamSummary | null>(null)
  const [crews, setCrews] = useState<TradeCrew[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCrew, setSelectedCrew] = useState<number | null>(null)

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch team info
        const teams = await apiClient.getTradeTeams()
        const teamData = teams.find(t => t.id === teamId)
        if (!teamData) {
          throw new Error('Team not found')
        }
        setTeam(teamData)
        
        // Fetch crews for this team
        const crewsData = await apiClient.getTradeCrews(teamId)
        setCrews(crewsData as TradeCrew[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team details')
        console.error('Error fetching team details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamDetails()
  }, [teamId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Team Details</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const colors = tradeTeamColors[team.name] || tradeTeamColors['Structural']
  const icon = tradeTeamIcons[team.name] || '🔨'

  // Show crew details view if requested
  if (selectedCrew !== null) {
    return (
      <TradeCrewDetails 
        crewId={selectedCrew} 
        teamName={team.name}
        onBack={() => setSelectedCrew(null)} 
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Team Overview */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-8`}>
        <div className="flex items-center mb-6">
          <div className="text-6xl mr-4">{icon}</div>
          <div>
            <h1 className={`text-3xl font-bold ${colors.text}`}>{team.name}</h1>
            <p className={`text-lg ${colors.text} opacity-75`}>Trade Team Details</p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              team.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {team.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <div className={`text-2xl font-bold ${colors.text}`}>{team.active_crews}</div>
            <div className={`text-sm ${colors.text} opacity-75`}>Active Crews</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <div className={`text-2xl font-bold ${colors.text}`}>{team.crew_count}</div>
            <div className={`text-sm ${colors.text} opacity-75`}>Total Crews</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <div className={`text-2xl font-bold ${colors.text}`}>{team.total_members}</div>
            <div className={`text-sm ${colors.text} opacity-75`}>Total Members</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <div className={`text-2xl font-bold ${colors.text}`}>
              {team.crew_count > 0 ? Math.round((team.active_crews / team.crew_count) * 100) : 0}%
            </div>
            <div className={`text-sm ${colors.text} opacity-75`}>Utilization</div>
          </div>
        </div>
      </div>

      {/* Crews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Trade Crews</h2>
          <p className="text-gray-600">Manage crews within this trade team</p>
        </div>
        
        <div className="p-6">
          {crews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Crews Found</h3>
              <p className="text-gray-600">This trade team doesn't have any crews yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crews.map((crew) => (
                <div
                  key={crew.id}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCrew(crew.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{crew.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      crew.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {crew.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-medium text-gray-900">
                        {crew.member_count}{crew.capacity ? ` / ${crew.capacity}` : ''}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Specialization:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {crew.specialization ? crew.specialization.replace(/_/g, ' ') : 'General'}
                      </span>
                    </div>
                    
                    {crew.overseer_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overseer:</span>
                        <span className="font-medium text-gray-900">{crew.overseer_name}</span>
                      </div>
                    )}
                  </div>
                  
                  {crew.capacity && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Capacity</span>
                        <span className="text-gray-600">
                          {Math.round((crew.member_count / crew.capacity) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${colors.accent} h-2 rounded-full transition-all duration-300`}
                          style={{
                            width: `${Math.min((crew.member_count / crew.capacity) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
