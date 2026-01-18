'use client'

import React, { useState, useEffect } from 'react'
import { apiClient, TradeTeamSummary, TradeCrewSummary, CrewMemberSummary } from '@/lib/api'

export default function ContactsOverview() {
  const [teams, setTeams] = useState<TradeTeamSummary[]>([])
  const [allMembers, setAllMembers] = useState<CrewMemberSummary[]>([])
  const [filteredMembers, setFilteredMembers] = useState<CrewMemberSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContactData()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [searchTerm, filterRole, filterTeam, allMembers])

  const loadContactData = async () => {
    try {
      setLoading(true)
      
      // Load all teams
      const teamsData = await apiClient.getTradeTeams()
      setTeams(teamsData)
      
      // Load all members from all crews
      const allMembersData: CrewMemberSummary[] = []
      
      for (const team of teamsData) {
        const crews = await apiClient.getTradeCrews(team.id)
        for (const crew of crews) {
          const members = await apiClient.getCrewMembers(crew.id)
          // Add team and crew info to each member
          const membersWithTeamInfo = members.map(member => ({
            ...member,
            team_name: team.name,
            crew_name: crew.name
          }))
          allMembersData.push(...membersWithTeamInfo)
        }
      }
      
      setAllMembers(allMembersData)
    } catch (err) {
      setError('Failed to load contact data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterContacts = () => {
    let filtered = allMembers.filter(member => member.is_active)

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(term) ||
        member.role.toLowerCase().includes(term) ||
        member.congregation?.toLowerCase().includes(term) ||
        (member as any).team_name?.toLowerCase().includes(term) ||
        (member as any).crew_name?.toLowerCase().includes(term)
      )
    }

    if (filterRole) {
      if (filterRole === 'overseer') {
        filtered = filtered.filter(member => member.is_overseer)
      } else if (filterRole === 'assistant') {
        filtered = filtered.filter(member => member.is_assistant)
      }
    }

    if (filterTeam) {
      filtered = filtered.filter(member => (member as any).team_name === filterTeam)
    }

    // Sort by role (overseers first), then by name
    filtered.sort((a, b) => {
      if (a.is_overseer && !b.is_overseer) return -1
      if (!a.is_overseer && b.is_overseer) return 1
      if (a.is_assistant && !b.is_assistant) return -1
      if (!a.is_assistant && b.is_assistant) return 1
      return a.full_name.localeCompare(b.full_name)
    })

    setFilteredMembers(filtered)
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

  const uniqueRoles = Array.from(new Set(allMembers.map(m => m.role))).sort()

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
                onClick={loadContactData}
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
      {/* Filters and Export */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full sm:w-64"
              />
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="form-input w-full sm:w-48"
              >
                <option value="">All Roles</option>
                <option value="overseer">Trade Crew Overseers</option>
                <option value="assistant">Assistants</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="form-input w-full sm:w-48"
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleExportContacts}
            className="btn-primary"
          >
            Export Contact List
          </button>
        </div>
      </div>

      {/* Contact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{allMembers.filter(m => m.is_active).length}</div>
          <div className="text-sm text-gray-600">Total Active Members</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{allMembers.filter(m => m.is_overseer && m.is_active).length}</div>
          <div className="text-sm text-gray-600">Trade Crew Overseers</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{allMembers.filter(m => m.is_assistant && m.is_active).length}</div>
          <div className="text-sm text-gray-600">Assistants</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{filteredMembers.length}</div>
          <div className="text-sm text-gray-600">Filtered Results</div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div key={member.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
              <div className="flex flex-wrap gap-1">
                {member.is_overseer && (
                  <span className="badge badge-blue">TCO</span>
                )}
                {member.is_assistant && (
                  <span className="badge badge-yellow">Assistant</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 font-medium">{member.role}</p>
              
              <div className="text-gray-600">
                <p><strong>Team:</strong> {(member as any).team_name}</p>
                <p><strong>Crew:</strong> {(member as any).crew_name}</p>
              </div>
              
              {member.phone && (
                <p className="text-gray-600">
                  <strong>📞 Phone:</strong> 
                  <a href={`tel:${member.phone}`} className="text-primary-600 hover:text-primary-800 ml-1">
                    {member.phone}
                  </a>
                </p>
              )}
              
              {member.email_jw && (
                <p className="text-gray-600">
                  <strong>✉️ Email:</strong> 
                  <a href={`mailto:${member.email_jw}`} className="text-primary-600 hover:text-primary-800 ml-1">
                    {member.email_jw}
                  </a>
                </p>
              )}
              
              {member.congregation && (
                <p className="text-gray-600">
                  <strong>🏛️ Congregation:</strong> {member.congregation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No contacts found matching your criteria</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterRole('')
              setFilterTeam('')
            }}
            className="btn-secondary mt-4"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
