'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Church, Plus, X, Edit, Trash2, Phone, Mail, User, MapPin } from 'lucide-react';

interface Congregation {
  id: string;
  name: string;
  state: string | null;
  congregation_number: string | null;
  coordinator_name: string | null;
  coordinator_phone: string | null;
  coordinator_email: string | null;
  congregation_email: string | null;
  is_active: boolean;
}

interface CongregationFormData {
  name: string;
  state: string;
  congregation_number: string;
  coordinator_name: string;
  coordinator_phone: string;
  coordinator_email: string;
  congregation_email: string;
}

const initialFormData: CongregationFormData = {
  name: '',
  state: '',
  congregation_number: '',
  coordinator_name: '',
  coordinator_phone: '',
  coordinator_email: '',
  congregation_email: '',
};

export default function CongregationsPage() {
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCongregation, setEditingCongregation] = useState<Congregation | null>(null);
  const [formData, setFormData] = useState<CongregationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCongregations();
  }, []);

  const fetchCongregations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/congregations');
      if (!response.ok) throw new Error('Failed to fetch congregations');
      const data = await response.json();
      setCongregations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load congregations');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCongregation(null);
    setFormData(initialFormData);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (congregation: Congregation) => {
    setEditingCongregation(congregation);
    setFormData({
      name: congregation.name,
      state: congregation.state || '',
      congregation_number: congregation.congregation_number || '',
      coordinator_name: congregation.coordinator_name || '',
      coordinator_phone: congregation.coordinator_phone || '',
      coordinator_email: congregation.coordinator_email || '',
      congregation_email: congregation.congregation_email || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCongregation(null);
    setFormError(null);
  };

  const handleInputChange = useCallback((field: keyof CongregationFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const url = editingCongregation
        ? `/api/v1/congregations/${editingCongregation.id}`
        : '/api/v1/congregations';
      
      const method = editingCongregation ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save congregation');
      }

      closeModal();
      fetchCongregations();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save congregation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (congregation: Congregation) => {
    if (!confirm(`Are you sure you want to delete "${congregation.name}"?`)) return;

    try {
      const response = await fetch(`/api/v1/congregations/${congregation.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete congregation');
      fetchCongregations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete congregation');
    }
  };

  const filteredCongregations = congregations.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.congregation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.coordinator_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Church className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Congregations</h1>
              <p className="text-gray-600">Manage supporting congregations for projects</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Congregation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <Church className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Congregations</p>
                <p className="text-3xl font-bold text-blue-700">{congregations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-6 border border-green-100">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">With Coordinators</p>
                <p className="text-3xl font-bold text-green-700">
                  {congregations.filter(c => c.coordinator_name).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-100">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-amber-500 mr-3" />
              <div>
                <p className="text-sm text-amber-600 font-medium">States</p>
                <p className="text-3xl font-bold text-amber-700">
                  {new Set(congregations.map(c => c.state).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search congregations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Congregation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCongregations.map((congregation) => (
                <tr key={congregation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Church className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{congregation.name}</div>
                        {congregation.congregation_number && (
                          <div className="text-sm text-gray-500">#{congregation.congregation_number}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {congregation.state || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{congregation.coordinator_name || '-'}</div>
                    {congregation.coordinator_phone && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {congregation.coordinator_phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {congregation.coordinator_email && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {congregation.coordinator_email}
                      </div>
                    )}
                    {congregation.congregation_email && (
                      <div className="text-sm text-blue-600 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {congregation.congregation_email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(congregation)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(congregation)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCongregations.length === 0 && (
            <div className="text-center py-12">
              <Church className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No congregations found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first congregation'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCongregation ? 'Edit Congregation' : 'Add Congregation'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Congregation Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Akron Spanish"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={handleInputChange('state')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Ohio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Congregation #</label>
                  <input
                    type="text"
                    value={formData.congregation_number}
                    onChange={handleInputChange('congregation_number')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 130682"
                  />
                </div>
              </div>

              <hr className="my-4" />
              <h4 className="text-md font-medium text-gray-800">Coordinator Information</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator Name</label>
                  <input
                    type="text"
                    value={formData.coordinator_name}
                    onChange={handleInputChange('coordinator_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Joel Aaron Stoy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator Phone</label>
                  <input
                    type="text"
                    value={formData.coordinator_phone}
                    onChange={handleInputChange('coordinator_phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., (330) 280-8261"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator Email (W/ Pub)</label>
                  <input
                    type="email"
                    value={formData.coordinator_email}
                    onChange={handleInputChange('coordinator_email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., coordinator@jw.org"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Congregation Email</label>
                  <input
                    type="email"
                    value={formData.congregation_email}
                    onChange={handleInputChange('congregation_email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., congregation@jw.org"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingCongregation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
