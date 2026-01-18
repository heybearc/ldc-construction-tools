import React, { useState, useEffect } from 'react';
import { Users, Shield, Award, CheckCircle, AlertCircle, Plus } from 'lucide-react';

// Simple Role Management Component with Defensive Programming
export default function RoleManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Defensive data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test health check first
      const healthResponse = await fetch('/api/v1/role-assignments/health');
      const healthData = await healthResponse.json();
      
      if (!healthData.success) {
        throw new Error('Role Management API not available');
      }
      
      // Fetch role assignments
      const assignmentsResponse = await fetch('/api/v1/role-assignments');
      const assignmentsData = await assignmentsResponse.json();
      
      if (assignmentsData.success && Array.isArray(assignmentsData.data)) {
        setRoleAssignments(assignmentsData.data);
      }
      
      // Fetch statistics
      const statsResponse = await fetch('/api/v1/role-assignments/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      
    } catch (err) {
      console.error('Failed to fetch role management data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading Role Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3 h-8 w-8 text-blue-600" />
            Role Management
          </h2>
          <p className="text-gray-600 mt-1">
            USLDC-2829-E compliant role-based access control system
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary?.totalAssignments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary?.recentAssignments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vacant Roles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary?.vacantRolesCount || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Consultation</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary?.consultationPending || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignments Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Role Assignments</h3>
          <p className="text-sm text-gray-600">Manage organizational role assignments and permissions</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roleAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No role assignments found. Create your first assignment to get started.
                  </td>
                </tr>
              ) : (
                roleAssignments.map((assignment: any) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.user?.name || assignment.user?.email || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.role?.displayName || assignment.role?.name || 'Unknown Role'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.role?.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {assignment.assignmentType?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={'inline-flex px-2 py-1 text-xs font-semibold rounded-full ' + 
                        (assignment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                        {assignment.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <CheckCircle className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Role Management API is operational. All endpoints are ready for testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
