'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Search, Filter, MoreVertical, Edit, Trash2, UserCheck, UserX, Upload, UserPlus, Send, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  adminLevel?: string;
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE';
  regionId: string;
  zoneId: string;
  lastLogin?: string;
  createdAt: string;
}

interface UserStats {
  total: number;
  active: number;
  invited: number;
  inactive: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: '', adminLevel: '', regionId: '', zoneId: '' });
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: '', adminLevel: '', regionId: '', zoneId: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/v1/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/v1/admin/users/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/v1/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });
      
      if (response.ok) {
        alert('User invitation sent successfully!');
        setInviteForm({ email: '', role: '', adminLevel: '', regionId: '', zoneId: '' });
        setIsInviteModalOpen(false);
        loadUsers();
        loadUserStats();
      } else {
        alert('Failed to send invitation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      
      if (response.ok) {
        alert('User created successfully!');
        setCreateForm({ name: '', email: '', role: '', adminLevel: '', regionId: '', zoneId: '', password: '' });
        setIsCreateModalOpen(false);
        loadUsers();
        loadUserStats();
      } else {
        alert('Failed to create user. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/v1/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          adminLevel: selectedUser.adminLevel,
          status: selectedUser.status
        })
      });
      
      if (response.ok) {
        alert('User updated successfully!');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        loadUsers();
        loadUserStats();
      } else {
        alert('Failed to update user. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('User deleted successfully!');
        loadUsers();
        loadUserStats();
      } else {
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleBulkImport = async (file: File) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/v1/admin/users/import', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Successfully imported ${result.imported} users!`);
        setIsBulkImportOpen(false);
        loadUsers();
        loadUserStats();
      } else {
        alert('Failed to import users. Please check file format.');
      }
    } catch (error) {
      console.error('Failed to import users:', error);
      alert('Failed to import users. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
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
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            User Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and invitations
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="mr-2 h-4 w-4" />
            Invite User
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Invited</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.invited}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserX className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Inactive</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.inactive}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="COORDINATOR">Coordinator</option>
              <option value="READ_ONLY">Read Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INVITED">Invited</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-visible">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'INVITED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="More actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openDropdownId === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsEditModalOpen(true);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteUser(user.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-600" />
                Invite User
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  required
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Role</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ZONE_OVERSEER">Zone Overseer</option>
                  <option value="ZONE_OVERSEER_ASSISTANT">Zone Overseer Assistant</option>
                  <option value="ZONE_OVERSEER_SUPPORT">Zone Overseer Support</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER">Construction Group Overseer</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER_ASSISTANT">Construction Group Overseer Assistant</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER_SUPPORT">Construction Group Overseer Support</option>
                  <option value="TRADE_TEAM_OVERSEER">Trade Team Overseer</option>
                  <option value="TRADE_TEAM_OVERSEER_ASSISTANT">Trade Team Overseer Assistant</option>
                  <option value="TRADE_TEAM_OVERSEER_SUPPORT">Trade Team Overseer Support</option>
                  <option value="TRADE_CREW_OVERSEER">Trade Crew Overseer</option>
                  <option value="TRADE_CREW_OVERSEER_ASSISTANT">Trade Crew Overseer Assistant</option>
                  <option value="TRADE_CREW_OVERSEER_SUPPORT">Trade Crew Overseer Support</option>
                  <option value="PERSONNEL_CONTACT">Personnel Contact</option>
                  <option value="PERSONNEL_CONTACT_ASSISTANT">Personnel Contact Assistant</option>
                  <option value="PERSONNEL_CONTACT_SUPPORT">Personnel Contact Support</option>
                  <option value="FIELD_REP">Field Rep</option>
                  <option value="FIELD_REP_ASSISTANT">Field Rep Assistant</option>
                  <option value="FIELD_REP_SUPPORT">Field Rep Support</option>
                  <option value="DESIGN_CONTACT">Design Contact</option>
                  <option value="DESIGN_CONTACT_ASSISTANT">Design Contact Assistant</option>
                  <option value="DESIGN_CONTACT_SUPPORT">Design Contact Support</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR">Project Construction Coordinator</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR_ASSISTANT">Project Construction Coordinator Assistant</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR_SUPPORT">Project Construction Coordinator Support</option>
                  <option value="SAFETY_COORDINATOR">Safety Coordinator</option>
                  <option value="SAFETY_COORDINATOR_ASSISTANT">Safety Coordinator Assistant</option>
                  <option value="SAFETY_COORDINATOR_SUPPORT">Safety Coordinator Support</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Level (Optional)
                </label>
                <select
                  value={inviteForm.adminLevel}
                  onChange={(e) => setInviteForm({...inviteForm, adminLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Admin Access</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="READ_ONLY_ADMIN">Read-Only Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Grant admin access in addition to their role</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone
                  </label>
                  <select
                    value={inviteForm.zoneId}
                    onChange={(e) => setInviteForm({...inviteForm, zoneId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Zone</option>
                    <option value="zone-1">Zone 1</option>
                    <option value="zone-2">Zone 2</option>
                    <option value="zone-3">Zone 3</option>
                    <option value="zone-4">Zone 4</option>
                    <option value="zone-5">Zone 5</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    value={inviteForm.regionId}
                    onChange={(e) => setInviteForm({...inviteForm, regionId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Region</option>
                    <option value="region-1">Region 1</option>
                    <option value="region-2">Region 2</option>
                    <option value="region-3">Region 3</option>
                    <option value="region-4">Region 4</option>
                    <option value="region-5">Region 5</option>
                    <option value="region-6">Region 6</option>
                    <option value="region-7">Region 7</option>
                    <option value="region-8">Region 8</option>
                    <option value="region-9">Region 9</option>
                    <option value="region-10">Region 10</option>
                    <option value="region-11">Region 11</option>
                    <option value="region-12">Region 12</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserPlus className="mr-2 h-5 w-5 text-green-600" />
                Create User
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="User will be prompted to change on first login"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  required
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Role</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ZONE_OVERSEER">Zone Overseer</option>
                  <option value="ZONE_OVERSEER_ASSISTANT">Zone Overseer Assistant</option>
                  <option value="ZONE_OVERSEER_SUPPORT">Zone Overseer Support</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER">Construction Group Overseer</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER_ASSISTANT">Construction Group Overseer Assistant</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER_SUPPORT">Construction Group Overseer Support</option>
                  <option value="TRADE_TEAM_OVERSEER">Trade Team Overseer</option>
                  <option value="TRADE_TEAM_OVERSEER_ASSISTANT">Trade Team Overseer Assistant</option>
                  <option value="TRADE_TEAM_OVERSEER_SUPPORT">Trade Team Overseer Support</option>
                  <option value="TRADE_CREW_OVERSEER">Trade Crew Overseer</option>
                  <option value="TRADE_CREW_OVERSEER_ASSISTANT">Trade Crew Overseer Assistant</option>
                  <option value="TRADE_CREW_OVERSEER_SUPPORT">Trade Crew Overseer Support</option>
                  <option value="PERSONNEL_CONTACT">Personnel Contact</option>
                  <option value="PERSONNEL_CONTACT_ASSISTANT">Personnel Contact Assistant</option>
                  <option value="PERSONNEL_CONTACT_SUPPORT">Personnel Contact Support</option>
                  <option value="FIELD_REP">Field Rep</option>
                  <option value="FIELD_REP_ASSISTANT">Field Rep Assistant</option>
                  <option value="FIELD_REP_SUPPORT">Field Rep Support</option>
                  <option value="DESIGN_CONTACT">Design Contact</option>
                  <option value="DESIGN_CONTACT_ASSISTANT">Design Contact Assistant</option>
                  <option value="DESIGN_CONTACT_SUPPORT">Design Contact Support</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR">Project Construction Coordinator</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR_ASSISTANT">Project Construction Coordinator Assistant</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR_SUPPORT">Project Construction Coordinator Support</option>
                  <option value="SAFETY_COORDINATOR">Safety Coordinator</option>
                  <option value="SAFETY_COORDINATOR_ASSISTANT">Safety Coordinator Assistant</option>
                  <option value="SAFETY_COORDINATOR_SUPPORT">Safety Coordinator Support</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Level (Optional)
                </label>
                <select
                  value={createForm.adminLevel}
                  onChange={(e) => setCreateForm({...createForm, adminLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">No Admin Access</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="READ_ONLY_ADMIN">Read-Only Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Grant admin access in addition to their role</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone
                  </label>
                  <select
                    value={createForm.zoneId}
                    onChange={(e) => setCreateForm({...createForm, zoneId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Zone</option>
                    <option value="zone-1">Zone 1</option>
                    <option value="zone-2">Zone 2</option>
                    <option value="zone-3">Zone 3</option>
                    <option value="zone-4">Zone 4</option>
                    <option value="zone-5">Zone 5</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    value={createForm.regionId}
                    onChange={(e) => setCreateForm({...createForm, regionId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Region</option>
                    <option value="region-1">Region 1</option>
                    <option value="region-2">Region 2</option>
                    <option value="region-3">Region 3</option>
                    <option value="region-4">Region 4</option>
                    <option value="region-5">Region 5</option>
                    <option value="region-6">Region 6</option>
                    <option value="region-7">Region 7</option>
                    <option value="region-8">Region 8</option>
                    <option value="region-9">Region 9</option>
                    <option value="region-10">Region 10</option>
                    <option value="region-11">Region 11</option>
                    <option value="region-12">Region 12</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Upload className="mr-2 h-5 w-5 text-gray-600" />
                Bulk Import Users
              </h3>
              <button
                onClick={() => setIsBulkImportOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload CSV or Excel file
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      CSV, XLS, or XLSX up to 10MB
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBulkImport(file);
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Required Columns:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <strong>name</strong> - Full name of the user</li>
                  <li>• <strong>email</strong> - Email address (must be unique)</li>
                  <li>• <strong>role</strong> - User role (CFR, FR, DC, PCC, SC, etc.)</li>
                  <li>• <strong>regionId</strong> - Region identifier (optional)</li>
                  <li>• <strong>zoneId</strong> - Zone identifier (optional)</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Download template
                    const csvContent = "name,email,role,regionId,zoneId\nJohn Doe,john@example.com,CFR,region-1,zone-1";
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'user_import_template.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Download Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Edit className="mr-2 h-5 w-5 text-blue-600" />
                Edit User: {selectedUser.name}
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  defaultValue={selectedUser.role}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ZONE_OVERSEER">Zone Overseer</option>
                  <option value="ZONE_OVERSEER_ASSISTANT">Zone Overseer Assistant</option>
                  <option value="ZONE_OVERSEER_SUPPORT">Zone Overseer Support</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER">Construction Group Overseer</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER_ASSISTANT">Construction Group Overseer Assistant</option>
                  <option value="CONSTRUCTION_GROUP_OVERSEER_SUPPORT">Construction Group Overseer Support</option>
                  <option value="TRADE_TEAM_OVERSEER">Trade Team Overseer</option>
                  <option value="TRADE_TEAM_OVERSEER_ASSISTANT">Trade Team Overseer Assistant</option>
                  <option value="TRADE_TEAM_OVERSEER_SUPPORT">Trade Team Overseer Support</option>
                  <option value="TRADE_CREW_OVERSEER">Trade Crew Overseer</option>
                  <option value="TRADE_CREW_OVERSEER_ASSISTANT">Trade Crew Overseer Assistant</option>
                  <option value="TRADE_CREW_OVERSEER_SUPPORT">Trade Crew Overseer Support</option>
                  <option value="PERSONNEL_CONTACT">Personnel Contact</option>
                  <option value="PERSONNEL_CONTACT_ASSISTANT">Personnel Contact Assistant</option>
                  <option value="PERSONNEL_CONTACT_SUPPORT">Personnel Contact Support</option>
                  <option value="FIELD_REP">Field Rep</option>
                  <option value="FIELD_REP_ASSISTANT">Field Rep Assistant</option>
                  <option value="FIELD_REP_SUPPORT">Field Rep Support</option>
                  <option value="DESIGN_CONTACT">Design Contact</option>
                  <option value="DESIGN_CONTACT_ASSISTANT">Design Contact Assistant</option>
                  <option value="DESIGN_CONTACT_SUPPORT">Design Contact Support</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR">Project Construction Coordinator</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR_ASSISTANT">Project Construction Coordinator Assistant</option>
                  <option value="PROJECT_CONSTRUCTION_COORDINATOR_SUPPORT">Project Construction Coordinator Support</option>
                  <option value="SAFETY_COORDINATOR">Safety Coordinator</option>
                  <option value="SAFETY_COORDINATOR_ASSISTANT">Safety Coordinator Assistant</option>
                  <option value="SAFETY_COORDINATOR_SUPPORT">Safety Coordinator Support</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Level (Optional)
                </label>
                <select
                  defaultValue={selectedUser.adminLevel || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Admin Access</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="READ_ONLY_ADMIN">Read-Only Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Grant admin access in addition to their role</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  defaultValue={selectedUser.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INVITED">Invited</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
