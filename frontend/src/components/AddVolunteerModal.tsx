'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Building2, Link2 } from 'lucide-react';
import { formatPhoneNumber, unformatPhoneNumber } from '@/lib/formatPhone';
import VolunteerRoleAssignment from './VolunteerRoleAssignment';

interface UserAccount {
  id: string;
  name: string;
  email: string;
}

interface AddVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: any) => Promise<void>;
}

const SERVING_ROLES = ['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Publisher'];

export default function AddVolunteerModal({ isOpen, onClose, onSave }: AddVolunteerModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    ba_id: '',
    phone: '',
    email_personal: '',
    email_jw: '',
    congregation: '',
    serving_as: [] as string[],
  });

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createdVolunteerId, setCreatedVolunteerId] = useState<string | null>(null);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      resetForm();
    }
  }, [isOpen]);

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

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      ba_id: '',
      phone: '',
      email_personal: '',
      email_jw: '',
      congregation: '',
      serving_as: [],
    });
    setSelectedUserId(null);
    setCreatedVolunteerId(null);
    setShowRoleAssignment(false);
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
      // Create volunteer with basic info
      const volunteerData = {
        ...formData,
        user_id: selectedUserId,
      };

      const response = await fetch('/api/v1/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteerData),
      });

      if (!response.ok) {
        throw new Error('Failed to create volunteer');
      }

      const newVolunteer = await response.json();
      console.log('Volunteer created:', newVolunteer.id);
      setCreatedVolunteerId(newVolunteer.id);
      console.log('Setting showRoleAssignment to true');
      setShowRoleAssignment(true);
      
      // Call parent onSave to refresh list
      await onSave(newVolunteer);
      console.log('showRoleAssignment should now be true');
    } catch (err) {
      console.error('Error creating volunteer:', err);
      setError('Failed to create volunteer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRolesComplete = () => {
    resetForm();
    onClose();
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

          {/* Show basic form only when not in role assignment mode */}
          {!showRoleAssignment && (
            <>
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
            </>
          )}

          {/* Show role assignment after volunteer is created */}
          {showRoleAssignment && createdVolunteerId && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                ✓ Volunteer created successfully! Now assign organizational roles.
              </div>
              <VolunteerRoleAssignment
                volunteerId={createdVolunteerId}
                currentRoles={[]}
                onRolesChange={() => {}}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {showRoleAssignment ? (
              <button
                type="button"
                onClick={handleRolesComplete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Done
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
