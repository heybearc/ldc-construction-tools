'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Briefcase, Users, Building2, Wrench, FolderKanban } from 'lucide-react';

interface VolunteerRole {
  id: string;
  roleCategory: string;
  roleName: string;
  roleCode: string;
  entityId?: string | null;
  entityType?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
}

interface RoleDefinition {
  category: string;
  name: string;
  code: string;
}

interface VolunteerRoleAssignmentProps {
  volunteerId: string;
  currentRoles: VolunteerRole[];
  onRolesChange: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  CG_OVERSIGHT: Building2,
  CG_STAFF: Briefcase,
  REGION_SUPPORT_SERVICES: Users,
  TRADE_TEAM: Users,
  TRADE_CREW: Wrench
};

const CATEGORY_LABELS: Record<string, string> = {
  CG_OVERSIGHT: 'CG Oversight',
  CG_STAFF: 'CG Staff',
  REGION_SUPPORT_SERVICES: 'Region Support Services',
  TRADE_TEAM: 'Trade Team',
  TRADE_CREW: 'Trade Crew'
};

const CATEGORY_COLORS: Record<string, string> = {
  CG_OVERSIGHT: 'bg-purple-100 text-purple-800 border-purple-200',
  CG_STAFF: 'bg-blue-100 text-blue-800 border-blue-200',
  REGION_SUPPORT_SERVICES: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  TRADE_TEAM: 'bg-green-100 text-green-800 border-green-200',
  TRADE_CREW: 'bg-amber-100 text-amber-800 border-amber-200'
};

interface TradeTeam {
  id: string;
  name: string;
}

interface Crew {
  id: string;
  name: string;
  tradeTeamId: string;
}

export default function VolunteerRoleAssignment({ 
  volunteerId, 
  currentRoles, 
  onRolesChange 
}: VolunteerRoleAssignmentProps) {
  const [availableRoles, setAvailableRoles] = useState<Record<string, RoleDefinition[]>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [entityId, setEntityId] = useState('');
  const [entityType, setEntityType] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedTradeTeamId, setSelectedTradeTeamId] = useState('');
  const [selectedCrewId, setSelectedCrewId] = useState('');

  useEffect(() => {
    fetchAvailableRoles();
    fetchTradeTeams();
  }, []);

  useEffect(() => {
    if (selectedTradeTeamId) {
      fetchCrews(selectedTradeTeamId);
    } else {
      setCrews([]);
      setSelectedCrewId('');
    }
  }, [selectedTradeTeamId]);

  const fetchAvailableRoles = async () => {
    try {
      const response = await fetch('/api/v1/volunteer-roles');
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data.grouped);
      }
    } catch (error) {
      console.error('Error fetching available roles:', error);
    }
  };

  const fetchTradeTeams = async () => {
    try {
      const response = await fetch('/api/v1/trade-teams');
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in trade_teams
        setTradeTeams(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching trade teams:', error);
    }
  };

  const fetchCrews = async (tradeTeamId: string) => {
    try {
      const response = await fetch(`/api/v1/trade-teams/${tradeTeamId}/crews`);
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in crews
        setCrews(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching crews:', error);
    }
  };

  const handleAddRole = async () => {
    if (!selectedRole) return;

    // Validate Trade Team/Crew selection for those categories
    if (selectedRole.category === 'TRADE_TEAM' && !selectedTradeTeamId) {
      alert('Please select a Trade Team');
      return;
    }
    if (selectedRole.category === 'TRADE_CREW' && !selectedCrewId) {
      alert('Please select a Trade Crew');
      return;
    }

    setLoading(true);
    try {
      // Determine entity type and ID based on role category
      let finalEntityType = entityType || null;
      let finalEntityId = entityId || null;

      if (selectedRole.category === 'TRADE_TEAM') {
        finalEntityType = 'TEAM';
        finalEntityId = selectedTradeTeamId;
      } else if (selectedRole.category === 'TRADE_CREW') {
        finalEntityType = 'CREW';
        finalEntityId = selectedCrewId;
      }

      // If this is being set as primary and volunteer already has roles, unset other primary roles first
      let finalIsPrimary = isPrimary;
      if (isPrimary && currentRoles.length > 0) {
        // Unset primary on all existing roles
        for (const role of currentRoles) {
          if (role.isPrimary) {
            await fetch(`/api/v1/volunteer-roles/${role.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isPrimary: false })
            });
          }
        }
      } else if (currentRoles.length === 0) {
        // First role is always primary
        finalIsPrimary = true;
      }

      const response = await fetch('/api/v1/volunteer-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId,
          roleCategory: selectedRole.category,
          roleName: selectedRole.name,
          roleCode: selectedRole.code,
          entityId: finalEntityId,
          entityType: finalEntityType,
          isPrimary: finalIsPrimary
        })
      });

      if (response.ok) {
        // Update volunteer's trade team/crew assignment
        if (selectedRole.category === 'TRADE_TEAM' || selectedRole.category === 'TRADE_CREW') {
          await updateVolunteerTeamAssignment();
        }

        setShowAddModal(false);
        setSelectedCategory('');
        setSelectedRole(null);
        setEntityId('');
        setEntityType('');
        setSelectedTradeTeamId('');
        setSelectedCrewId('');
        setIsPrimary(true);
        onRolesChange();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const updateVolunteerTeamAssignment = async () => {
    try {
      const updateData: any = {};
      if (selectedCrewId) {
        updateData.trade_crew_id = selectedCrewId;
      } else if (selectedTradeTeamId) {
        updateData.trade_team_id = selectedTradeTeamId;
      }

      await fetch(`/api/v1/volunteers/${volunteerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
    } catch (error) {
      console.error('Error updating volunteer team assignment:', error);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm('Remove this role assignment?')) return;

    try {
      const response = await fetch(`/api/v1/volunteer-roles/${roleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onRolesChange();
      } else {
        alert('Failed to remove role');
      }
    } catch (error) {
      console.error('Error removing role:', error);
      alert('Failed to remove role');
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon = CATEGORY_ICONS[category] || Briefcase;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Organizational Roles</h3>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Role
        </button>
      </div>

      {/* Current Roles */}
      <div className="space-y-2">
        {currentRoles.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No organizational roles assigned</p>
        ) : (
          currentRoles.map((role) => (
            <div
              key={role.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                CATEGORY_COLORS[role.roleCategory] || 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getCategoryIcon(role.roleCategory)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{role.roleName}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-white bg-opacity-50 rounded">
                      {role.roleCode}
                    </span>
                    {role.isPrimary && (
                      <span className="text-xs px-1.5 py-0.5 bg-white bg-opacity-50 rounded font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5">
                    {CATEGORY_LABELS[role.roleCategory]}
                    {role.entityType && role.entityId && (
                      <span className="ml-2">• {role.entityType}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRole(role.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Assign Role</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCategory('');
                  setSelectedRole(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedRole(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {Object.keys(availableRoles).map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection */}
              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={selectedRole?.code || ''}
                    onChange={(e) => {
                      const role = availableRoles[selectedCategory]?.find(
                        (r) => r.code === e.target.value
                      );
                      setSelectedRole(role || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role...</option>
                    {availableRoles[selectedCategory]?.map((role) => (
                      <option key={role.code} value={role.code}>
                        {role.name} ({role.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Trade Team Selection (for TRADE_TEAM roles) */}
              {selectedRole && selectedRole.category === 'TRADE_TEAM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trade Team <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTradeTeamId}
                    onChange={(e) => setSelectedTradeTeamId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select trade team...</option>
                    {tradeTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Trade Crew Selection (for TRADE_CREW roles) */}
              {selectedRole && selectedRole.category === 'TRADE_CREW' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trade Team <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedTradeTeamId}
                      onChange={(e) => setSelectedTradeTeamId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select trade team...</option>
                      {tradeTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedTradeTeamId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trade Crew <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedCrewId}
                        onChange={(e) => setSelectedCrewId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select trade crew...</option>
                        {crews.map((crew) => (
                          <option key={crew.id} value={crew.id}>
                            {crew.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Entity Assignment (Optional for other roles) */}
              {selectedRole && selectedRole.category !== 'TRADE_TEAM' && selectedRole.category !== 'TRADE_CREW' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity Type (Optional)
                      </label>
                      <select
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">None</option>
                        <option value="CG">Construction Group</option>
                        <option value="PROJECT">Project</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={entityId}
                        onChange={(e) => setEntityId(e.target.value)}
                        placeholder="e.g., team or project ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Primary Role Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                      Primary role (main responsibility)
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCategory('');
                  setSelectedRole(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRole}
                disabled={!selectedRole || loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
