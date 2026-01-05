'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface BulkReassignmentWizardProps {
  selectedVolunteerIds: string[];
  volunteers: any[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TradeTeam {
  id: string;
  name: string;
  description?: string;
}

interface Crew {
  id: string;
  name: string;
  tradeTeamId: string;
  capacity?: number;
  currentMembers?: number;
}

type WizardStep = 'select-team' | 'select-crew' | 'review' | 'complete';

export default function BulkReassignmentWizard({
  selectedVolunteerIds,
  volunteers,
  isOpen,
  onClose,
  onComplete,
}: BulkReassignmentWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('select-team');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedCrewId, setSelectedCrewId] = useState<string>('');
  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const selectedVolunteers = volunteers.filter(v => selectedVolunteerIds.includes(v.id));

  useEffect(() => {
    if (isOpen) {
      fetchTradeTeams();
      setCurrentStep('select-team');
      setSelectedTeamId('');
      setSelectedCrewId('');
      setError('');
      setWarnings([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTeamId) {
      fetchCrews(selectedTeamId);
    } else {
      setCrews([]);
    }
  }, [selectedTeamId]);

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

  const validateReassignment = () => {
    const newWarnings: string[] = [];

    // Check if volunteers are already assigned to this team/crew
    const alreadyAssigned = selectedVolunteers.filter(
      v => v.trade_team_id === selectedTeamId && (!selectedCrewId || v.trade_crew_id === selectedCrewId)
    );

    if (alreadyAssigned.length > 0) {
      newWarnings.push(
        `${alreadyAssigned.length} volunteer(s) are already assigned to this ${selectedCrewId ? 'crew' : 'team'}`
      );
    }

    // Check crew capacity if selected
    if (selectedCrewId) {
      const selectedCrew = crews.find(c => c.id === selectedCrewId);
      if (selectedCrew?.capacity) {
        const currentCount = selectedCrew.currentMembers || 0;
        const newCount = currentCount + selectedVolunteerIds.length;
        if (newCount > selectedCrew.capacity) {
          newWarnings.push(
            `This crew has capacity for ${selectedCrew.capacity} members. Adding ${selectedVolunteerIds.length} volunteers will exceed capacity (${newCount}/${selectedCrew.capacity})`
          );
        }
      }
    }

    // Check if volunteers are being moved from different teams
    const fromDifferentTeams = selectedVolunteers.filter(v => v.trade_team_id && v.trade_team_id !== selectedTeamId);
    if (fromDifferentTeams.length > 0) {
      newWarnings.push(
        `${fromDifferentTeams.length} volunteer(s) will be moved from their current team`
      );
    }

    setWarnings(newWarnings);
  };

  const handleNext = () => {
    if (currentStep === 'select-team') {
      if (!selectedTeamId) {
        setError('Please select a trade team');
        return;
      }
      setError('');
      setCurrentStep('select-crew');
    } else if (currentStep === 'select-crew') {
      validateReassignment();
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep === 'select-crew') {
      setCurrentStep('select-team');
      setSelectedCrewId('');
    } else if (currentStep === 'review') {
      setCurrentStep('select-crew');
    }
  };

  const handleSkipCrew = () => {
    setSelectedCrewId('');
    validateReassignment();
    setCurrentStep('review');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        volunteer_ids: selectedVolunteerIds,
        updates: {
          trade_team_id: selectedTeamId,
          crew_id: selectedCrewId || null,
        },
      };

      const response = await fetch('/api/v1/volunteers/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reassign volunteers');
      }

      setCurrentStep('complete');
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reassign volunteers');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedTeam = tradeTeams.find(t => t.id === selectedTeamId);
  const selectedCrew = crews.find(c => c.id === selectedCrewId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Reassignment Wizard
              </h2>
              <p className="text-sm text-gray-500">
                {selectedVolunteerIds.length} volunteer(s) selected
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${currentStep === 'select-team' ? 'text-blue-600' : currentStep === 'select-crew' || currentStep === 'review' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-team' ? 'bg-blue-100' : currentStep === 'select-crew' || currentStep === 'review' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {currentStep === 'select-crew' || currentStep === 'review' || currentStep === 'complete' ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Select Team</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'select-crew' ? 'text-blue-600' : currentStep === 'review' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-crew' ? 'bg-blue-100' : currentStep === 'review' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {currentStep === 'review' || currentStep === 'complete' ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Select Crew</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-blue-100' : currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {currentStep === 'complete' ? <CheckCircle className="h-5 w-5" /> : '3'}
              </div>
              <span className="ml-2 text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Select Trade Team */}
          {currentStep === 'select-team' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Trade Team</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose the trade team to assign all {selectedVolunteerIds.length} selected volunteers to.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tradeTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedTeamId === team.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{team.name}</h4>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Crew */}
          {currentStep === 'select-crew' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Crew (Optional)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a crew within <strong>{selectedTeam?.name}</strong>, or skip to assign only to the trade team.
                </p>
              </div>

              {crews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crews.map((crew) => (
                    <button
                      key={crew.id}
                      onClick={() => setSelectedCrewId(crew.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedCrewId === crew.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{crew.name}</h4>
                      {crew.capacity && (
                        <p className="text-sm text-gray-600 mt-1">
                          Capacity: {crew.currentMembers || 0}/{crew.capacity}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No crews available for this trade team.</p>
                  <p className="text-sm text-gray-500 mt-1">Click "Skip" to assign volunteers to the team only.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Review Assignment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please review the assignment details before confirming.
                </p>
              </div>

              {warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-yellow-700">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Trade Team:</span>
                  <p className="text-gray-900">{selectedTeam?.name}</p>
                </div>
                {selectedCrew && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Crew:</span>
                    <p className="text-gray-900">{selectedCrew.name}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-700">Volunteers to Assign:</span>
                  <p className="text-gray-900">{selectedVolunteerIds.length} volunteer(s)</p>
                </div>
              </div>

              <div className="border rounded-lg max-h-48 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Team</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedVolunteers.map((volunteer) => (
                      <tr key={volunteer.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {volunteer.first_name} {volunteer.last_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {volunteer.trade_team_name || 'None'}
                          {volunteer.trade_crew_name && ` - ${volunteer.trade_crew_name}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Complete!</h3>
              <p className="text-gray-600">
                Successfully assigned {selectedVolunteerIds.length} volunteer(s) to {selectedTeam?.name}
                {selectedCrew && ` - ${selectedCrew.name}`}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep !== 'complete' && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
            <button
              onClick={currentStep === 'select-team' ? onClose : handleBack}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 'select-team' ? 'Cancel' : 'Back'}
            </button>

            <div className="flex gap-2">
              {currentStep === 'select-crew' && (
                <button
                  onClick={handleSkipCrew}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip Crew
                </button>
              )}
              {currentStep === 'review' ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    <>
                      Confirm Assignment
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={loading || (currentStep === 'select-team' && !selectedTeamId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
