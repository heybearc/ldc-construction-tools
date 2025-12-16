'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Plus, X, Edit, Trash2, ExternalLink, Building2, Hash, Layers } from 'lucide-react';

interface Crew {
  id: string;
  name: string;
  tradeTeam: {
    id: string;
    name: string;
  };
  _count: {
    CrewMembers: number;
  };
}

interface CrewAssignment {
  id: string;
  crewId: string;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  crew: Crew;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  projectNumber: string | null;
  location: string | null;
  projectType: string | null;
  currentPhase: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  jwSharepointUrl: string | null;
  builderAssistantUrl: string | null;
  constructionGroup: {
    id: string;
    name: string;
    code: string;
  } | null;
  crewAssignments: CrewAssignment[];
  _count: {
    crewAssignments: number;
  };
}

const statusColors: Record<string, string> = {
  PLANNING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const PROJECT_TYPES = [
  'Kingdom Hall',
  'Assembly Hall',
  'Remote Translation Office',
  'Branch Office',
  'Bethel',
  'Other'
];

const CONSTRUCTION_PHASES = [
  'Site Preparation/Clearing',
  'Construction Mobilization/Temp Services',
  'Site Work',
  'Structural',
  'Rough-in',
  'Finishes',
  'Construction Final Prep'
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [availableCrews, setAvailableCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: '',
    projectNumber: '',
    description: '',
    location: '',
    projectType: '',
    currentPhase: '',
    status: '',
    startDate: '',
    endDate: '',
    jwSharepointUrl: '',
    builderAssistantUrl: '',
  });

  useEffect(() => {
    fetchProject();
    fetchAvailableCrews();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      setProject(data);
      setEditFormData({
        name: data.name || '',
        projectNumber: data.projectNumber || '',
        description: data.description || '',
        location: data.location || '',
        projectType: data.projectType || '',
        currentPhase: data.currentPhase || '',
        status: data.status || 'PLANNING',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        jwSharepointUrl: data.jwSharepointUrl || '',
        builderAssistantUrl: data.builderAssistantUrl || '',
      });
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCrews = async () => {
    try {
      const res = await fetch('/api/v1/trade-teams');
      if (!res.ok) return;
      const teams = await res.json();
      const allCrews: Crew[] = [];
      for (const team of teams) {
        const crewRes = await fetch(`/api/v1/trade-teams/${team.id}/crews`);
        if (crewRes.ok) {
          const crews = await crewRes.json();
          allCrews.push(...crews.map((c: any) => ({ ...c, tradeTeam: team })));
        }
      }
      setAvailableCrews(allCrews);
    } catch (err) {
      console.error('Failed to fetch crews:', err);
    }
  };

  const handleAssignCrew = async () => {
    if (!selectedCrewId) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/crews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crewId: selectedCrewId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to assign crew');
      }
      setShowAssignModal(false);
      setSelectedCrewId('');
      fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveCrew = async (crewId: string) => {
    if (!confirm('Remove this crew from the project?')) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/crews/${crewId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove crew');
      fetchProject();
    } catch (err) {
      alert('Failed to remove crew');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) throw new Error('Failed to update project');
      setShowEditModal(false);
      fetchProject();
    } catch (err) {
      alert('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      router.push('/projects');
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const assignedCrewIds = project?.crewAssignments.map(a => a.crewId) || [];
  const unassignedCrews = availableCrews.filter(c => !assignedCrewIds.includes(c.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error || 'Project not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              {project.projectNumber && (
                <span className="text-gray-500">#{project.projectNumber}</span>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[project.status] || project.status}
              </span>
            </div>
            {project.projectType && (
              <p className="mt-1 text-gray-600">{project.projectType}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDeleteProject}
            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-medium">{project.location || '-'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Current Phase</div>
              <div className="font-medium text-blue-600">{project.currentPhase || '-'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Timeline</div>
              <div className="font-medium">{formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Assigned Crews</div>
              <div className="font-medium">{project._count.crewAssignments}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {/* External Links */}
      {(project.jwSharepointUrl || project.builderAssistantUrl) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">External Links</h2>
          <div className="flex flex-wrap gap-4">
            {project.jwSharepointUrl && (
              <a
                href={project.jwSharepointUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                JW SharePoint
              </a>
            )}
            {project.builderAssistantUrl && (
              <a
                href={project.builderAssistantUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Builder Assistant
              </a>
            )}
          </div>
        </div>
      )}

      {/* Crew Assignments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Assigned Crews</h2>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Crew
          </button>
        </div>
        {project.crewAssignments.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No crews assigned</h3>
            <p className="text-gray-500 mt-1">Assign crews to this project to track who is working on it.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {project.crewAssignments.map((assignment) => (
              <li key={assignment.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{assignment.crew.name}</div>
                  <div className="text-sm text-gray-500">
                    {assignment.crew.tradeTeam.name} • {assignment.crew._count.CrewMembers} members
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCrew(assignment.crewId)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assign Crew Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Assign Crew to Project</h2>
            </div>
            <div className="px-6 py-4">
              {unassignedCrews.length === 0 ? (
                <p className="text-gray-500">All crews are already assigned to this project.</p>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Crew</label>
                  <select
                    value={selectedCrewId}
                    onChange={(e) => setSelectedCrewId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a crew...</option>
                    {unassignedCrews.map((crew) => (
                      <option key={crew.id} value={crew.id}>
                        {crew.name} ({crew.tradeTeam.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => { setShowAssignModal(false); setSelectedCrewId(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              {unassignedCrews.length > 0 && (
                <button
                  onClick={handleAssignCrew}
                  disabled={!selectedCrewId}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  Assign
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Edit Project</h2>
            </div>
            <form onSubmit={handleUpdateProject}>
              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Number</label>
                    <input
                      type="text"
                      value={editFormData.projectNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, projectNumber: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Type</label>
                    <select
                      value={editFormData.projectType}
                      onChange={(e) => setEditFormData({ ...editFormData, projectType: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select type</option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Phase</label>
                    <select
                      value={editFormData.currentPhase}
                      onChange={(e) => setEditFormData({ ...editFormData, currentPhase: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select phase</option>
                      {CONSTRUCTION_PHASES.map((phase) => (
                        <option key={phase} value={phase}>{phase}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={editFormData.startDate}
                      onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={editFormData.endDate}
                      onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">External Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">JW SharePoint URL</label>
                      <input
                        type="url"
                        value={editFormData.jwSharepointUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, jwSharepointUrl: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://sharepoint.jw.org/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Builder Assistant URL</label>
                      <input
                        type="url"
                        value={editFormData.builderAssistantUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, builderAssistantUrl: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://ba.jw.org/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
