'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkEditModalProps {
  selectedVolunteerIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface BulkUpdateData {
  congregation?: string;
  is_overseer?: boolean;
  is_assistant?: boolean;
  is_active?: boolean;
  trade_team_id?: string;
  crew_id?: string;
  serving_as_add?: string[];
  serving_as_remove?: string[];
}

const SERVING_ROLES = ['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Publisher'];

export default function BulkEditModal({ selectedVolunteerIds, isOpen, onClose, onSave }: BulkEditModalProps) {
  const [updateData, setUpdateData] = useState<BulkUpdateData>({});
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tradeTeams, setTradeTeams] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchTradeTeams();
      setUpdateData({});
      setFieldsToUpdate(new Set());
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (updateData.trade_team_id) {
      fetchCrews(updateData.trade_team_id);
    } else {
      setCrews([]);
    }
  }, [updateData.trade_team_id]);

  const fetchTradeTeams = async () => {
    try {
      const response = await fetch('/api/v1/trade-teams');
      if (response.ok) {
        const data = await response.json();
        setTradeTeams(data.trade_teams || []);
      }
    } catch (err) {
      console.error('Error fetching trade teams:', err);
    }
  };

  const fetchCrews = async (tradeTeamId: string) => {
    try {
      const response = await fetch(`/api/v1/trade-teams/${tradeTeamId}/crews`);
      if (response.ok) {
        const data = await response.json();
        setCrews(data.crews || []);
      }
    } catch (err) {
      console.error('Error fetching crews:', err);
    }
  };

  const toggleField = (field: string) => {
    const newFields = new Set(fieldsToUpdate);
    if (newFields.has(field)) {
      newFields.delete(field);
      const newData = { ...updateData };
      delete newData[field as keyof BulkUpdateData];
      setUpdateData(newData);
    } else {
      newFields.add(field);
    }
    setFieldsToUpdate(newFields);
  };

  const handleServingAsToggle = (role: string, action: 'add' | 'remove') => {
    const field = action === 'add' ? 'serving_as_add' : 'serving_as_remove';
    const currentRoles = updateData[field] || [];
    
    if (currentRoles.includes(role)) {
      setUpdateData({
        ...updateData,
        [field]: currentRoles.filter(r => r !== role)
      });
    } else {
      setUpdateData({
        ...updateData,
        [field]: [...currentRoles, role]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fieldsToUpdate.size === 0) {
      setError('Please select at least one field to update');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        volunteer_ids: selectedVolunteerIds,
        updates: {}
      };

      fieldsToUpdate.forEach(field => {
        if (field === 'serving_as') {
          if (updateData.serving_as_add && updateData.serving_as_add.length > 0) {
            payload.updates.serving_as_add = updateData.serving_as_add;
          }
          if (updateData.serving_as_remove && updateData.serving_as_remove.length > 0) {
            payload.updates.serving_as_remove = updateData.serving_as_remove;
          }
        } else {
          payload.updates[field] = updateData[field as keyof BulkUpdateData];
        }
      });

      const response = await fetch('/api/v1/volunteers/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update volunteers');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update volunteers');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Bulk Edit Volunteers ({selectedVolunteerIds.length} selected)
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Successfully updated {selectedVolunteerIds.length} volunteers!</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only check the fields you want to update. Unchecked fields will remain unchanged for all selected volunteers.
            </p>
          </div>

          {/* Congregation */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={fieldsToUpdate.has('congregation')}
              onChange={() => toggleField('congregation')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Congregation
              </label>
              <input
                type="text"
                disabled={!fieldsToUpdate.has('congregation')}
                value={updateData.congregation || ''}
                onChange={(e) => setUpdateData({ ...updateData, congregation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter congregation name"
              />
            </div>
          </div>

          {/* Trade Team */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={fieldsToUpdate.has('trade_team_id')}
              onChange={() => toggleField('trade_team_id')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trade Team
              </label>
              <select
                disabled={!fieldsToUpdate.has('trade_team_id')}
                value={updateData.trade_team_id || ''}
                onChange={(e) => setUpdateData({ ...updateData, trade_team_id: e.target.value || undefined, crew_id: undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">No Trade Team</option>
                {tradeTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crew */}
          {updateData.trade_team_id && (
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('crew_id')}
                onChange={() => toggleField('crew_id')}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crew
                </label>
                <select
                  disabled={!fieldsToUpdate.has('crew_id')}
                  value={updateData.crew_id || ''}
                  onChange={(e) => setUpdateData({ ...updateData, crew_id: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">No Crew</option>
                  {crews.map((crew) => (
                    <option key={crew.id} value={crew.id}>
                      {crew.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Serving As */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={fieldsToUpdate.has('serving_as')}
              onChange={() => toggleField('serving_as')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serving As (Add/Remove Roles)
              </label>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Add these roles:</p>
                  <div className="flex flex-wrap gap-2">
                    {SERVING_ROLES.map((role) => (
                      <button
                        key={`add-${role}`}
                        type="button"
                        disabled={!fieldsToUpdate.has('serving_as')}
                        onClick={() => handleServingAsToggle(role, 'add')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          updateData.serving_as_add?.includes(role)
                            ? 'bg-green-100 text-green-800 border-2 border-green-500'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        + {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Remove these roles:</p>
                  <div className="flex flex-wrap gap-2">
                    {SERVING_ROLES.map((role) => (
                      <button
                        key={`remove-${role}`}
                        type="button"
                        disabled={!fieldsToUpdate.has('serving_as')}
                        onClick={() => handleServingAsToggle(role, 'remove')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          updateData.serving_as_remove?.includes(role)
                            ? 'bg-red-100 text-red-800 border-2 border-red-500'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        − {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Flags */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('is_overseer')}
                onChange={() => toggleField('is_overseer')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="flex-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overseer Status</span>
                {fieldsToUpdate.has('is_overseer') && (
                  <select
                    value={updateData.is_overseer === undefined ? '' : updateData.is_overseer.toString()}
                    onChange={(e) => setUpdateData({ ...updateData, is_overseer: e.target.value === 'true' })}
                    className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                )}
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('is_assistant')}
                onChange={() => toggleField('is_assistant')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="flex-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Assistant Status</span>
                {fieldsToUpdate.has('is_assistant') && (
                  <select
                    value={updateData.is_assistant === undefined ? '' : updateData.is_assistant.toString()}
                    onChange={(e) => setUpdateData({ ...updateData, is_assistant: e.target.value === 'true' })}
                    className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                )}
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('is_active')}
                onChange={() => toggleField('is_active')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="flex-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Active Status</span>
                {fieldsToUpdate.has('is_active') && (
                  <select
                    value={updateData.is_active === undefined ? '' : updateData.is_active.toString()}
                    onChange={(e) => setUpdateData({ ...updateData, is_active: e.target.value === 'true' })}
                    className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fieldsToUpdate.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                `Update ${selectedVolunteerIds.length} Volunteers`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
