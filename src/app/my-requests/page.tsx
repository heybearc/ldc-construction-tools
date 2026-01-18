'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClipboardList, User, CheckCircle, Clock, XCircle, Search, Mail, Users, Briefcase, MessageSquare, UserPlus, UserMinus, FileText, AlertCircle } from 'lucide-react';

interface CrewRequest {
  id: string;
  request_type: string;
  requestor_name: string;
  requestor_email: string;
  volunteer_name: string;
  volunteer_ba_id: string | null;
  crew_name: string | null;
  project_roster_name: string | null;
  comments: string | null;
  status: string;
  completed_at: string | null;
  completed_by: { id: string; name: string } | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  NEW: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  COMPLETED: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export default function MyRequestsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [requests, setRequests] = useState<CrewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [userOrgRoles, setUserOrgRoles] = useState<string[]>([]);

  useEffect(() => {
    loadMyRequests();
    loadUserOrgRoles();
  }, []);

  const loadUserOrgRoles = async () => {
    try {
      const response = await fetch('/api/v1/user/roles');
      if (response.ok) {
        const data = await response.json();
        setUserOrgRoles(data.orgRoles || []);
      }
    } catch (error) {
      console.error('Failed to load user roles:', error);
    }
  };

  const loadMyRequests = async () => {
    try {
      const response = await fetch('/api/v1/crew-requests?my_requests=true');
      if (response.ok) {
        const data = await response.json();
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ADD_TO_CREW: 'Add to Crew',
      REMOVE_FROM_CREW: 'Remove from Crew',
      ADD_TO_PROJECT_ROSTER: 'Add to Project Roster',
    };
    return labels[type] || type;
  };

  const getRequestTypeIcon = (type: string) => {
    const iconProps = { className: "h-4 w-4" };
    switch (type) {
      case 'ADD_TO_CREW': return <UserPlus {...iconProps} />;
      case 'REMOVE_FROM_CREW': return <UserMinus {...iconProps} />;
      case 'ADD_TO_PROJECT_ROSTER': return <FileText {...iconProps} />;
      default: return null;
    }
  };

  const getRequestTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ADD_TO_CREW: 'bg-green-100 text-green-700',
      REMOVE_FROM_CREW: 'bg-red-100 text-red-700',
      ADD_TO_PROJECT_ROSTER: 'bg-blue-100 text-blue-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    const matchesSearch = !searchTerm || 
      request.volunteer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.crew_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project_roster_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === 'NEW').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length
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

  const hasTradeTeamRoles = userOrgRoles.some(role => 
    ['TTO', 'TTOA', 'TTS', 'TCO', 'TCOA', 'TCS'].includes(role)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (!hasTradeTeamRoles) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardList className="mr-3 h-8 w-8 text-blue-600" />
            My Requests
          </h2>
          <p className="text-gray-600 mt-1">Track crew change requests assigned to you</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No Trade Team Roles Assigned</h3>
              <p className="text-blue-800 mb-3">
                This page shows crew change requests assigned to Trade Team Overseers (TTO), Trade Team Overseer Assistants (TTOA), 
                Trade Team Supervisors (TTS), Trade Crew Overseers (TCO), Trade Crew Overseer Assistants (TCOA), and Trade Crew Support (TCS).
              </p>
              <p className="text-blue-800">
                You currently don't have any of these organizational roles assigned. If you believe this is an error, 
                please contact your Personnel Contact or administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <ClipboardList className="mr-3 h-8 w-8 text-blue-600" />
          My Requests
        </h2>
        <p className="text-gray-600 mt-1">Crew change requests assigned to you based on your organizational roles</p>
        {userOrgRoles.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">Your roles:</span>
            {userOrgRoles.map(role => (
              <span key={role} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <ClipboardList className="h-6 w-6 text-gray-400 mr-5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Assigned</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 overflow-hidden shadow rounded-lg cursor-pointer hover:bg-blue-100" onClick={() => setStatusFilter('NEW')}>
          <div className="p-5">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-blue-400 mr-5" />
              <div>
                <dt className="text-sm font-medium text-blue-600">New</dt>
                <dd className="text-lg font-medium text-blue-700">{stats.new}</dd>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 overflow-hidden shadow rounded-lg cursor-pointer hover:bg-amber-100" onClick={() => setStatusFilter('IN_PROGRESS')}>
          <div className="p-5">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-amber-400 mr-5" />
              <div>
                <dt className="text-sm font-medium text-amber-600">In Progress</dt>
                <dd className="text-lg font-medium text-amber-700">{stats.inProgress}</dd>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 overflow-hidden shadow rounded-lg cursor-pointer hover:bg-green-100" onClick={() => setStatusFilter('COMPLETED')}>
          <div className="p-5">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-5" />
              <div>
                <dt className="text-sm font-medium text-green-600">Completed</dt>
                <dd className="text-lg font-medium text-green-700">{stats.completed}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Requests</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by volunteer, requestor, crew..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'No crew change requests have been assigned to you yet'}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRequestTypeColor(request.request_type)}`}>
                      {getRequestTypeIcon(request.request_type)}
                      {getRequestTypeLabel(request.request_type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[request.status]?.bgColor} ${STATUS_CONFIG[request.status]?.color}`}>
                      {STATUS_CONFIG[request.status]?.label || request.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {request.volunteer_name}
                    {request.volunteer_ba_id && (
                      <span className="text-sm font-normal text-gray-500 ml-2">(BA ID: {request.volunteer_ba_id})</span>
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
                <div className="ml-4">
                  <button
                    onClick={() => router.push('/crew-requests')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
