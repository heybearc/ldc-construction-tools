'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Users, Phone, Mail, Building2, UserCheck, UserX, Edit, Plus, Upload, Download, FileText, Grid3x3, List, Link2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import EditVolunteerModal from '../../components/EditVolunteerModal';
import AddVolunteerModal from '../../components/AddVolunteerModal';
import BulkEditModal from '../../components/BulkEditModal';
import BulkReassignmentWizard from '../../components/BulkReassignmentWizard';
import BulkStatusUpdateModal from '../../components/BulkStatusUpdateModal';
import SavedSearchFilters from '../../components/SavedSearchFilters';
import { canManageVolunteers, canImportVolunteers, canExportVolunteers } from '@/lib/permissions';

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
  email_personal_verified?: boolean;
  email_jw_verified?: boolean;
  email_personal_bounced?: boolean;
  email_jw_bounced?: boolean;
  last_email_verified?: string | null;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
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
  const { data: session } = useSession();
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
  const [userOrgRoles, setUserOrgRoles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Quick filter states
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [servingAsFilter, setServingAsFilter] = useState<string>('');
  const [hasEmailFilter, setHasEmailFilter] = useState<string>('');
  const [hasPhoneFilter, setHasPhoneFilter] = useState<string>('');
  const [isAssignedFilter, setIsAssignedFilter] = useState<string>('');
  
  // Bulk selection states
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<Set<string>>(new Set());
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isReassignmentWizardOpen, setIsReassignmentWizardOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);

  // Fetch user's organizational roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!session?.user) return;
      try {
        const response = await fetch('/api/v1/user/roles');
        if (response.ok) {
          const data = await response.json();
          setUserOrgRoles(data.roles || []);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    };
    fetchUserRoles();
  }, [session]);

  // Permission checks
  const canManage = canManageVolunteers(session, userOrgRoles);
  const canImport = canImportVolunteers(session, userOrgRoles);
  const canExport = canExportVolunteers(session, userOrgRoles);

  useEffect(() => {
    fetchVolunteers();
    fetchStats();
  }, []);

  // Debounced search - only trigger API call after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVolunteers();
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, congregationFilter, statusFilter, servingAsFilter, hasEmailFilter, hasPhoneFilter, isAssignedFilter]);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (congregationFilter) params.append('congregation', congregationFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (servingAsFilter) params.append('servingAs', servingAsFilter);
      if (hasEmailFilter) params.append('hasEmail', hasEmailFilter);
      if (hasPhoneFilter) params.append('hasPhone', hasPhoneFilter);
      if (isAssignedFilter) params.append('isAssigned', isAssignedFilter);
      
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
    
    // Apply current filters to export
    if (searchTerm) params.append('search', searchTerm);
    if (roleFilter) params.append('role', roleFilter);
    if (congregationFilter) params.append('congregation', congregationFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (servingAsFilter) params.append('serving_as', servingAsFilter);
    if (hasEmailFilter) params.append('has_email', hasEmailFilter);
    if (hasPhoneFilter) params.append('has_phone', hasPhoneFilter);
    if (isAssignedFilter) params.append('is_assigned', isAssignedFilter);
    
    // Legacy export filters
    if (exportFilters.trade_team) params.append('trade_team', exportFilters.trade_team);
    if (exportFilters.trade_crew) params.append('trade_crew', exportFilters.trade_crew);
    
    window.location.href = `/api/v1/volunteers/export?${params.toString()}`;
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Volunteers List', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    
    // Add filter information
    let yPos = 28;
    const activeFilters: string[] = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (roleFilter) activeFilters.push(`Role: ${roleFilter}`);
    if (congregationFilter) activeFilters.push(`Congregation: ${congregationFilter}`);
    if (statusFilter && statusFilter !== 'active') activeFilters.push(`Status: ${statusFilter}`);
    if (servingAsFilter) activeFilters.push(`Serving As: ${servingAsFilter}`);
    if (hasEmailFilter) activeFilters.push(`Email: ${hasEmailFilter}`);
    if (hasPhoneFilter) activeFilters.push(`Phone: ${hasPhoneFilter}`);
    if (isAssignedFilter) activeFilters.push(`Assignment: ${isAssignedFilter}`);
    
    if (activeFilters.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Filters: ${activeFilters.join(' | ')}`, 105, yPos, { align: 'center' });
      yPos += 6;
    }
    
    doc.setTextColor(0);
    doc.text(`Total: ${filteredVolunteers.length} volunteers`, 105, yPos, { align: 'center' });
    yPos += 4;
    
    const tableData = filteredVolunteers.map(v => [
      `${v.first_name} ${v.last_name}`,
      v.ba_id || '—',
      v.congregation || '—',
      v.trade_team_name || '—',
      v.phone || '—',
      v.email_personal || v.email_jw || '—'
    ]);

    autoTable(doc, {
      startY: yPos + 2,
      head: [['Name', 'BA ID', 'Congregation', 'Trade Team', 'Phone', 'Email']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 10, right: 10 }
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

  const handleAddVolunteer = async (newVolunteer: any) => {
    try {
      // Just refresh the list - don't close the modal
      // The modal will handle its own closing after role assignment
      fetchVolunteers();
      fetchStats();
    } catch (error) {
      console.error('Error adding volunteer:', error);
    }
  };

  // Bulk selection handlers
  const toggleVolunteerSelection = (volunteerId: string) => {
    const newSelection = new Set(selectedVolunteerIds);
    if (newSelection.has(volunteerId)) {
      newSelection.delete(volunteerId);
    } else {
      newSelection.add(volunteerId);
    }
    setSelectedVolunteerIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedVolunteerIds.size === filteredVolunteers.length) {
      setSelectedVolunteerIds(new Set());
    } else {
      setSelectedVolunteerIds(new Set(filteredVolunteers.map(v => v.id)));
    }
  };

  const handleBulkEditComplete = () => {
    setSelectedVolunteerIds(new Set());
    setIsBulkEditModalOpen(false);
    fetchVolunteers();
    fetchStats();
  };

  const handleReassignmentComplete = () => {
    setSelectedVolunteerIds(new Set());
    setIsReassignmentWizardOpen(false);
    fetchVolunteers();
    fetchStats();
  };

  const handleBulkStatusComplete = () => {
    setSelectedVolunteerIds(new Set());
    setIsBulkStatusModalOpen(false);
    fetchVolunteers();
    fetchStats();
  };

  const handleApplySavedFilter = (filters: any) => {
    setSearchTerm(filters.searchTerm || '');
    setRoleFilter(filters.roleFilter || '');
    setCongregationFilter(filters.congregationFilter || '');
    setStatusFilter(filters.statusFilter || 'active');
    setServingAsFilter(filters.servingAsFilter || '');
    setHasEmailFilter(filters.hasEmailFilter || '');
    setHasPhoneFilter(filters.hasPhoneFilter || '');
    setIsAssignedFilter(filters.isAssignedFilter || '');
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Volunteers</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            {stats?.total_volunteers || 0} volunteers in your Construction Group
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          {canImport && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="inline-flex items-center px-3 py-2 min-h-[44px] border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{importing ? 'Importing...' : 'Import CSV'}</span>
              <span className="sm:hidden">{importing ? 'Importing...' : 'Import'}</span>
            </button>
          )}
          {canImport && (
            <a
              href="/templates/volunteers_import_template.csv"
              download
              className="inline-flex items-center px-3 py-2 min-h-[44px] border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Template</span>
            </a>
          )}
          {canExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center px-3 py-2 min-h-[44px] border border-green-300 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
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
          )}
          {canManage && (
            <>
              {selectedVolunteerIds.size > 0 && (
                <>
                  <button
                    onClick={() => setIsBulkStatusModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 min-h-[44px] bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Status ({selectedVolunteerIds.size})</span>
                    <span className="sm:hidden">Status</span>
                  </button>
                  <button
                    onClick={() => setIsReassignmentWizardOpen(true)}
                    className="inline-flex items-center px-4 py-2 min-h-[44px] bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Reassign ({selectedVolunteerIds.size})</span>
                    <span className="sm:hidden">Reassign</span>
                  </button>
                  <button
                    onClick={() => setIsBulkEditModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 min-h-[44px] bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Edit ({selectedVolunteerIds.size})</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Volunteer</span>
                <span className="sm:hidden">Add</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, BA ID, or congregation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
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
              className="flex-1 px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              <option value="">All Congregations</option>
              {stats?.congregation_breakdown.map((cong) => (
                <option key={cong.name} value={cong.name}>
                  {cong.name} ({cong.count})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div className="border-t pt-3 mt-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
              </div>
              <SavedSearchFilters
                currentFilters={{
                  searchTerm,
                  roleFilter,
                  congregationFilter,
                  statusFilter,
                  servingAsFilter,
                  hasEmailFilter,
                  hasPhoneFilter,
                  isAssignedFilter,
                }}
                onApplyFilter={handleApplySavedFilter}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'active' ? '' : 'active')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-green-100 text-green-800 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 inline mr-1" />
                Active Only
              </button>
              <button
                onClick={() => setStatusFilter(statusFilter === 'inactive' ? '' : 'inactive')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-red-100 text-red-800 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <UserX className="h-3.5 w-3.5 inline mr-1" />
                Inactive Only
              </button>

              {/* Email Filter */}
              <button
                onClick={() => setHasEmailFilter(hasEmailFilter === 'true' ? '' : 'true')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  hasEmailFilter === 'true'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mail className="h-3.5 w-3.5 inline mr-1" />
                Has Email
              </button>
              <button
                onClick={() => setHasEmailFilter(hasEmailFilter === 'false' ? '' : 'false')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  hasEmailFilter === 'false'
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mail className="h-3.5 w-3.5 inline mr-1" />
                Missing Email
              </button>

              {/* Phone Filter */}
              <button
                onClick={() => setHasPhoneFilter(hasPhoneFilter === 'true' ? '' : 'true')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  hasPhoneFilter === 'true'
                    ? 'bg-purple-100 text-purple-800 border-2 border-purple-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Phone className="h-3.5 w-3.5 inline mr-1" />
                Has Phone
              </button>
              <button
                onClick={() => setHasPhoneFilter(hasPhoneFilter === 'false' ? '' : 'false')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  hasPhoneFilter === 'false'
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Phone className="h-3.5 w-3.5 inline mr-1" />
                Missing Phone
              </button>

              {/* Assignment Filter */}
              <button
                onClick={() => setIsAssignedFilter(isAssignedFilter === 'true' ? '' : 'true')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isAssignedFilter === 'true'
                    ? 'bg-teal-100 text-teal-800 border-2 border-teal-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 inline mr-1" />
                Assigned to Crew
              </button>
              <button
                onClick={() => setIsAssignedFilter(isAssignedFilter === 'false' ? '' : 'false')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isAssignedFilter === 'false'
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 inline mr-1" />
                Unassigned
              </button>

              {/* Serving As Filter */}
              <select
                value={servingAsFilter}
                onChange={(e) => setServingAsFilter(e.target.value)}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
              >
                <option value="">All Serving As</option>
                <option value="Elder">Elders</option>
                <option value="Ministerial Servant">Ministerial Servants</option>
                <option value="Regular Pioneer">Regular Pioneers</option>
                <option value="Publisher">Publishers</option>
              </select>

              {/* Clear All Filters */}
              {(statusFilter || servingAsFilter || hasEmailFilter || hasPhoneFilter || isAssignedFilter || searchTerm || roleFilter || congregationFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter('active');
                    setServingAsFilter('');
                    setHasEmailFilter('');
                    setHasPhoneFilter('');
                    setIsAssignedFilter('');
                    setSearchTerm('');
                    setRoleFilter('');
                    setCongregationFilter('');
                  }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Selection Controls */}
      {canManage && filteredVolunteers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedVolunteerIds.size === filteredVolunteers.length && filteredVolunteers.length > 0}
              onChange={toggleSelectAll}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              Select All ({filteredVolunteers.length} volunteers)
            </span>
          </label>
          {selectedVolunteerIds.size > 0 && (
            <button
              onClick={() => setSelectedVolunteerIds(new Set())}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear Selection
            </button>
          )}
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolunteers.map((volunteer) => (
          <div key={volunteer.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 relative">
            {canManage && (
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedVolunteerIds.has(volunteer.id)}
                  onChange={() => toggleVolunteerSelection(volunteer.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center ml-8">
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
              {canManage && (
                <button
                  onClick={() => handleEditVolunteer(volunteer)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
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
              {volunteer.email_jw && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="flex-1">{volunteer.email_jw}</span>
                  {volunteer.email_jw_verified && (
                    <span className="ml-2 text-green-600" title="Email verified">✓</span>
                  )}
                  {volunteer.email_jw_bounced && (
                    <span className="ml-2 text-red-600" title="Email bounced">⚠</span>
                  )}
                </div>
              )}
              {volunteer.email_personal && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="flex-1">{volunteer.email_personal}</span>
                  {volunteer.email_personal_verified && (
                    <span className="ml-2 text-green-600" title="Email verified">✓</span>
                  )}
                  {volunteer.email_personal_bounced && (
                    <span className="ml-2 text-red-600" title="Email bounced">⚠</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                {volunteer.has_user_account && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title="Linked to user account">
                    <Link2 className="h-3 w-3 mr-1" />
                    User
                  </span>
                )}
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
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BA ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade Team/Crew</th>
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
                    {volunteer.trade_crew_name ? (
                      <div>
                        <div className="font-medium text-gray-900">{volunteer.trade_team_name}</div>
                        <div className="text-xs text-gray-500">{volunteer.trade_crew_name}</div>
                      </div>
                    ) : volunteer.trade_team_name ? (
                      <div className="font-medium text-gray-900">{volunteer.trade_team_name}</div>
                    ) : (
                      '—'
                    )}
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
                      {volunteer.email_jw && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {volunteer.email_jw}
                        </div>
                      )}
                      {volunteer.email_personal && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {volunteer.email_personal}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {volunteer.has_user_account && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title="Linked to user account">
                          <Link2 className="h-3 w-3 mr-1" />
                          User
                        </span>
                      )}
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

      <BulkEditModal
        selectedVolunteerIds={Array.from(selectedVolunteerIds)}
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onSave={handleBulkEditComplete}
      />

      <BulkReassignmentWizard
        selectedVolunteerIds={Array.from(selectedVolunteerIds)}
        volunteers={volunteers}
        isOpen={isReassignmentWizardOpen}
        onClose={() => setIsReassignmentWizardOpen(false)}
        onComplete={handleReassignmentComplete}
      />

      <BulkStatusUpdateModal
        selectedVolunteerIds={Array.from(selectedVolunteerIds)}
        volunteers={volunteers}
        isOpen={isBulkStatusModalOpen}
        onClose={() => setIsBulkStatusModalOpen(false)}
        onComplete={handleBulkStatusComplete}
      />
    </div>
  );
}
