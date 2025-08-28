'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Users, Briefcase } from 'lucide-react';

interface Volunteer {
  id: number;
  first_name: string;
  last_name: string;
  ba_id?: string;
  role: string;
  phone?: string;
  email_personal?: string;
  email_jw?: string;
  congregation?: string;
  serving_as?: string[];
  is_overseer: boolean;
  is_assistant: boolean;
  is_active: boolean;
  trade_crew_name?: string;
  trade_team_name?: string;
}

interface EditVolunteerModalProps {
  volunteer: Volunteer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: Volunteer) => void;
}

export default function EditVolunteerModal({ volunteer, isOpen, onClose, onSave }: EditVolunteerModalProps) {
  const [formData, setFormData] = useState<Partial<Volunteer>>({});
  const [tradeTeams, setTradeTeams] = useState<any[]>([]);
  const [tradeCrews, setTradeCrews] = useState<any[]>([]);
  const [selectedTradeTeam, setSelectedTradeTeam] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (volunteer) {
      setFormData(volunteer);
      setSelectedTradeTeam(volunteer.trade_team_name || '');
      if (volunteer.trade_team_name) {
        fetchTradeCrews(volunteer.trade_team_name);
      }
    }
    fetchAvailableRoles();
    fetchTradeTeams();
  }, [volunteer]);

  const fetchAvailableRoles = async () => {
    try {
      const response = await fetch('/api/v1/volunteers/available-roles');
      if (response.ok) {
        const rolesData = await response.json();
        setAvailableRoles(rolesData.map((role: any) => role.name));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchTradeTeams = async () => {
    try {
      const response = await fetch('/api/v1/trade-teams');
      if (response.ok) {
        const teamsData = await response.json();
        setTradeTeams(teamsData);
      }
    } catch (error) {
      console.error('Error fetching trade teams:', error);
    }
  };

  const fetchTradeCrews = async (teamName: string) => {
    try {
      const response = await fetch(`/api/v1/trade-teams/${encodeURIComponent(teamName)}/crews`);
      if (response.ok) {
        const crewsData = await response.json();
        setTradeCrews(crewsData);
      }
    } catch (error) {
      console.error('Error fetching trade crews:', error);
      setTradeCrews([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update role flags based on role selection
      const updatedVolunteer = {
        ...formData,
        serving_as: formData.serving_as || [],
        is_overseer: formData.role?.includes('Overseer') && !formData.role?.includes('Assistant'),
        is_assistant: formData.role?.includes('Assistant'),
      };

      // Call API to update volunteer
      const response = await fetch(`/api/v1/volunteers/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedVolunteer),
      });

      if (response.ok) {
        const updatedVolunteer = await response.json();
        onSave(updatedVolunteer);
        onClose();
      } else {
        console.error('Failed to update volunteer');
      }
    } catch (error) {
      console.error('Error updating volunteer:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Volunteer, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServingAsChange = (role: string, checked: boolean) => {
    setFormData(prev => {
      const currentServingAs = prev.serving_as || [];
      if (checked) {
        return {
          ...prev,
          serving_as: [...currentServingAs, role]
        };
      } else {
        return {
          ...prev,
          serving_as: currentServingAs.filter(r => r !== role)
        };
      }
    });
  };

  if (!isOpen || !volunteer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="mr-2 h-5 w-5" />
            Edit Volunteer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BA ID#
              </label>
              <input
                type="text"
                value={formData.ba_id || ''}
                onChange={(e) => handleInputChange('ba_id', e.target.value)}
                placeholder="e.g. BA12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Role Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Briefcase className="mr-1 h-4 w-4" />
                Role *
              </label>
              <select
                required
                value={formData.role || ''}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a role...</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                Congregation
              </label>
              <select
                value={formData.congregation || ''}
                onChange={(e) => handleInputChange('congregation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Congregation</option>
                <option value="Central">Central</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          {/* Serving As */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Users className="mr-1 h-4 w-4" />
              Serving As
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Publisher'].map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`serving_as_${role}`}
                    checked={formData.serving_as?.includes(role) || false}
                    onChange={(e) => handleServingAsChange(role, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`serving_as_${role}`} className="ml-2 block text-sm text-gray-900">
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Phone className="mr-1 h-4 w-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="555-123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Mail className="mr-1 h-4 w-4" />
                Personal Email
              </label>
              <input
                type="email"
                value={formData.email_personal || ''}
                onChange={(e) => handleInputChange('email_personal', e.target.value)}
                placeholder="volunteer@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Mail className="mr-1 h-4 w-4" />
              JW.ORG Email
            </label>
            <input
              type="email"
              value={formData.email_jw || ''}
              onChange={(e) => handleInputChange('email_jw', e.target.value)}
              placeholder="volunteer@jw.org"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Assignment Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Trade Team & Crew Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Team
                </label>
                <select
                  value={selectedTradeTeam || formData.trade_team_name || ''}
                  onChange={(e) => {
                    setSelectedTradeTeam(e.target.value);
                    handleInputChange('trade_team_name', e.target.value);
                    // Reset trade crew when team changes
                    handleInputChange('trade_crew_name', '');
                    fetchTradeCrews(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Trade Team</option>
                  {tradeTeams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Crew
                </label>
                <select
                  value={formData.trade_crew_name || ''}
                  onChange={(e) => handleInputChange('trade_crew_name', e.target.value)}
                  disabled={!selectedTradeTeam && !formData.trade_team_name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Trade Crew</option>
                  {tradeCrews.map((crew) => (
                    <option key={crew.id} value={crew.name}>
                      {crew.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Note: Trade Team Overseers (TTO), Trade Team Overseer Assistants (TTOA), and Trade Team Support (TTS) roles do not require trade crew assignment as they oversee all crews in their trade team.
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active Volunteer
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
