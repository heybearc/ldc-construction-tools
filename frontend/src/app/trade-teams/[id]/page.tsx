'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OversightSection from '@/components/oversight/OversightSection';
import { TRADE_TEAM_OVERSIGHT_CONFIG } from '@/lib/oversight-types';
import { 
  Wrench, Users, ArrowLeft, Edit, Trash2, Plus, X, 
  CheckCircle, AlertCircle, UserPlus, Settings, Eye
} from 'lucide-react';

interface Crew {
  id: string;
  name: string;
  description: string;
  status: string;
  member_count: number;
  is_active: boolean;
}

interface TradeTeam {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  crew_count: number;
  total_members: number;
  crews: Crew[];
  created_at: string;
  updated_at: string;
}

interface CrewFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export default function TradeTeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<TradeTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string; name: string | null; email: string}>>([]);

  // Edit team modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', isActive: true });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Add crew modal
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [crewFormData, setCrewFormData] = useState<CrewFormData>({
    name: '',
    description: '',
    status: 'ACTIVE'
  });
  const [isCrewSubmitting, setIsCrewSubmitting] = useState(false);
  const [crewFormError, setCrewFormError] = useState<string | null>(null);

  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchUsers();
    }
  }, [teamId]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/volunteers');
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data.volunteers || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/trade-teams/${teamId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Trade team not found');
        }
        throw new Error('Failed to fetch trade team');
      }

      const data = await response.json();
      setTeam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trade team');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (team) {
      setEditFormData({
        name: team.name,
        description: team.description || '',
        isActive: team.is_active
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditSubmitting(true);

    try {
      const response = await fetch(`/api/v1/trade-teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update trade team');
      }

      setIsEditModalOpen(false);
      fetchTeam();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update trade team');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!team) return;
    
    if (!confirm(`Are you sure you want to delete "${team.name}"? This will also delete all ${team.crew_count} crews.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/trade-teams/${teamId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete trade team');
      }

      router.push('/trade-teams');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete trade team');
    }
  };

  const openCrewModal = (crew?: Crew) => {
    if (crew) {
      setEditingCrew(crew);
      setCrewFormData({
        name: crew.name,
        description: crew.description || '',
        status: crew.status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'PENDING'
      });
    } else {
      setEditingCrew(null);
      setCrewFormData({ name: '', description: '', status: 'ACTIVE' });
    }
    setCrewFormError(null);
    setIsCrewModalOpen(true);
  };

  const handleCrewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCrewSubmitting(true);
    setCrewFormError(null);

    try {
      const url = editingCrew
        ? `/api/v1/trade-teams/${teamId}/crews/${editingCrew.id}`
        : `/api/v1/trade-teams/${teamId}/crews`;

      const method = editingCrew ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crewFormData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save crew');
      }

      setIsCrewModalOpen(false);
      fetchTeam();
    } catch (err) {
      setCrewFormError(err instanceof Error ? err.message : 'Failed to save crew');
    } finally {
      setIsCrewSubmitting(false);
    }
  };

  const handleDeleteCrew = async (crew: Crew) => {
    if (!confirm(`Are you sure you want to delete crew "${crew.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/trade-teams/${teamId}/crews/${crew.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete crew');
      }

      fetchTeam();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete crew');
    }
  };

  const getTeamIcon = (teamName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Electrical': '⚡',
      'Exteriors': '🏠',
      'Interiors': '🏡',
      'Mechanical': '⚙️',
      'Plumbing': '🔧',
      'Site Support': '🏗️',
      'Sitework/Civil': '🚧',
      'Structural': '🏗️'
    };
    return iconMap[teamName] || '👷';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="font-medium text-lg">{error || 'Trade team not found'}</h3>
          <Link
            href="/trade-teams"
            className="mt-4 inline-flex items-center text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trade Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link
              href="/trade-teams"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Trade Teams
            </Link>
            
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <span className="text-4xl mr-4">{getTeamIcon(team.name)}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    {team.name}
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      team.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {team.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </h1>
                  {team.description && (
                    <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={openEditModal}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Crews</h3>
                <p className="text-2xl font-bold text-gray-900">{team.crew_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
                <p className="text-2xl font-bold text-gray-900">{team.total_members}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Crews</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {team.crews.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Team Oversight Section */}
        <OversightSection
          title="Trade Team Leadership"
          entityId={teamId}
          apiBasePath={`/api/v1/trade-teams/${teamId}/oversight`}
          roleConfig={TRADE_TEAM_OVERSIGHT_CONFIG}
          roleOrder={['TTO', 'TTOA', 'TT_SUPPORT']}
          availableUsers={availableUsers}
        />

        {/* Crews Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-500" />
              Crews
            </h2>
            <button
              onClick={() => openCrewModal()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Crew
            </button>
          </div>

          {team.crews.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No crews yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a crew to this trade team.</p>
              <button
                onClick={() => openCrewModal()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Crew
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {team.crews.map((crew) => (
                <div key={crew.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">{crew.name}</h3>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        crew.status === 'active' ? 'bg-green-100 text-green-800' :
                        crew.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {crew.status}
                      </span>
                    </div>
                    {crew.description && (
                      <p className="text-sm text-gray-500 mt-1">{crew.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{crew.member_count} members</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/trade-teams/${teamId}/crews/${crew.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded"
                      title="View Crew Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => openCrewModal(crew)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded"
                      title="Edit Crew"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCrew(crew)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded"
                      title="Delete Crew"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Team Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Trade Team</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isEditSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {isEditSubmitting ? 'Saving...' : 'Update Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Crew Modal */}
      {isCrewModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCrew ? 'Edit Crew' : 'Add Crew'}
              </h3>
              <button onClick={() => setIsCrewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {crewFormError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {crewFormError}
              </div>
            )}

            <form onSubmit={handleCrewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crew Name *</label>
                <input
                  type="text"
                  required
                  value={crewFormData.name}
                  onChange={(e) => setCrewFormData({ ...crewFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Crew A, Morning Shift"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={crewFormData.description}
                  onChange={(e) => setCrewFormData({ ...crewFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={crewFormData.status}
                  onChange={(e) => setCrewFormData({ ...crewFormData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'PENDING' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsCrewModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isCrewSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {isCrewSubmitting ? 'Saving...' : editingCrew ? 'Update Crew' : 'Add Crew'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
