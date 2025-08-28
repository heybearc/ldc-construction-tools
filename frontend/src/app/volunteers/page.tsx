'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Phone, Mail, MapPin, UserCheck, UserX, Edit, Plus } from 'lucide-react';
import EditVolunteerModal from '../../components/EditVolunteerModal';
import AddVolunteerModal from '../../components/AddVolunteerModal';

interface Volunteer {
  id: number;
  first_name: string;
  last_name: string;
  ba_id?: string;
  role: string;
  phone?: string;
  email_personal?: string;
  email_jw?: string;
  congregation?: string;
  serving_as?: string[];
  is_overseer: boolean;
  is_assistant: boolean;
  is_active: boolean;
  trade_crew_name?: string;
  trade_team_name?: string;
}

interface VolunteerStats {
  total_volunteers: number;
  role_breakdown: { name: string; count: number }[];
  congregation_breakdown: { name: string; count: number }[];
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [congregationFilter, setCongregationFilter] = useState<string>('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchVolunteers();
    fetchStats();
    fetchAvailableRoles();
  }, [searchTerm, roleFilter, congregationFilter]);

  const fetchAvailableRoles = async () => {
    try {
      const response = await fetch('/api/v1/volunteers/available-roles');
      if (response.ok) {
        const rolesData = await response.json();
        setAvailableRoles(rolesData.map((role: any) => role.name));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (congregationFilter) params.append('congregation', congregationFilter);
      
      const response = await fetch(`/api/v1/volunteers/?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data);
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter volunteers on the frontend as well for immediate response
  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = !searchTerm || 
      `${volunteer.first_name} ${volunteer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.ba_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.congregation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || volunteer.role === roleFilter;
    const matchesCongregation = !congregationFilter || volunteer.congregation === congregationFilter;
    
    return matchesSearch && matchesRole && matchesCongregation;
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/volunteers/stats/summary');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsEditModalOpen(true);
  };

  const handleSaveVolunteer = (updatedVolunteer: Volunteer) => {
    setVolunteers(prev => 
      prev.map(v => v.id === updatedVolunteer.id ? updatedVolunteer : v)
    );
    fetchStats(); // Refresh stats
  };

  const handleAddVolunteer = (newVolunteer: Volunteer) => {
    setVolunteers(prev => [...prev, newVolunteer]);
    fetchStats(); // Refresh stats
    setIsAddModalOpen(false);
  };

  const getRoleIcon = (volunteer: Volunteer) => {
    if (volunteer.is_overseer) return <UserCheck className="h-4 w-4 text-blue-600" />;
    if (volunteer.is_assistant) return <UserX className="h-4 w-4 text-green-600" />;
    return <Users className="h-4 w-4 text-gray-600" />;
  };

  const getRoleBadge = (volunteer: Volunteer) => {
    const role = volunteer.role;
    const colorMap: { [key: string]: string } = {
      'Trade Team Overseer': 'bg-purple-100 text-purple-800',
      'Trade Team Overseer Assistant': 'bg-purple-50 text-purple-700',
      'Trade Team Support': 'bg-purple-50 text-purple-600',
      'Trade Crew Overseer': 'bg-blue-100 text-blue-800',
      'Trade Crew Overseer Assistant': 'bg-blue-50 text-blue-700',
      'Trade Crew Support': 'bg-blue-50 text-blue-600',
      'Trade Crew Volunteer': 'bg-gray-100 text-gray-800'
    };
    
    const colorClass = colorMap[role] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>{role}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
                <p className="text-sm text-gray-600">Personnel directory and volunteer information</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Volunteer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setRoleFilter('')}
            >
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_volunteers}</p>
                </div>
              </div>
            </div>
            {stats.role_breakdown?.map((role: any, index: number) => (
              <div 
                key={role.name}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setRoleFilter(role.name)}
              >
                <div className="flex items-center">
                  <UserCheck className={`h-8 w-8 ${
                    role.name.includes('Team Overseer') ? 'text-purple-600' :
                    role.name.includes('Crew Overseer') ? 'text-blue-600' :
                    role.name.includes('Assistant') ? 'text-green-600' :
                    'text-gray-600'
                  }`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{role.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{role.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {stats?.role_breakdown?.map((role: any) => (
                  <option key={role.name} value={role.name}>
                    {role.name} ({role.count})
                  </option>
                )) || []}
              </select>
              <select
                value={congregationFilter}
                onChange={(e) => setCongregationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Congregations</option>
                {stats?.congregation_breakdown?.map((cong: any) => (
                  <option key={cong.name} value={cong.name}>
                    {cong.name} ({cong.count})
                  </option>
                )) || []}
              </select>
            </div>
          </div>
        </div>

        {/* Volunteers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Volunteer Directory</h2>
            <p className="text-sm text-gray-600">{filteredVolunteers?.length || 0} volunteers found</p>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredVolunteers?.map((volunteer) => (
              <div key={volunteer.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getRoleIcon(volunteer)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {volunteer.first_name} {volunteer.last_name}
                        </h3>
                        {getRoleBadge(volunteer)}
                      </div>
                      
                      {/* Assignment Info */}
                      {volunteer.trade_team_name && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">{volunteer.trade_team_name}</span>
                          {volunteer.trade_crew_name && (
                            <span> • {volunteer.trade_crew_name}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Serving As */}
                      {volunteer.serving_as && volunteer.serving_as.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {volunteer.serving_as.map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Contact Info */}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        {volunteer.ba_id && (
                          <div className="flex items-center">
                            <span className="font-medium text-blue-600">BA ID#:</span>
                            <span className="ml-1">{volunteer.ba_id}</span>
                          </div>
                        )}
                        {volunteer.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {volunteer.phone}
                          </div>
                        )}
                        {volunteer.email_personal && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {volunteer.email_personal}
                          </div>
                        )}
                        {volunteer.congregation && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {volunteer.congregation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleEditVolunteer(volunteer)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {(volunteers?.length || 0) === 0 && (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditVolunteerModal
        volunteer={selectedVolunteer}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVolunteer(null);
        }}
        onSave={handleSaveVolunteer}
      />

      {/* Add Volunteer Modal */}
      <AddVolunteerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddVolunteer}
      />
    </div>
  );
}
