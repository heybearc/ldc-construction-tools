'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  FolderTree,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Globe,
  Layers
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

export default function OrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HierarchyData | null>(null);
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const fetchHierarchy = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/admin/hierarchy');
      if (!response.ok) throw new Error('Failed to fetch hierarchy');
      const result = await response.json();
      setData(result);
      
      // Auto-expand first zone if only one
      if (result.zones?.length === 1) {
        setExpandedZones(new Set([result.zones[0].id]));
      }
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Globe className="w-5 h-5" />
            <span className="font-medium">Your Access Level:</span>
            {data.scope.canViewAllBranches ? (
              <span className="bg-blue-100 px-2 py-1 rounded text-sm">Full Branch Access</span>
            ) : data.scope.canViewZoneRegions ? (
              <span className="bg-blue-100 px-2 py-1 rounded text-sm">Zone Level Access</span>
            ) : (
              <span className="bg-blue-100 px-2 py-1 rounded text-sm">Construction Group Access</span>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.branches.length || 0}</p>
              <p className="text-sm text-gray-500">Branches</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.zones.length || 0}</p>
              <p className="text-sm text-gray-500">Zones</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.regions.length || 0}</p>
              <p className="text-sm text-gray-500">Regions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.constructionGroups.length || 0}</p>
              <p className="text-sm text-gray-500">Construction Groups</p>
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
                    <button
                      onClick={() => toggleZone(zone.id)}
                      className="w-full flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
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

                    {/* Regions */}
                    {expandedZones.has(zone.id) && (
                      <div className="ml-6 mt-2 space-y-2">
                        {getRegionsForZone(zone.id).map(region => (
                          <div key={region.id}>
                            {/* Region Level */}
                            <button
                              onClick={() => toggleRegion(region.id)}
                              className="w-full flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
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

                            {/* Construction Groups */}
                            {expandedRegions.has(region.id) && (
                              <div className="ml-6 mt-2 space-y-2">
                                {getCGsForRegion(region.id).map(cg => (
                                  <div
                                    key={cg.id}
                                    className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg"
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
                                  </div>
                                ))}
                                {getCGsForRegion(region.id).length === 0 && (
                                  <p className="text-sm text-gray-500 italic p-3">
                                    No construction groups in this region
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {getRegionsForZone(zone.id).length === 0 && (
                          <p className="text-sm text-gray-500 italic p-3">
                            No regions in this zone
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
    </div>
  );
}
