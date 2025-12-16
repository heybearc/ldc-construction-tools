'use client';

import React, { useState, useEffect } from 'react';
import { Search, Wrench, Users, Settings, AlertCircle, Plus, X, Edit, Trash2, Eye, Grid3X3 } from 'lucide-react';
import Link from 'next/link';

interface TradeTeam {
  id: string;
  name: string;
  description?: string;
  crew_count: number;
  total_members: number;
  active_crews: number;
  is_active: boolean;
}

interface TradeCrew {
  id: string;
  name: string;
  description: string;
  trade_team_id: string;
  trade_team_name: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

interface TradeTeamsStats {
  total_teams: number;
  total_crews: number;
  active_crews: number;
  inactive_crews: number;
}

interface TradeTeamFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export default function TradeTeamsPage() {
  const [teams, setTeams] = useState<TradeTeam[]>([]);
  const [stats, setStats] = useState<TradeTeamsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TradeTeam | null>(null);
  const [formData, setFormData] = useState<TradeTeamFormData>({
    name: '',
    description: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/trade-teams');
      if (!response.ok) {
        throw new Error(`Failed to fetch trade teams: ${response.statusText}`);
      }
      
      const teamsData = await response.json();
      setTeams(teamsData);
      
      const calculatedStats: TradeTeamsStats = {
        total_teams: teamsData.length,
        total_crews: teamsData.reduce((sum: number, team: TradeTeam) => sum + team.crew_count, 0),
        active_crews: teamsData.reduce((sum: number, team: TradeTeam) => sum + team.active_crews, 0),
        inactive_crews: teamsData.reduce((sum: number, team: TradeTeam) => sum + (team.crew_count - team.active_crews), 0)
      };
      setStats(calculatedStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trade teams');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTeam(null);
    setFormData({ name: '', description: '', isActive: true });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (team: TradeTeam) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      isActive: team.is_active
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: '', description: '', isActive: true });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const url = editingTeam 
        ? `/api/v1/trade-teams/${editingTeam.id}`
        : '/api/v1/trade-teams';
      
      const method = editingTeam ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save trade team');
      }

      closeModal();
      fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save trade team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (team: TradeTeam) => {
    if (!confirm(`Are you sure you want to delete "${team.name}"? This will also delete all crews in this team.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/trade-teams/${team.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete trade team');
      }

      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete trade team');
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Error loading trade teams</span>
          </div>
          <p className="mt-2 text-sm">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trade Teams</h1>
                <p className="text-sm text-gray-600">Construction trade team management and crew organization</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link 
                href="/trade-teams/overview"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Overview
              </Link>
              <button 
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trade Team
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-100 p-6 rounded-lg">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <h3 className="font-semibold text-blue-800">Total Teams</h3>
                  <p className="text-2xl font-bold text-blue-900">{stats.total_teams}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-100 p-6 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <h3 className="font-semibold text-green-800">Total Crews</h3>
                  <p className="text-2xl font-bold text-green-900">{stats.total_crews}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-100 p-6 rounded-lg">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <h3 className="font-semibold text-yellow-800">Active Crews</h3>
                  <p className="text-2xl font-bold text-yellow-900">{stats.active_crews}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-100 p-6 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <h3 className="font-semibold text-red-800">Inactive Crews</h3>
                  <p className="text-2xl font-bold text-red-900">{stats.inactive_crews}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search trade teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Trade Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeams.map((team) => (
            <TradeTeamCard 
              key={team.id} 
              team={team} 
              onEdit={() => openEditModal(team)}
              onDelete={() => handleDelete(team)}
            />
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trade teams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new trade team.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trade Team
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTeam ? 'Edit Trade Team' : 'Create Trade Team'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Electrical, Plumbing, Structural"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description of this trade team"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    editingTeam ? 'Update Team' : 'Create Team'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface TradeTeamCardProps {
  team: TradeTeam;
  onEdit: () => void;
  onDelete: () => void;
}

const TradeTeamCard: React.FC<TradeTeamCardProps> = ({ team, onEdit, onDelete }) => {
  const [showCrews, setShowCrews] = useState(false);
  const [crews, setCrews] = useState<TradeCrew[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleShowCrews = async () => {
    if (!showCrews && crews.length === 0) {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/trade-teams/${team.id}/crews`);
        if (response.ok) {
          const crewsData = await response.json();
          setCrews(crewsData);
        }
      } catch (err) {
        console.error('Failed to load crews:', err);
      } finally {
        setLoading(false);
      }
    }
    setShowCrews(!showCrews);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <span className="text-3xl mr-3">{getTeamIcon(team.name)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                team.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {team.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex space-x-1">
            <Link
              href={`/trade-teams/${team.id}`}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Crews:</span>
            <span className="font-medium">{team.crew_count}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Active Crews:</span>
            <span className="font-medium text-green-600">{team.active_crews}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Members:</span>
            <span className="font-medium">{team.total_members}</span>
          </div>
        </div>

        <button
          onClick={handleShowCrews}
          className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
          disabled={loading}
        >
          {loading ? 'Loading...' : showCrews ? 'Hide Crews' : 'Show Crews'}
        </button>
        
        {showCrews && crews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-3 text-gray-900">Crews:</h4>
            <div className="space-y-2">
              {crews.map((crew) => (
                <div key={crew.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{crew.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    crew.status === 'active' ? 'bg-green-100 text-green-800' :
                    crew.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {crew.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showCrews && crews.length === 0 && !loading && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            No crews in this team yet
          </div>
        )}
      </div>
    </div>
  );
};
