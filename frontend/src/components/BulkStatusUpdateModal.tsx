'use client';

import React, { useState } from 'react';
import { X, UserCheck, UserX, Shield, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface BulkStatusUpdateModalProps {
  selectedVolunteerIds: string[];
  volunteers: any[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type StatusAction = 'activate' | 'deactivate' | 'make-overseer' | 'remove-overseer' | 'make-assistant' | 'remove-assistant';

export default function BulkStatusUpdateModal({
  selectedVolunteerIds,
  volunteers,
  isOpen,
  onClose,
  onComplete,
}: BulkStatusUpdateModalProps) {
  const [selectedAction, setSelectedAction] = useState<StatusAction | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedVolunteers = volunteers.filter(v => selectedVolunteerIds.includes(v.id));

  const statusActions = [
    {
      id: 'activate' as StatusAction,
      label: 'Activate Volunteers',
      description: 'Mark selected volunteers as active',
      icon: UserCheck,
      color: 'green',
      updates: { is_active: true },
    },
    {
      id: 'deactivate' as StatusAction,
      label: 'Deactivate Volunteers',
      description: 'Mark selected volunteers as inactive',
      icon: UserX,
      color: 'red',
      updates: { is_active: false },
    },
    {
      id: 'make-overseer' as StatusAction,
      label: 'Make Overseers',
      description: 'Grant overseer status to selected volunteers',
      icon: Shield,
      color: 'blue',
      updates: { is_overseer: true },
    },
    {
      id: 'remove-overseer' as StatusAction,
      label: 'Remove Overseer Status',
      description: 'Remove overseer status from selected volunteers',
      icon: Shield,
      color: 'gray',
      updates: { is_overseer: false },
    },
    {
      id: 'make-assistant' as StatusAction,
      label: 'Make Assistants',
      description: 'Grant assistant status to selected volunteers',
      icon: Users,
      color: 'indigo',
      updates: { is_assistant: true },
    },
    {
      id: 'remove-assistant' as StatusAction,
      label: 'Remove Assistant Status',
      description: 'Remove assistant status from selected volunteers',
      icon: Users,
      color: 'gray',
      updates: { is_assistant: false },
    },
  ];

  const handleSubmit = async () => {
    if (!selectedAction) {
      setError('Please select an action');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const action = statusActions.find(a => a.id === selectedAction);
      if (!action) throw new Error('Invalid action');

      const payload = {
        volunteer_ids: selectedVolunteerIds,
        updates: action.updates,
      };

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
        onComplete();
        onClose();
        resetModal();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update volunteers');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedAction('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedActionData = statusActions.find(a => a.id === selectedAction);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <UserCheck className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Status Update
              </h2>
              <p className="text-sm text-gray-500">
                {selectedVolunteerIds.length} volunteer(s) selected
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Update Complete!</h3>
              <p className="text-gray-600">
                Successfully updated {selectedVolunteerIds.length} volunteer(s).
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Action</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose the status update to apply to all selected volunteers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {statusActions.map((action) => {
                  const Icon = action.icon;
                  const isSelected = selectedAction === action.id;
                  
                  return (
                    <button
                      key={action.id}
                      onClick={() => setSelectedAction(action.id)}
                      disabled={loading}
                      className={`p-4 border-2 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? `border-${action.color}-500 bg-${action.color}-50`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <Icon className={`h-6 w-6 mr-3 flex-shrink-0 ${
                          isSelected ? `text-${action.color}-600` : 'text-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{action.label}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedActionData && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
                  <p className="text-sm text-blue-800">
                    This will <strong>{selectedActionData.label.toLowerCase()}</strong> for the following volunteers:
                  </p>
                  <div className="mt-3 max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {selectedVolunteers.slice(0, 10).map((volunteer) => (
                        <span
                          key={volunteer.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {volunteer.first_name} {volunteer.last_name}
                        </span>
                      ))}
                      {selectedVolunteers.length > 10 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          +{selectedVolunteers.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedAction}
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
                <>
                  Apply Update
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
