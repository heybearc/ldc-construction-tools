'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Users, 
  FolderTree,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Globe,
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  AlertCircle
} from 'lucide-react';

interface Branch {
  id: string;
  code: string;
  name: string;
  description?: string;
}

interface Zone {
  id: string;
  code: string;
  name: string;
  branchId: string;
  branch?: Branch;
}

interface Region {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  zone?: Zone;
}

interface ConstructionGroup {
  id: string;
  code: string;
  name: string;
  regionId: string;
  region?: Region & { zone?: Zone & { branch?: Branch } };
  _count?: {
    users: number;
    tradeTeams: number;
    crews: number;
    projects: number;
  };
}

interface HierarchyData {
  branches: Branch[];
  zones: Zone[];
  regions: Region[];
  constructionGroups: ConstructionGroup[];
  scope?: {
    constructionGroupId: string | null;
    canViewAllBranches: boolean;
    canViewZoneRegions: boolean;
  };
}

type ModalType = 'region' | 'cg' | null;

export default function OrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HierarchyData | null>(null);
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  
  // Modal state for adding/editing
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [saving, setSaving] = useState(false);

  const canManage = data?.scope?.canViewAllBranches === true;

  const fetchHierarchy = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/admin/hierarchy');
      if (!response.ok) throw new Error('Failed to fetch hierarchy');
      const result = await response.json();
      setData(result);
      
      // Auto-expand zones with regions
      const zonesWithRegions = result.zones?.filter((z: Zone) => 
        result.regions?.some((r: Region) => r.zoneId === z.id)
      ).map((z: Zone) => z.id) || [];
      setExpandedZones(new Set(zonesWithRegions));
      
      // Auto-expand regions with CGs
      const regionsWithCGs = result.regions?.filter((r: Region) =>
        result.constructionGroups?.some((cg: ConstructionGroup) => cg.regionId === r.id)
      ).map((r: Region) => r.id) || [];
      setExpandedRegions(new Set(regionsWithCGs));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const toggleZone = (zoneId: string) => {
    setExpandedZones(prev => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  };

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(regionId)) {
        next.delete(regionId);
      } else {
        next.add(regionId);
      }
      return next;
    });
  };

  const openAddRegionModal = (zoneId: string) => {
    const zone = data?.zones.find(z => z.id === zoneId);
    setSelectedZoneId(zoneId);
    setFormData({ code: zone ? `${zone.code}.` : '', name: '' });
    setModalType('region');
    setModalMode('add');
  };

  const openAddCGModal = (regionId: string) => {
    const region = data?.regions.find(r => r.id === regionId);
    setSelectedRegionId(regionId);
    setFormData({ code: region ? `CG ${region.code}` : 'CG ', name: region ? `CG ${region.code}` : 'CG ' });
    setModalType('cg');
    setModalMode('add');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedZoneId(null);
    setSelectedRegionId(null);
    setFormData({ code: '', name: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = modalType === 'region' 
        ? '/api/v1/admin/hierarchy/regions'
        : '/api/v1/admin/hierarchy/construction-groups';
      
      const body = modalType === 'region'
        ? { code: formData.code, name: formData.name || `Region ${formData.code}`, zoneId: selectedZoneId }
        : { code: formData.code, name: formData.name, regionId: selectedRegionId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save');
      }

      closeModal();
      fetchHierarchy();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading organization hierarchy...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: {error}</p>
          <button 
            onClick={fetchHierarchy}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getZonesForBranch = (branchId: string) => 
    data?.zones.filter(z => z.branchId === branchId) || [];

  const getRegionsForZone = (zoneId: string) =>
    data?.regions.filter(r => r.zoneId === zoneId) || [];

  const getCGsForRegion = (regionId: string) =>
    data?.constructionGroups.filter(cg => cg.regionId === regionId) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-blue-600" />
            Organization Hierarchy
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage the Branch → Zone → Region → Construction Group structure
          </p>
        </div>
        <button
          onClick={fetchHierarchy}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Scope Info */}
      {data?.scope && (
        <div className={`border rounded-lg p-4 ${
          data.scope.canViewAllBranches 
            ? 'bg-purple-50 border-purple-200' 
            : data.scope.canViewZoneRegions 
              ? 'bg-blue-50 border-blue-200'
              : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${
              data.scope.canViewAllBranches ? 'text-purple-700' : 
              data.scope.canViewZoneRegions ? 'text-blue-700' : 'text-green-700'
            }`} />
            <span className="font-medium">Your Access Level:</span>
            {data.scope.canViewAllBranches ? (
              <>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                  Full Branch Access (SUPER_ADMIN)
                </span>
                <span className="text-sm text-purple-600 ml-2">
                  You can manage all hierarchy items
                </span>
              </>
            ) : data.scope.canViewZoneRegions ? (
              <>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  Zone Level Access
                </span>
                <span className="text-sm text-blue-600 ml-2">
                  View all regions in your zone
                </span>
              </>
            ) : (
              <>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  Construction Group Access
                </span>
                <span className="text-sm text-green-600 ml-2">
                  View your assigned CG only
                </span>
              </>
            )}
          </div>
          {!canManage && (
            <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Contact a SUPER_ADMIN to add or modify hierarchy items
            </p>
          )}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{data?.branches.length || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Branches</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{data?.zones.length || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Zones</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{data?.regions.length || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Regions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{data?.constructionGroups.length || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Construction Groups</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Organization Tree</h2>
        </div>
        <div className="p-4">
          {data?.branches.map(branch => (
            <div key={branch.id} className="mb-4">
              {/* Branch Level */}
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">{branch.name}</span>
                <span className="text-sm text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                  {branch.code}
                </span>
              </div>

              {/* Zones */}
              <div className="ml-6 mt-2 space-y-2">
                {getZonesForBranch(branch.id).map(zone => (
                  <div key={zone.id}>
                    {/* Zone Level */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleZone(zone.id)}
                        className="flex-1 flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {expandedZones.has(zone.id) ? (
                          <ChevronDown className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                        )}
                        <Layers className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">{zone.name}</span>
                        <span className="text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                          {zone.code}
                        </span>
                        <span className="ml-auto text-sm text-blue-600">
                          {getRegionsForZone(zone.id).length} regions
                        </span>
                      </button>
                      {canManage && (
                        <button
                          onClick={() => openAddRegionModal(zone.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Add Region"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Regions */}
                    {expandedZones.has(zone.id) && (
                      <div className="ml-6 mt-2 space-y-2">
                        {getRegionsForZone(zone.id).map(region => (
                          <div key={region.id}>
                            {/* Region Level */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRegion(region.id)}
                                className="flex-1 flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                              >
                                {expandedRegions.has(region.id) ? (
                                  <ChevronDown className="w-4 h-4 text-green-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-green-600" />
                                )}
                                <MapPin className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-green-900">{region.name}</span>
                                <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                  {region.code}
                                </span>
                                <span className="ml-auto text-sm text-green-600">
                                  {getCGsForRegion(region.id).length} CGs
                                </span>
                              </button>
                              {canManage && (
                                <button
                                  onClick={() => openAddCGModal(region.id)}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                                  title="Add Construction Group"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              )}
                            </div>

                            {/* Construction Groups */}
                            {expandedRegions.has(region.id) && (
                              <div className="ml-6 mt-2 space-y-2">
                                {getCGsForRegion(region.id).map(cg => (
                                  <Link
                                    key={cg.id}
                                    href={`/admin/organization/${cg.id}`}
                                    className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                  >
                                    <Building2 className="w-5 h-5 text-orange-600" />
                                    <span className="font-medium text-orange-900">{cg.name}</span>
                                    <span className="text-sm text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                                      {cg.code}
                                    </span>
                                    {cg._count && (
                                      <div className="ml-auto flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <Users className="w-4 h-4" />
                                          {cg._count.users}
                                        </span>
                                        <span>{cg._count.tradeTeams} teams</span>
                                        <span>{cg._count.projects} projects</span>
                                      </div>
                                    )}
                                  </Link>
                                ))}
                                {getCGsForRegion(region.id).length === 0 && (
                                  <p className="text-sm text-gray-500 italic p-3">
                                    No construction groups in this region
                                    {canManage && (
                                      <button
                                        onClick={() => openAddCGModal(region.id)}
                                        className="ml-2 text-orange-600 hover:underline"
                                      >
                                        Add one
                                      </button>
                                    )}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {getRegionsForZone(zone.id).length === 0 && (
                          <p className="text-sm text-gray-500 italic p-3">
                            No regions in this zone
                            {canManage && (
                              <button
                                onClick={() => openAddRegionModal(zone.id)}
                                className="ml-2 text-green-600 hover:underline"
                              >
                                Add one
                              </button>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {(!data?.branches || data.branches.length === 0) && (
            <p className="text-gray-500 text-center py-8">
              No organization hierarchy data found
            </p>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'add' ? 'Add' : 'Edit'} {modalType === 'region' ? 'Region' : 'Construction Group'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={modalType === 'region' ? '01.12' : 'CG 01.12'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {modalType === 'region' 
                    ? 'Format: ZZ.RR (e.g., 01.12 for Zone 1, Region 12)'
                    : 'Format: CG ZZ.RR (e.g., CG 01.12)'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={modalType === 'region' ? 'Region 01.12' : 'CG 01.12'}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.code}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
