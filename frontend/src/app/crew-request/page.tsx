'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Send, CheckCircle, User, Mail, Users, Briefcase, ChevronDown } from 'lucide-react';

type RequestType = 'ADD_TO_CREW' | 'REMOVE_FROM_CREW' | 'ADD_TO_PROJECT_ROSTER' | 'ADD_TO_CREW_AND_PROJECT';

interface TradeTeam {
  id: string;
  name: string;
  crews: Crew[];
}

interface Crew {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface UserInfo {
  name: string;
  email: string;
  role?: string;
}

interface FormData {
  request_type: RequestType | '';
  volunteer_name: string;
  volunteer_ba_id: string;
  trade_team_id: string;
  crew_id: string;
  project_id: string;
  project_name: string;
  comments: string;
  override_requestor_name: string;
  override_requestor_email: string;
}

const initialFormData: FormData = {
  request_type: '',
  volunteer_name: '',
  volunteer_ba_id: '',
  trade_team_id: '',
  crew_id: '',
  project_id: '',
  project_name: '',
  comments: '',
  override_requestor_name: '',
  override_requestor_email: '',
};

export default function CrewRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check session
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        
        if (!sessionData?.user?.email) {
          router.push('/auth/signin?callbackUrl=/crew-request');
          return;
        }
        
        setUser({
          name: sessionData.user.name || sessionData.user.email,
          email: sessionData.user.email,
          role: sessionData.user.role
        });

        // Fetch trade teams and projects
        const [teamsRes, projectsRes] = await Promise.all([
          fetch('/api/v1/trade-teams?include_crews=true'),
          fetch('/api/v1/projects')
        ]);
        
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTradeTeams(teamsData);
        }
        
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleInputChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Reset crew when trade team changes
      if (field === 'trade_team_id') {
        updated.crew_id = '';
      }
      return updated;
    });
  }, []);

  const selectedTeam = tradeTeams.find(t => t.id === formData.trade_team_id);

  // Check if user can submit on behalf of others
  const canSubmitOnBehalfOf = user?.role && [
    'SUPER_ADMIN',
    'PERSONNEL_CONTACT',
    'PERSONNEL_CONTACT_ASSISTANT',
    'PERSONNEL_CONTACT_SUPPORT'
  ].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/crew-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: formData.request_type,
          volunteer_name: formData.volunteer_name,
          volunteer_ba_id: formData.volunteer_ba_id || null,
          trade_team_id: formData.trade_team_id || null,
          crew_id: formData.crew_id || null,
          crew_name: selectedTeam?.crews.find(c => c.id === formData.crew_id)?.name || null,
          project_id: formData.project_id || null,
          project_roster_name: formData.project_name || projects.find(p => p.id === formData.project_id)?.name || null,
          comments: formData.comments || null,
          override_requestor_name: formData.override_requestor_name || null,
          override_requestor_email: formData.override_requestor_email || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setFormData(initialFormData);
    setIsSubmitted(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your submission. The personnel team will review your request and process it as soon as possible.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You will receive an email notification at <strong>{user.email}</strong> when your request is completed.
          </p>
          <button
            onClick={handleNewRequest}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LDC Crew Update Form</h1>
          <p className="text-gray-600">
            Hello {user.name}! Please fill out this form to help us process your crew or roster requests.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please submit one form per volunteer.
          </p>
          <p className="text-blue-600 font-medium mt-4">Thank you for all your hard work!</p>
        </div>

        {/* Requestor Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="flex items-center">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Submitting as:</span>
            <span className="ml-2 font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex items-center mt-1">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-500">{user.email}</span>
          </div>
          {canSubmitOnBehalfOf && (
            <div className="mt-2 text-xs text-blue-600 font-medium">
              ✓ Personnel Contact Mode: You can submit on behalf of others below
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Type of Request */}
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Briefcase className="h-4 w-4 mr-2 text-green-600" />
              Type of Request <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-green-400 transition-colors">
                <input
                  type="radio"
                  name="request_type"
                  value="ADD_TO_CREW"
                  checked={formData.request_type === 'ADD_TO_CREW'}
                  onChange={handleInputChange('request_type')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                  required
                />
                <span className="ml-3 text-gray-700">1. Add Volunteer to Crew</span>
              </label>
              <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-green-400 transition-colors">
                <input
                  type="radio"
                  name="request_type"
                  value="REMOVE_FROM_CREW"
                  checked={formData.request_type === 'REMOVE_FROM_CREW'}
                  onChange={handleInputChange('request_type')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-3 text-gray-700">2. Remove Volunteer from Crew</span>
              </label>
              <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-green-400 transition-colors">
                <input
                  type="radio"
                  name="request_type"
                  value="ADD_TO_PROJECT_ROSTER"
                  checked={formData.request_type === 'ADD_TO_PROJECT_ROSTER'}
                  onChange={handleInputChange('request_type')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-3 text-gray-700">3. Add this Volunteer to Project Roster</span>
              </label>
              <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-green-400 transition-colors">
                <input
                  type="radio"
                  name="request_type"
                  value="ADD_TO_CREW_AND_PROJECT"
                  checked={formData.request_type === 'ADD_TO_CREW_AND_PROJECT'}
                  onChange={handleInputChange('request_type')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-3 text-gray-700">4. Add this Volunteer to Crew AND Project Roster</span>
              </label>
            </div>
          </div>

          {/* Submit on Behalf Of (Personnel Contact roles) */}
          {canSubmitOnBehalfOf && (
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-purple-900 mb-1">Submit on Behalf Of (Optional)</h3>
                <p className="text-xs text-purple-700">Leave blank to submit as yourself. Fill in to submit for someone else.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requestor Name
                  </label>
                  <input
                    type="text"
                    value={formData.override_requestor_name}
                    onChange={handleInputChange('override_requestor_name')}
                    placeholder="e.g., John Smith"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requestor Email
                  </label>
                  <input
                    type="email"
                    value={formData.override_requestor_email}
                    onChange={handleInputChange('override_requestor_email')}
                    placeholder="e.g., john.smith@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Notifications will be sent to this email</p>
                </div>
              </div>
            </div>
          )}

          {/* Volunteer Name */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              Volunteer Name <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.volunteer_name}
              onChange={handleInputChange('volunteer_name')}
              placeholder="Enter volunteer's full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Volunteer BA ID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volunteer BA ID (if known)
            </label>
            <input
              type="text"
              value={formData.volunteer_ba_id}
              onChange={handleInputChange('volunteer_ba_id')}
              placeholder="Enter BA ID if known"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Trade Team & Crew Selection - Two-step approach */}
          {(formData.request_type === 'ADD_TO_CREW' || formData.request_type === 'REMOVE_FROM_CREW' || formData.request_type === 'ADD_TO_CREW_AND_PROJECT') && (
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade Team <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.trade_team_id}
                    onChange={handleInputChange('trade_team_id')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="">Select a Trade Team</option>
                    {tradeTeams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {formData.trade_team_id && selectedTeam && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crew <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.crew_id}
                      onChange={handleInputChange('crew_id')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="">Select a Crew</option>
                      {selectedTeam.crews.map(crew => (
                        <option key={crew.id} value={crew.id}>{crew.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Selection */}
          {(formData.request_type === 'ADD_TO_PROJECT_ROSTER' || formData.request_type === 'ADD_TO_CREW_AND_PROJECT') && (
            <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project (from dropdown)
                </label>
                <div className="relative">
                  <select
                    value={formData.project_id}
                    onChange={handleInputChange('project_id')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none bg-white"
                  >
                    <option value="">Select a Project (optional)</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OR Enter Project Name
                </label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={handleInputChange('project_name')}
                  placeholder="Enter project name if not in dropdown"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Use this if the project is not in the dropdown above</p>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Questions or Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={handleInputChange('comments')}
              rows={4}
              placeholder="Any additional information..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Questions? Contact the Personnel Team.
        </p>
      </div>
    </div>
  );
}
