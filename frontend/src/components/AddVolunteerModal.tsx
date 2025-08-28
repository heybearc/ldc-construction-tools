'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Users } from 'lucide-react';

interface TradeTeam {
  id: number;
  name: string;
  trade_crews: TradeCrew[];
}

interface TradeCrew {
  id: number;
  name: string;
  trade_team_id: number;
}

interface AddVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: any) => void;
}

const SERVING_ROLES = ['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Publisher'];

export default function AddVolunteerModal({ isOpen, onClose, onSave }: AddVolunteerModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    ba_id: '',
    role: 'Trade Crew Support',
    phone: '',
    email_personal: '',
    email_jw: '',
    congregation: '',
    serving_as: [] as string[],
    trade_crew_id: null as number | null,
  });

  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [availableCrews, setAvailableCrews] = useState<TradeCrew[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTradeTeams();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTeamId) {
      const team = tradeTeams.find(t => t.id.toString() === selectedTeamId);
      if (team) {
        setAvailableCrews(team.trade_crews || []);
        // Set trade_crew_id to the first crew if available
        if (team.trade_crews && team.trade_crews.length > 0) {
          setFormData(prev => ({ ...prev, trade_crew_id: team.trade_crews[0].id }));
        }
      }
    } else {
      setAvailableCrews([]);
      setFormData(prev => ({ ...prev, trade_crew_id: null }));
    }
  }, [selectedTeamId, tradeTeams]);

  const fetchTradeTeams = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/trade-teams/');
      if (response.ok) {
        const data = await response.json();
        setTradeTeams(data);
      }
    } catch (error) {
      console.error('Error fetching trade teams:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        trade_crew_id: formData.trade_crew_id
      };

      const response = await fetch('http://localhost:8001/api/v1/volunteers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(volunteerData),
      });

      if (response.ok) {
        const newVolunteer = await response.json();
        onSave(newVolunteer);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create volunteer');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      ba_id: '',
      role: 'Trade Crew Support',
      phone: '',
      email_personal: '',
      email_jw: '',
      congregation: '',
      serving_as: [],
      trade_crew_id: null
    });
    setSelectedTeamId('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <User className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Volunteer</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BA ID#
                </label>
                <input
                  type="text"
                  name="ba_id"
                  value={formData.ba_id}
                  onChange={handleInputChange}
                  placeholder="e.g. BA12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
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
                  value={formData.phone}
                  onChange={handleInputChange}
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
                  <option value="Trade Team Overseer">Trade Team Overseer</option>
                  <option value="Trade Team Overseer Assistant">Trade Team Overseer Assistant</option>
                  <option value="Trade Team Support">Trade Team Support</option>
                  <option value="Trade Crew Overseer">Trade Crew Overseer</option>
                  <option value="Trade Crew Overseer Assistant">Trade Crew Overseer Assistant</option>
                  <option value="Trade Crew Support">Trade Crew Support</option>
                  <option value="Trade Crew Volunteer">Trade Crew Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Trade Team</option>
                  {tradeTeams.map((team) => (
                    <option key={team.id} value={team.id.toString()}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {availableCrews.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Crew
                </label>
                <select
                  value={formData.trade_crew_id?.toString() || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, trade_crew_id: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Trade Crew</option>
                  {availableCrews.map((crew) => (
                    <option key={crew.id} value={crew.id.toString()}>
                      {crew.name}
                    </option>
                  ))}
                </select>
              </div>
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
              disabled={loading}
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
