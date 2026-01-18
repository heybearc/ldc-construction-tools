'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface CrewMember {
  id: number
  full_name: string
  role: string
  phone?: string
  email?: string
  is_active: boolean
  trade_crew_id: number
  trade_team_id: number
}

interface TradeCrew {
  id: number
  name: string
  specialization: string | undefined
  capacity: number | null
  member_count: number
  overseer_name: string | null
  is_active: boolean
  trade_team_id: number
}

interface TradeCrewDetailsProps {
  crewId: number
  teamName: string
  onBack: () => void
}

const roleIcons: Record<string, string> = {
  'Trade Team Overseer': '👑',
  'Trade Team Overseer Assistant': '🎖️',
  'Trade Team Support': '📋',
  'Crew Overseer': '⭐',
  'Crew Assistant': '🔧',
  'Volunteer': '👷',
  'default': '👤'
}

const roleColors: Record<string, string> = {
  'Trade Team Overseer': 'bg-purple-100 text-purple-800 border-purple-200',
  'Trade Team Overseer Assistant': 'bg-blue-100 text-blue-800 border-blue-200',
  'Trade Team Support': 'bg-green-100 text-green-800 border-green-200',
  'Crew Overseer': 'bg-orange-100 text-orange-800 border-orange-200',
  'Crew Assistant': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Volunteer': 'bg-gray-100 text-gray-800 border-gray-200',
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function TradeCrewDetails({ crewId, teamName, onBack }: TradeCrewDetailsProps) {
  const [crew, setCrew] = useState<TradeCrew | null>(null)
  const [members, setMembers] = useState<CrewMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCrewDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch crew details
        const crewsData = await apiClient.getTradeCrews(crew?.trade_team_id || 0)
        const crewData = crewsData.find(c => c.id === crewId)
        if (!crewData) {
          throw new Error('Crew not found')
        }
        setCrew(crewData as TradeCrew)
        
        // Fetch crew members
        try {
          const membersData = await fetch(`/api/v1/trade-teams/crews/${crewId}/members`)
          if (membersData.ok) {
            const membersJson = await membersData.json()
            setMembers(membersJson)
          } else {
            // If no members endpoint, set empty array
            setMembers([])
          }
        } catch (memberError) {
          console.log('No members found for crew:', crewId)
          setMembers([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load crew details')
        console.error('Error fetching crew details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCrewDetails()
  }, [crewId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !crew) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Crew Details</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="btn-primary"
        >
          Back to Team Details
        </button>
      </div>
    )
  }

  // Separate oversight and volunteer members
  const oversightMembers = members.filter(member => 
    member.role.includes('Overseer') || 
    member.role.includes('Assistant') || 
    member.role.includes('Support')
  )
  
  const volunteerMembers = members.filter(member => 
    member.role === 'Volunteer' || 
    (!member.role.includes('Overseer') && !member.role.includes('Assistant') && !member.role.includes('Support'))
  )

  const getRoleIcon = (role: string) => roleIcons[role] || roleIcons.default
  const getRoleColor = (role: string) => roleColors[role] || roleColors.default

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
          Back to {teamName}
        </button>
      </div>

      {/* Crew Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8">
        <div className="flex items-center mb-6">
          <div className="text-6xl mr-4">🔧</div>
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{crew.name}</h1>
            <p className="text-lg text-blue-700 opacity-75">
              {teamName} • {crew.specialization ? crew.specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General'}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              crew.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {crew.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{members.length}</div>
            <div className="text-sm text-blue-700 opacity-75">Total Members</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{oversightMembers.length}</div>
            <div className="text-sm text-blue-700 opacity-75">Oversight Roles</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{volunteerMembers.length}</div>
            <div className="text-sm text-blue-700 opacity-75">Volunteers</div>
          </div>
        </div>

        {crew.capacity && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-700">Capacity Utilization</span>
              <span className="text-blue-700">
                {Math.round((members.length / crew.capacity) * 100)}% ({members.length}/{crew.capacity})
              </span>
            </div>
            <div className="w-full bg-white bg-opacity-50 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((members.length / crew.capacity) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Oversight Members Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="text-2xl mr-2">👑</span>
            Oversight & Leadership
          </h2>
          <p className="text-gray-600">Trade crew overseers, assistants, and support staff</p>
        </div>
        
        <div className="p-6">
          {oversightMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Oversight Members</h3>
              <p className="text-gray-600">This crew doesn't have any oversight roles assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {oversightMembers.map((member) => (
                <div
                  key={member.id}
                  className={`border-2 rounded-lg p-4 ${getRoleColor(member.role)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getRoleIcon(member.role)}</span>
                      <div>
                        <h3 className="font-semibold">{member.full_name}</h3>
                        <p className="text-sm opacity-75">{member.role}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {(member.phone || member.email) && (
                    <div className="space-y-1 text-sm">
                      {member.phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {member.phone}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {member.email}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Members Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="text-2xl mr-2">👷</span>
            Volunteers
          </h2>
          <p className="text-gray-600">Volunteer workers and crew members</p>
        </div>
        
        <div className="p-6">
          {volunteerMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Volunteers</h3>
              <p className="text-gray-600">This crew doesn't have any volunteers assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteerMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">👤</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {(member.phone || member.email) && (
                    <div className="space-y-1 text-sm text-gray-600">
                      {member.phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {member.phone}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {member.email}
                        </div>
                      )}
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
