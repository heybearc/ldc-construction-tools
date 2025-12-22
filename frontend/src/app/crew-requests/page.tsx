'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, Search, Filter, CheckCircle, Clock, AlertCircle, 
  User, Mail, Users, Briefcase, MessageSquare, X, ChevronDown,
  UserPlus, UserMinus, FileText, RefreshCw, ExternalLink, Info,
  Plus, Save
} from 'lucide-react';

interface CrewRequest {
  id: string;
  request_type: string;
  requestor_name: string;
  requestor_email: string;
  volunteer_name: string;
  volunteer_ba_id: string | null;
  trade_team_id: string | null;
  crew_id: string | null;
  crew_name: string | null;
  project_id: string | null;
  project_roster_name: string | null;
  comments: string | null;
  status: string;
  assigned_to: { id: string; name: string; email: string } | null;
  resolution_notes: string | null;
  completed_at: string | null;
  completed_by: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
}

interface PersonnelUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TradeTeam {
  id: string;
  name: string;
  crews: { id: string; name: string }[];
}

interface NewVolunteerData {
  firstName: string;
  lastName: string;
  baId: string;
  phone: string;
  emailPersonal: string;
  congregation: string;
  tradeTeamId: string;
  crewId: string;
}

const REQUEST_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ADD_TO_CREW: { label: 'Add to Crew', icon: <UserPlus className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
  REMOVE_FROM_CREW: { label: 'Remove from Crew', icon: <UserMinus className="h-4 w-4" />, color: 'bg-red-100 text-red-700' },
  ADD_TO_PROJECT_ROSTER: { label: 'Add to Project Roster', icon: <FileText className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  NEW: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  COMPLETED: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
};


const initialVolunteerData: NewVolunteerData = {
  firstName: '',
  lastName: '',
  baId: '',
  phone: '',
  emailPersonal: '',
  congregation: '',
  tradeTeamId: '',
  crewId: '',
};

export default function CrewRequestsPage() {
  const [requests, setRequests] = useState<CrewRequest[]>([]);
  const [personnelUsers, setPersonnelUsers] = useState<PersonnelUser[]>([]);
  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CrewRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [cgProjectUrl, setCgProjectUrl] = useState<string>("https://www.jw.org/en/volunteer/ldc/");
  const [volunteerData, setVolunteerData] = useState<NewVolunteerData>(initialVolunteerData);
  const [addingVolunteer, setAddingVolunteer] = useState(false);
  const [volunteerError, setVolunteerError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const url = statusFilter === 'ALL' 
        ? '/api/v1/crew-requests' 
        : `/api/v1/crew-requests?status=${statusFilter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchPersonnelUsers = async () => {
    try {
      const response = await fetch('/api/v1/admin/users');
      if (response.ok) {
        const data = await response.json();
        // Filter to only Personnel roles
        const personnel = (data.users || []).filter((u: PersonnelUser) => 
          u.role?.includes('PERSONNEL')
        );
        setPersonnelUsers(personnel);
      }
    } catch (err) {
      console.error('Failed to fetch personnel users:', err);
    }
  };

  const fetchCGSettings = async () => {
    try {
      const response = await fetch("/api/v1/admin/construction-group");
      if (response.ok) {
        const data = await response.json();
        if (data.cgProjectUrl) {
          setCgProjectUrl(data.cgProjectUrl);
        }
      }
    } catch (err) {
      console.error("Failed to fetch CG settings:", err);
    }
  };

  const fetchTradeTeams = async () => {
    try {
      const response = await fetch('/api/v1/trade-teams?include_crews=true');
      if (response.ok) {
        const data = await response.json();
        setTradeTeams(data);
      }
    } catch (err) {
      console.error('Failed to fetch trade teams:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchPersonnelUsers();
    fetchTradeTeams();
    fetchCGSettings();
  }, [fetchRequests]);

  const handleStatusChange = async (requestId: string, newStatus: string, resolutionNotes?: string, sendEmail?: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/crew-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          resolution_notes: resolutionNotes,
          send_completion_email: sendEmail
        }),
      });
      if (response.ok) {
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Failed to update request:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssign = async (requestId: string, userId: string | null) => {
    try {
      const response = await fetch(`/api/v1/crew-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to_id: userId }),
      });
      if (response.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to assign request:', err);
    }
  };

  const handleAddVolunteer = async () => {
    if (!volunteerData.firstName || !volunteerData.lastName) {
      setVolunteerError('First and last name are required');
      return;
    }

    setAddingVolunteer(true);
    setVolunteerError(null);

    try {
      const response = await fetch('/api/v1/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: volunteerData.firstName,
          last_name: volunteerData.lastName,
          ba_id: volunteerData.baId || null,
          phone: volunteerData.phone || null,
          email_personal: volunteerData.emailPersonal || null,
          congregation: volunteerData.congregation || null,
          trade_team_id: volunteerData.tradeTeamId || null,
          trade_crew_id: volunteerData.crewId || null,
          role: 'Trade Crew Volunteer',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add volunteer');
      }

      setShowAddVolunteer(false);
      setVolunteerData(initialVolunteerData);
      alert('Volunteer added successfully!');
    } catch (err) {
      setVolunteerError(err instanceof Error ? err.message : 'Failed to add volunteer');
    } finally {
      setAddingVolunteer(false);
    }
  };

  const prefillVolunteerFromRequest = (request: CrewRequest) => {
    const nameParts = request.volunteer_name.split(' ');
    setVolunteerData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      baId: request.volunteer_ba_id || '',
      phone: '',
      emailPersonal: '',
      congregation: '',
      tradeTeamId: request.trade_team_id || '',
      crewId: request.crew_id || '',
    });
    setShowAddVolunteer(true);
  };

  const filteredRequests = requests.filter(r => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      r.volunteer_name.toLowerCase().includes(search) ||
      r.requestor_name.toLowerCase().includes(search) ||
      r.requestor_email.toLowerCase().includes(search) ||
      r.crew_name?.toLowerCase().includes(search) ||
      r.project_roster_name?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === 'NEW').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const selectedTeam = tradeTeams.find(t => t.id === volunteerData.tradeTeamId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ClipboardList className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crew Change Requests</h1>
              <p className="text-gray-600">Manage crew and roster update requests</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Info className="h-4 w-4 mr-2" />
              {showInstructions ? 'Hide' : 'Show'} Instructions
            </button>
            <button
              onClick={() => fetchRequests()}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Workflow Instructions */}
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Personnel Team Workflow Instructions
            </h3>
            <ol className="space-y-3 text-blue-800">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                <div>
                  <span className="font-medium">Go to the Construction Group Project</span>
                  <a 
                    href={cgProjectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                  >
                    Open CG Project <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                <span>Add new volunteer to the required crew in the CG Project system.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                <span>Adjust volunteer skill level based on most recent assessment.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                <div>
                  <span>Assign Volunteer in LDC Tools to the same crew that was requested.</span>
                  <button
                    onClick={() => setShowAddVolunteer(true)}
                    className="ml-2 inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add New Volunteer
                  </button>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">5</span>
                <span>Mark the request as Complete. An email notification will be sent to the requestor.</span>
              </li>
            </ol>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setStatusFilter('NEW')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">New</p>
                <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 shadow-sm border border-amber-100 cursor-pointer hover:bg-amber-100" onClick={() => setStatusFilter('IN_PROGRESS')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">In Progress</p>
                <p className="text-2xl font-bold text-amber-700">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-100 cursor-pointer hover:bg-green-100" onClick={() => setStatusFilter('COMPLETED')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by volunteer, requestor, crew..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm ? 'Try adjusting your search' : 'No crew change requests yet'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${REQUEST_TYPE_LABELS[request.request_type]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {REQUEST_TYPE_LABELS[request.request_type]?.icon}
                        {REQUEST_TYPE_LABELS[request.request_type]?.label || request.request_type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[request.status]?.bgColor} ${STATUS_CONFIG[request.status]?.color}`}>
                        {STATUS_CONFIG[request.status]?.label || request.status}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {request.volunteer_name}
                      {request.volunteer_ba_id && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (BA ID: {request.volunteer_ba_id})
                        </span>
                      )}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        Requested by: {request.requestor_name}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {request.requestor_email}
                      </div>
                      {request.crew_name && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          Crew: {request.crew_name}
                        </div>
                      )}
                      {request.project_roster_name && (
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                          Project: {request.project_roster_name}
                        </div>
                      )}
                    </div>
                    
                    {request.comments && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <MessageSquare className="h-4 w-4 inline mr-1" />
                        {request.comments}
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-400">
                      Submitted: {formatDate(request.created_at)}
                      {request.completed_at && (
                        <span className="ml-4">
                          Completed: {formatDate(request.completed_at)} by {request.completed_by?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {request.status !== 'COMPLETED' && request.status !== 'REJECTED' && (
                      <>
                        <select
                          value={request.assigned_to?.id || ''}
                          onChange={(e) => handleAssign(request.id, e.target.value || null)}
                          className="text-sm px-2 py-1 border border-gray-300 rounded min-w-[150px]"
                        >
                          <option value="">Assign to...</option>
                          {personnelUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.name || u.email}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          {request.request_type === 'ADD_TO_CREW' && (
                            <button
                              onClick={() => prefillVolunteerFromRequest(request)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Volunteer
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Complete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Complete Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Complete Request</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedRequest.volunteer_name}</p>
              <p className="text-sm text-gray-600">
                {REQUEST_TYPE_LABELS[selectedRequest.request_type]?.label}
                {selectedRequest.crew_name && ` - ${selectedRequest.crew_name}`}
                {selectedRequest.project_roster_name && ` - ${selectedRequest.project_roster_name}`}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Notes (optional)
              </label>
              <textarea
                id="resolution-notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add any notes about how this was resolved..."
              />
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  id="send-email"
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-blue-800">
                  Send completion notification email to {selectedRequest.requestor_email}
                </span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const notes = (document.getElementById('resolution-notes') as HTMLTextAreaElement)?.value;
                  const sendEmail = (document.getElementById('send-email') as HTMLInputElement)?.checked;
                  handleStatusChange(selectedRequest.id, 'COMPLETED', notes, sendEmail);
                }}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isUpdating ? 'Completing...' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Volunteer Modal */}
      {showAddVolunteer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Volunteer</h3>
              <button onClick={() => { setShowAddVolunteer(false); setVolunteerData(initialVolunteerData); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {volunteerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {volunteerError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={volunteerData.firstName}
                  onChange={(e) => setVolunteerData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={volunteerData.lastName}
                  onChange={(e) => setVolunteerData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BA ID</label>
                <input
                  type="text"
                  value={volunteerData.baId}
                  onChange={(e) => setVolunteerData(prev => ({ ...prev, baId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={volunteerData.phone}
                  onChange={(e) => setVolunteerData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={volunteerData.emailPersonal}
                  onChange={(e) => setVolunteerData(prev => ({ ...prev, emailPersonal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Congregation</label>
                <input
                  type="text"
                  value={volunteerData.congregation}
                  onChange={(e) => setVolunteerData(prev => ({ ...prev, congregation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trade Team</label>
                <select
                  value={volunteerData.tradeTeamId}
                  onChange={(e) => setVolunteerData(prev => ({ ...prev, tradeTeamId: e.target.value, crewId: '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Trade Team</option>
                  {tradeTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crew</label>
                <select
                  value={volunteerData.crewId}
                  onChange={(e) => setVolunteerData(prev => ({ ...prev, crewId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!volunteerData.tradeTeamId}
                >
                  <option value="">Select Crew</option>
                  {selectedTeam?.crews.map(crew => (
                    <option key={crew.id} value={crew.id}>{crew.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowAddVolunteer(false); setVolunteerData(initialVolunteerData); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVolunteer}
                disabled={addingVolunteer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {addingVolunteer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Volunteer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
