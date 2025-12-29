'use client';

import { useState, useEffect } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';

interface Region {
  id: string;
  code: string;
  name: string;
  zoneId: string;
}

interface ConstructionGroup {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  regionId: string;
}

interface EditCGModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  constructionGroup: ConstructionGroup;
  regions: Region[];
}

export default function EditCGModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  constructionGroup,
  regions 
}: EditCGModalProps) {
  const [formData, setFormData] = useState({
    code: constructionGroup.code,
    name: constructionGroup.name,
    description: constructionGroup.description || '',
    regionId: constructionGroup.regionId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        code: constructionGroup.code,
        name: constructionGroup.name,
        description: constructionGroup.description || '',
        regionId: constructionGroup.regionId,
      });
      setError('');
    }
  }, [isOpen, constructionGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/admin/hierarchy/construction-groups/${constructionGroup.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update Construction Group');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Construction Group
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CG Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., 01.12"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: Zone.Region (e.g., 01.12)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CG Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Southeast Construction Group"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Optional description"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region *
            </label>
            <select
              value={formData.regionId}
              onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} ({region.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
