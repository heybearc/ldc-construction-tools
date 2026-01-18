'use client'

import React, { useState, useEffect } from 'react'
import { apiClient, TradeTeamSummary, TradeCrewSummary, CrewMemberSummary } from '@/lib/api'

export default function TradeTeamsOverview() {
  const [teams, setTeams] = useState<TradeTeamSummary[]>([])
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [crews, setCrews] = useState<TradeCrewSummary[]>([])
  const [selectedCrew, setSelectedCrew] = useState<number | null>(null)
  const [members, setMembers] = useState<CrewMemberSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const loadTradeCrews = async (teamId: number) => {
    try {
      const data = await apiClient.getTradeCrews(teamId)
      setCrews(data)
      setSelectedTeam(teamId)
      setSelectedCrew(null)
      setMembers([])
    } catch (err) {
      setError('Failed to load trade crews')
      console.error(err)
    }
  }

  const loadCrewMembers = async (crewId: number) => {
    try {
      const data = await apiClient.getCrewMembers(crewId)
      setMembers(data)
      setSelectedCrew(crewId)
    } catch (err) {
      setError('Failed to load crew members')
      console.error(err)
    }
  }

  const handleExportTradeTeams = async () => {
    try {
      const blob = await apiClient.exportTradeTeams()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LDC_Trade_Teams_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to export trade teams')
      console.error(err)
    }
  }

  const handleExportContacts = async () => {
    try {
      const blob = await apiClient.exportContacts()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LDC_Contact_List_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to export contacts')
      console.error(err)
    }
  }

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
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleExportContacts}
          className="btn-secondary"
        >
          Export Contact List
        </button>
        <button
          onClick={handleExportTradeTeams}
          className="btn-primary"
        >
          Export Trade Teams
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Teams */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trade Teams</h2>
          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedTeam === team.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => loadTradeCrews(team.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">
                      {team.active_crews} crews • {team.total_members} members
                    </p>
                  </div>
                  <span className={`badge ${team.is_active ? 'badge-green' : 'badge-red'}`}>
                    {team.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Crews */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Trade Crews
            {selectedTeam && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({teams.find(t => t.id === selectedTeam)?.name})
              </span>
            )}
          </h2>
          {selectedTeam ? (
            <div className="space-y-2">
              {crews.map((crew) => (
                <div
                  key={crew.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedCrew === crew.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => loadCrewMembers(crew.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{crew.name}</h3>
                      {crew.specialization && (
                        <p className="text-sm text-gray-600">{crew.specialization}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {crew.member_count} members
                        {crew.capacity && ` / ${crew.capacity} capacity`}
                      </p>
                      {crew.overseer_name && (
                        <p className="text-sm text-primary-600 font-medium">
                          TCO: {crew.overseer_name}
                        </p>
                      )}
                    </div>
                    <span className={`badge ${crew.is_active ? 'badge-green' : 'badge-red'}`}>
                      {crew.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select a trade team to view crews
            </p>
          )}
        </div>

        {/* Crew Members */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Crew Members
            {selectedCrew && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({crews.find(c => c.id === selectedCrew)?.name})
              </span>
            )}
          </h2>
          {selectedCrew ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{member.full_name}</h3>
                    <div className="flex space-x-1">
                      {member.is_overseer && (
                        <span className="badge badge-blue">TCO</span>
                      )}
                      {member.is_assistant && (
                        <span className="badge badge-yellow">Assistant</span>
                      )}
                      <span className={`badge ${member.is_active ? 'badge-green' : 'badge-red'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{member.role}</p>
                  {member.phone && (
                    <p className="text-sm text-gray-600">📞 {member.phone}</p>
                  )}
                  {member.email_jw && (
                    <p className="text-sm text-gray-600">✉️ {member.email_jw}</p>
                  )}
                  {member.congregation && (
                    <p className="text-sm text-gray-600">🏛️ {member.congregation}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select a trade crew to view members
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
