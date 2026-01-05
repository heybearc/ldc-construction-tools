'use client';

import React, { useState, useEffect } from 'react';
import { Save, Star, Trash2, X } from 'lucide-react';

interface SavedFilter {
  id: string;
  name: string;
  filters: {
    searchTerm?: string;
    roleFilter?: string;
    congregationFilter?: string;
    statusFilter?: string;
    servingAsFilter?: string;
    hasEmailFilter?: string;
    hasPhoneFilter?: string;
    isAssignedFilter?: string;
  };
  createdAt: string;
}

interface SavedSearchFiltersProps {
  currentFilters: {
    searchTerm: string;
    roleFilter: string;
    congregationFilter: string;
    statusFilter: string;
    servingAsFilter: string;
    hasEmailFilter: string;
    hasPhoneFilter: string;
    isAssignedFilter: string;
  };
  onApplyFilter: (filters: any) => void;
}

export default function SavedSearchFilters({ currentFilters, onApplyFilter }: SavedSearchFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = () => {
    const saved = localStorage.getItem('volunteer_saved_filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: { ...currentFilters },
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('volunteer_saved_filters', JSON.stringify(updated));
    
    setFilterName('');
    setShowSaveModal(false);
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('volunteer_saved_filters', JSON.stringify(updated));
  };

  const applyFilter = (filter: SavedFilter) => {
    onApplyFilter(filter.filters);
    setShowFilters(false);
  };

  const hasActiveFilters = () => {
    return currentFilters.searchTerm ||
           currentFilters.roleFilter ||
           currentFilters.congregationFilter ||
           (currentFilters.statusFilter && currentFilters.statusFilter !== 'active') ||
           currentFilters.servingAsFilter ||
           currentFilters.hasEmailFilter ||
           currentFilters.hasPhoneFilter ||
           currentFilters.isAssignedFilter;
  };

  const getFilterDescription = (filter: SavedFilter) => {
    const parts: string[] = [];
    if (filter.filters.searchTerm) parts.push(`Search: "${filter.filters.searchTerm}"`);
    if (filter.filters.roleFilter) parts.push(`Role: ${filter.filters.roleFilter}`);
    if (filter.filters.congregationFilter) parts.push(`Cong: ${filter.filters.congregationFilter}`);
    if (filter.filters.statusFilter) parts.push(`Status: ${filter.filters.statusFilter}`);
    if (filter.filters.servingAsFilter) parts.push(`Serving: ${filter.filters.servingAsFilter}`);
    if (filter.filters.hasEmailFilter) parts.push(`Email: ${filter.filters.hasEmailFilter}`);
    if (filter.filters.hasPhoneFilter) parts.push(`Phone: ${filter.filters.hasPhoneFilter}`);
    if (filter.filters.isAssignedFilter) parts.push(`Assigned: ${filter.filters.isAssignedFilter}`);
    return parts.join(' • ');
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {hasActiveFilters() && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            title="Save current filters"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Filter
          </button>
        )}
        
        {savedFilters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Star className="h-4 w-4 mr-2" />
            Saved Filters ({savedFilters.length})
          </button>
        )}
      </div>

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save Filter</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Name
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveCurrentFilter()}
                placeholder="e.g., Active Electricians"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Current Filters:</p>
              <p className="text-xs text-gray-600">{getFilterDescription({ id: '', name: '', filters: currentFilters, createdAt: '' })}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentFilter}
                disabled={!filterName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Filters Dropdown */}
      {showFilters && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-96 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">Saved Filters</h4>
          </div>
          
          {savedFilters.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No saved filters yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {savedFilters.map((filter) => (
                <div key={filter.id} className="p-3 hover:bg-gray-50 group">
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => applyFilter(filter)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center mb-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{filter.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {getFilterDescription(filter)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Saved {new Date(filter.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                    <button
                      onClick={() => deleteFilter(filter.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete filter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showFilters && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
