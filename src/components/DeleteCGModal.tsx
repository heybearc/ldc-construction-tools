'use client';

import { useState } from 'react';
import { X, AlertTriangle, Building2 } from 'lucide-react';

interface ConstructionGroup {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  regionId?: string;
  _count?: {
    users: number;
    volunteers?: number;
    crews?: number;
    tradeTeams: number;
    projects: number;
  };
}

interface DeleteCGModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  constructionGroup: ConstructionGroup;
}

export default function DeleteCGModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  constructionGroup 
}: DeleteCGModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/admin/hierarchy/construction-groups/${constructionGroup.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.details) {
          // Show detailed error for dependencies
          const deps = [];
          if (data.details.users > 0) deps.push(`${data.details.users} users`);
          if (data.details.volunteers > 0) deps.push(`${data.details.volunteers} volunteers`);
          if (data.details.tradeTeams > 0) deps.push(`${data.details.tradeTeams} trade teams`);
          if (data.details.projects > 0) deps.push(`${data.details.projects} projects`);
          
          throw new Error(`Cannot delete: This CG has ${deps.join(', ')}. Please reassign or remove them first.`);
        }
        throw new Error(data.error || 'Failed to delete Construction Group');
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

  const hasDependencies = constructionGroup._count && (
    constructionGroup._count.users > 0 ||
    (constructionGroup._count.volunteers || 0) > 0 ||
    (constructionGroup._count.crews || 0) > 0 ||
    constructionGroup._count.tradeTeams > 0 ||
    constructionGroup._count.projects > 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Delete Construction Group
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

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">{constructionGroup.name}</p>
                <p className="text-sm text-orange-700">Code: {constructionGroup.code}</p>
              </div>
            </div>
          </div>

          {hasDependencies ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900 mb-2">
                Cannot delete this Construction Group
              </p>
              <p className="text-sm text-red-700 mb-3">
                This CG has active dependencies that must be removed first:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                {constructionGroup._count && constructionGroup._count.users > 0 && (
                  <li>• {constructionGroup._count.users} users</li>
                )}
                {constructionGroup._count && (constructionGroup._count.volunteers || 0) > 0 && (
                  <li>• {constructionGroup._count.volunteers} volunteers</li>
                )}
                {constructionGroup._count && (constructionGroup._count.crews || 0) > 0 && (
                  <li>• {constructionGroup._count.crews} crews</li>
                )}
                {constructionGroup._count && constructionGroup._count.tradeTeams > 0 && (
                  <li>• {constructionGroup._count.tradeTeams} trade teams</li>
                )}
                {constructionGroup._count && constructionGroup._count.projects > 0 && (
                  <li>• {constructionGroup._count.projects} projects</li>
                )}
              </ul>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this Construction Group? This action will deactivate the CG and it will no longer appear in the system.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a soft delete. The CG will be marked as inactive but data will be preserved.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            {!hasDependencies && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete CG'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
