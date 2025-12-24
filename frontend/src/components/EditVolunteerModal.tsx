'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Building2, Trash2, Link2 } from 'lucide-react';
import VolunteerRoleAssignment from './VolunteerRoleAssignment';
import { formatPhoneNumber, unformatPhoneNumber } from '@/lib/formatPhone';

interface VolunteerRole {
  id: string;
  roleCategory: string;
  roleName: string;
  roleCode: string;
  entityId?: string | null;
  entityType?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
}

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  ba_id?: string | null;
  role: string;
  phone?: string | null;
  email_personal?: string | null;
  email_jw?: string | null;
  congregation?: string | null;
  serving_as?: string[];
  is_overseer: boolean;
  is_assistant: boolean;
  is_active: boolean;
  trade_crew_id?: string | null;
  trade_crew_name?: string | null;
  trade_team_id?: string | null;
  trade_team_name?: string | null;
  user_id?: string | null;
  roles?: VolunteerRole[];
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
}

interface EditVolunteerModalProps {
  volunteer: Volunteer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: Volunteer) => Promise<void>;
}

const SERVING_ROLES = ['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Publisher'];

export default function EditVolunteerModal({ volunteer, isOpen, onClose, onSave }: EditVolunteerModalProps) {
  const [formData, setFormData] = useState<Volunteer | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [volunteerRoles, setVolunteerRoles] = useState<VolunteerRole[]>([]);

  useEffect(() => {
    if (isOpen && volunteer) {
      setFormData({ ...volunteer });
      setSelectedUserId(volunteer.user_id || null);
      setVolunteerRoles(volunteer.roles || []);
      fetchUsers();
      setError('');
    }
  }, [isOpen, volunteer]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/v1/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleRolesChange = () => {
    // Refresh volunteer roles after assignment/removal
    if (volunteer?.id) {
      fetch(`/api/v1/volunteers/${volunteer.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.roles) {
            setVolunteerRoles(data.roles);
          }
        })
        .catch(err => console.error('Failed to refresh roles:', err));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServingAsChange = (role: string) => {
    if (!formData) return;
    const currentRoles = formData.serving_as || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    setFormData({ ...formData, serving_as: newRoles });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setLoading(true);
    setError('');

    try {
      const updatedData: Volunteer = {
        ...formData,
        user_id: selectedUserId,
      };
      
      await onSave(updatedData);
    } catch (err) {
      console.error('Error saving volunteer:', err);
      setError('Failed to update volunteer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData || !confirm('Are you sure you want to remove this volunteer?')) return;
    
    try {
      const response = await fetch(`/api/v1/volunteers/${formData.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError('Failed to delete volunteer');
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Volunteer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BA ID</label>
                <input
                  type="text"
                  name="ba_id"
                  value={formData.ba_id || ''}
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
                  value={formData.congregation || ''}
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
                  value={formatPhoneNumber(formData.phone || '')}
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
                  value={formData.email_jw || ''}
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
                value={formData.email_personal || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>


          {/* Link User Account */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Link2 className="h-5 w-5 mr-2" />
              Link User Account
            </h3>
            <p className="text-sm text-gray-500">
              Optionally link this volunteer to a platform user account for login access.
            </p>
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No linked user account</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {selectedUserId && (
              <p className="text-sm text-green-600">
                ✓ This volunteer is linked to a user account and can log in to the platform.
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
                    checked={formData.serving_as?.includes(role) || false}
                    onChange={() => handleServingAsChange(role)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Organizational Roles */}
          {formData && (
            <VolunteerRoleAssignment
              volunteerId={formData.id}
              currentRoles={volunteerRoles}
              onRolesChange={handleRolesChange}
            />
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
