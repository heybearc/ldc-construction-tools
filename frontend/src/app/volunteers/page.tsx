'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Users, Phone, Mail, Building2, UserCheck, UserX, Edit, Plus, Upload, Download, FileText, Grid3x3, List } from 'lucide-react';
import EditVolunteerModal from '../../components/EditVolunteerModal';
import AddVolunteerModal from '../../components/AddVolunteerModal';

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

interface Volunteer {
  id: string;
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
  trade_crew_id?: string;
  trade_crew_name?: string;
  trade_team_name?: string;
  has_user_account?: boolean;
  roles?: VolunteerRole[];
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
  const [importing, setImporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportFilters, setExportFilters] = useState({ trade_team: '', trade_crew: '', role: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVolunteers();
    fetchStats();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (congregationFilter) params.append('congregation', congregationFilter);
      
      const response = await fetch(`/api/v1/volunteers?${params}`);
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/volunteers/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
      
      const data = lines.slice(1).map(line => {
        const values = parseCSVLine(line).map(v => v.replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      const response = await fetch('/api/v1/volunteers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteers: data }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Successfully imported ${result.results.success} volunteers. Failed: ${result.results.failed}`);
        if (result.results.errors.length > 0) {
          console.error('Import errors:', result.results.errors);
        }
        fetchVolunteers();
        fetchStats();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
      console.error('Import error:', error);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = (format: string) => {
    const params = new URLSearchParams({ format });
    if (exportFilters.trade_team) params.append('trade_team', exportFilters.trade_team);
    if (exportFilters.trade_crew) params.append('trade_crew', exportFilters.trade_crew);
    if (exportFilters.role) params.append('role', exportFilters.role);
    
    window.location.href = `/api/v1/volunteers/export?${params.toString()}`;
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Volunteers List', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    
    const tableData = filteredVolunteers.map(v => [
      `${v.first_name} ${v.last_name}`,
      v.ba_id || '—',
      v.congregation || '—',
      v.role || '—',
      v.phone || '—',
      v.email || '—'
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['Name', 'BA ID', 'Congregation', 'Role', 'Phone', 'Email']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 10, right: 10, top: 28 }
    });

    doc.save(`volunteers-${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = !searchTerm || 
      `${volunteer.first_name} ${volunteer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.ba_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.congregation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || volunteer.role === roleFilter;
    const matchesCongregation = !congregationFilter || volunteer.congregation === congregationFilter;
    
    return matchesSearch && matchesRole && matchesCongregation;
  });

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsEditModalOpen(true);
  };

  const handleSaveVolunteer = async (updatedVolunteer: Volunteer) => {
    try {
      const response = await fetch(`/api/v1/volunteers/${updatedVolunteer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVolunteer),
      });
      if (response.ok) {
        fetchVolunteers();
        fetchStats();
        setIsEditModalOpen(false);
        setSelectedVolunteer(null);
      }
    } catch (error) {
      console.error('Error saving volunteer:', error);
    }
  };

  const handleAddVolunteer = async (newVolunteer: any): Promise<void> => {
    try {
      const response = await fetch('/api/v1/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVolunteer),
      });
      if (response.ok) {
        fetchVolunteers();
        fetchStats();
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding volunteer:', error);
    }
  };

  const getRoleIcon = (volunteer: Volunteer) => {
    if (volunteer.is_overseer) {
      return <UserCheck className="h-8 w-8 text-green-600" />;
    } else if (volunteer.is_assistant) {
      return <UserCheck className="h-8 w-8 text-blue-600" />;
    }
    return <Users className="h-8 w-8 text-gray-400" />;
  };

  const getRoleColors = (category: string): string => {
    const colors: Record<string, string> = {
      'CG_OVERSIGHT': 'bg-purple-100 text-purple-800',
      'CG_STAFF': 'bg-blue-100 text-blue-800',
      'REGION_SUPPORT_SERVICES': 'bg-cyan-100 text-cyan-800',
      'TRADE_TEAM': 'bg-green-100 text-green-800',
      'TRADE_CREW': 'bg-amber-100 text-amber-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volunteers</h1>
          <p className="mt-1 text-gray-600">
            {stats?.total_volunteers || 0} volunteers in your Construction Group
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <a
            href="/templates/volunteers_import_template.csv"
            download
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Template
          </a>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center px-3 py-2 border border-green-300 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Export Options</h3>
                </div>
                <div className="p-3 border-b border-gray-200 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Role</label>
                    <select
                      value={exportFilters.role}
                      onChange={(e) => setExportFilters({ ...exportFilters, role: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="">All Roles</option>
                      <option value="VOLUNTEER">Volunteer</option>
                      <option value="TRADE_TEAM_OVERSEER">Trade Team Overseer</option>
                      <option value="TRADE_CREW_OVERSEER">Trade Crew Overseer</option>
                    </select>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2 text-green-600" />
                    Export to Excel
                  </button>
                </div>
                  <button
                    onClick={exportToPDF}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2 text-red-600" />
                    Export to PDF
                  </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Volunteer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, BA ID, or congregation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {stats?.role_breakdown.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name} ({role.count})
                </option>
              ))}
            </select>
            <select
              value={congregationFilter}
              onChange={(e) => setCongregationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Congregations</option>
              {stats?.congregation_breakdown.map((cong) => (
                <option key={cong.name} value={cong.name}>
                  {cong.name} ({cong.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolunteers.map((volunteer) => (
          <div key={volunteer.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getRoleIcon(volunteer)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {volunteer.first_name} {volunteer.last_name}
                  </h3>
                  {volunteer.ba_id && (
                    <p className="text-sm text-gray-500">BA ID: {volunteer.ba_id}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEditVolunteer(volunteer)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {/* Organizational Roles */}
              {volunteer.roles && volunteer.roles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {volunteer.roles.slice(0, 3).map((role) => (
                    <span
                      key={role.id}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleColors(role.roleCategory)}`}
                    >
                      {role.roleCode}
                      {role.isPrimary && <span className="ml-1">★</span>}
                    </span>
                  ))}
                  {volunteer.roles.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      +{volunteer.roles.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              {volunteer.trade_team_name && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  {volunteer.trade_team_name}
                  {volunteer.trade_crew_name && ` - ${volunteer.trade_crew_name}`}
                </div>
              )}
              {volunteer.congregation && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  {volunteer.congregation}
                </div>
              )}
              {volunteer.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {volunteer.phone}
                </div>
              )}
              {(volunteer.email_personal || volunteer.email_jw) && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {volunteer.email_jw || volunteer.email_personal}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                {volunteer.is_overseer && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Overseer
                  </span>
                )}
                {volunteer.is_assistant && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Assistant
                  </span>
                )}
              </div>
              {volunteer.is_active ? (
                <UserCheck className="h-5 w-5 text-green-600" />
              ) : (
                <UserX className="h-5 w-5 text-red-600" />
              )}
            </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BA ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Congregation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(volunteer)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {volunteer.first_name} {volunteer.last_name}
                        </div>
                        {volunteer.trade_team_name && (
                          <div className="text-sm text-gray-500">
                            {volunteer.trade_team_name}
                            {volunteer.trade_crew_name && ` - ${volunteer.trade_crew_name}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {volunteer.ba_id || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {volunteer.roles && volunteer.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {volunteer.roles.slice(0, 2).map((role) => (
                            <span
                              key={role.id}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRoleColors(role.roleCategory)}`}
                            >
                              {role.roleCode}
                              {role.isPrimary && <span className="ml-0.5">★</span>}
                            </span>
                          ))}
                          {volunteer.roles.length > 2 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              +{volunteer.roles.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {volunteer.congregation || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      {volunteer.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {volunteer.phone}
                        </div>
                      )}
                      {(volunteer.email_personal || volunteer.email_jw) && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {volunteer.email_jw || volunteer.email_personal}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {volunteer.is_overseer && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Overseer
                        </span>
                      )}
                      {volunteer.is_assistant && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Assistant
                        </span>
                      )}
                      {volunteer.is_active ? (
                        <UserCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <UserX className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditVolunteer(volunteer)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredVolunteers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      <EditVolunteerModal
        volunteer={selectedVolunteer}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVolunteer(null);
        }}
        onSave={handleSaveVolunteer}
      />

      {isAddModalOpen && (
        <AddVolunteerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddVolunteer}
        />
      )}
    </div>
  );
}
