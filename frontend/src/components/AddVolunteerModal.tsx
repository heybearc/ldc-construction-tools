'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Building2 } from 'lucide-react';
import { formatPhoneNumber, unformatPhoneNumber } from '@/lib/formatPhone';

interface TradeTeam {
  id: string;
  name: string;
}

interface Crew {
  id: string;
  name: string;
  tradeTeamId: string;
}

interface AddVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: any) => Promise<void>;
}

const SERVING_ROLES = ['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Publisher'];

const VOLUNTEER_ROLES = [
  'Trade Team Overseer',
  'Trade Team Overseer Assistant',
  'Trade Team Support',
  'Trade Crew Overseer',
  'Trade Crew Overseer Assistant',
  'Trade Crew Support',
  'Trade Crew Volunteer',
];

// Roles that are at the Trade Team level (don't need crew assignment)
const TRADE_TEAM_LEVEL_ROLES = [
  'Trade Team Overseer',
  'Trade Team Overseer Assistant',
  'Trade Team Support',
];

export default function AddVolunteerModal({ isOpen, onClose, onSave }: AddVolunteerModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    ba_id: '',
    role: 'Trade Crew Volunteer',
    phone: '',
    email_personal: '',
    email_jw: '',
    congregation: '',
    serving_as: [] as string[],
    trade_crew_id: null as string | null,
  });

  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if selected role is a Trade Team level role
  const isTradeTeamLevelRole = TRADE_TEAM_LEVEL_ROLES.includes(formData.role);

  useEffect(() => {
    if (isOpen) {
      fetchTradeTeams();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTeamId && !isTradeTeamLevelRole) {
      fetchCrews(selectedTeamId);
    } else {
      setCrews([]);
      setFormData(prev => ({ ...prev, trade_crew_id: null }));
    }
  }, [selectedTeamId, isTradeTeamLevelRole]);

  // Clear crew selection when switching to a Trade Team level role
  useEffect(() => {
    if (isTradeTeamLevelRole) {
      setFormData(prev => ({ ...prev, trade_crew_id: null }));
      setCrews([]);
    }
  }, [formData.role]);

  const fetchTradeTeams = async () => {
    try {
      const response = await fetch('/api/v1/trade-teams');
      if (response.ok) {
        const data = await response.json();
        setTradeTeams(data);
      }
    } catch (error) {
      console.error('Error fetching trade teams:', error);
    }
  };

  const fetchCrews = async (teamId: string) => {
    try {
      const response = await fetch(`/api/v1/trade-teams/${teamId}/crews`);
      if (response.ok) {
        const data = await response.json();
        setCrews(data);
      }
    } catch (error) {
      console.error('Error fetching crews:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      ba_id: '',
      role: 'Trade Crew Volunteer',
      phone: '',
      email_personal: '',
      email_jw: '',
      congregation: '',
      serving_as: [],
      trade_crew_id: null,
    });
    setSelectedTeamId('');
    setCrews([]);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServingAsChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      serving_as: prev.serving_as.includes(role)
        ? prev.serving_as.filter(r => r !== role)
        : [...prev.serving_as, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const volunteerData = {
        ...formData,
        is_overseer: formData.role.includes('Overseer') && !formData.role.includes('Assistant'),
        is_assistant: formData.role.includes('Assistant'),
      };

      await onSave(volunteerData);
      resetForm();
    } catch (err) {
      console.error('Error creating volunteer:', err);
      setError('Failed to create volunteer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Volunteer</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Builder Assistant ID
                </label>
                <input
                  type="text"
                  name="ba_id"
                  value={formData.ba_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Congregation
                </label>
                <input
                  type="text"
                  name="congregation"
                  value={formData.congregation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formatPhoneNumber(formData.phone)}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    handleInputChange({ target: { name: 'phone', value: unformatPhoneNumber(formatted) } } as any);
                  }}
                  placeholder="(555) 555-5555"
                  maxLength={14}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  JW.ORG Email
                </label>
                <input
                  type="email"
                  name="email_jw"
                  value={formData.email_jw}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Personal Email
              </label>
              <input
                type="email"
                name="email_personal"
                value={formData.email_personal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Role and Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Role and Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VOLUNTEER_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Team {isTradeTeamLevelRole && <span className="text-gray-500">(Oversees all crews)</span>}
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Trade Team</option>
                  {tradeTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Only show crew selection for crew-level roles */}
            {!isTradeTeamLevelRole && crews.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Crew
                </label>
                <select
                  value={formData.trade_crew_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, trade_crew_id: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Trade Crew (optional)</option>
                  {crews.map((crew) => (
                    <option key={crew.id} value={crew.id}>
                      {crew.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isTradeTeamLevelRole && selectedTeamId && (
              <p className="text-sm text-gray-500 italic">
                As a {formData.role}, this volunteer will oversee all crews under the selected Trade Team.
              </p>
            )}
          </div>

          {/* Serving As */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Serving As</h3>
            <div className="grid grid-cols-2 gap-3">
              {SERVING_ROLES.map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.serving_as.includes(role)}
                    onChange={() => handleServingAsChange(role)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.first_name || !formData.last_name}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Volunteer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
