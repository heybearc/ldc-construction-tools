'use client';

import React, { useState, useEffect } from 'react';
import { Church, Plus, X, Edit, Trash2, Phone, Mail, User, Utensils, Shield, Users } from 'lucide-react';

interface Congregation {
  id: string;
  name: string;
  state: string | null;
  congregation_number: string | null;
  coordinator_name: string | null;
  coordinator_phone: string | null;
  coordinator_email: string | null;
  congregation_email: string | null;
}

interface ContactInfo {
  name: string | null;
  phone: string | null;
  email: string | null;
}

interface CongregationAssignment {
  id: string;
  project_id: string;
  congregation_id: string;
  congregation: Congregation;
  food_contact: ContactInfo;
  volunteer_contact: ContactInfo;
  security_contact: ContactInfo;
  notes: string | null;
  is_active: boolean;
}

interface Props {
  projectId: string;
}

export default function ProjectCongregations({ projectId }: Props) {
  const [assignments, setAssignments] = useState<CongregationAssignment[]>([]);
  const [availableCongregations, setAvailableCongregations] = useState<Congregation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<CongregationAssignment | null>(null);
  const [selectedCongregationId, setSelectedCongregationId] = useState('');
  const [formData, setFormData] = useState({
    food_contact: { name: '', phone: '', email: '' },
    volunteer_contact: { name: '', phone: '', email: '' },
    security_contact: { name: '', phone: '', email: '' },
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchCongregations();
  }, [projectId]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/congregations`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Failed to fetch congregation assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCongregations = async () => {
    try {
      const response = await fetch('/api/v1/congregations');
      if (response.ok) {
        const data = await response.json();
        setAvailableCongregations(data);
      }
    } catch (err) {
      console.error('Failed to fetch congregations:', err);
    }
  };

  const openAddModal = () => {
    setSelectedCongregationId('');
    setFormData({
      food_contact: { name: '', phone: '', email: '' },
      volunteer_contact: { name: '', phone: '', email: '' },
      security_contact: { name: '', phone: '', email: '' },
      notes: '',
    });
    setShowAddModal(true);
  };

  const openEditModal = (assignment: CongregationAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      food_contact: {
        name: assignment.food_contact.name || '',
        phone: assignment.food_contact.phone || '',
        email: assignment.food_contact.email || '',
      },
      volunteer_contact: {
        name: assignment.volunteer_contact.name || '',
        phone: assignment.volunteer_contact.phone || '',
        email: assignment.volunteer_contact.email || '',
      },
      security_contact: {
        name: assignment.security_contact.name || '',
        phone: assignment.security_contact.phone || '',
        email: assignment.security_contact.email || '',
      },
      notes: assignment.notes || '',
    });
    setShowEditModal(true);
  };

  const handleAdd = async () => {
    if (!selectedCongregationId) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/congregations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          congregation_id: selectedCongregationId,
          ...formData,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to add congregation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAssignment) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/congregations/${editingAssignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingAssignment(null);
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to update congregation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (assignment: CongregationAssignment) => {
    if (!confirm(`Remove "${assignment.congregation.name}" from this project?`)) return;

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/congregations/${assignment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to remove congregation:', err);
    }
  };

  const unassignedCongregations = availableCongregations.filter(
    c => !assignments.some(a => a.congregation_id === c.id)
  );

  const ContactCard = ({ title, icon: Icon, contact, color }: { title: string; icon: any; contact: ContactInfo; color: string }) => (
    <div className={`p-3 rounded-lg ${color}`}>
      <div className="flex items-center mb-2">
        <Icon className="h-4 w-4 mr-2" />
        <span className="font-medium text-sm">{title}</span>
      </div>
      {contact.name ? (
        <div className="text-sm space-y-1">
          <div className="font-medium">{contact.name}</div>
          {contact.phone && (
            <div className="flex items-center text-gray-600">
              <Phone className="h-3 w-3 mr-1" />
              {contact.phone}
            </div>
          )}
          {contact.email && (
            <div className="flex items-center text-gray-600 truncate">
              <Mail className="h-3 w-3 mr-1" />
              {contact.email}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic">Not assigned</div>
      )}
    </div>
  );

  const ContactFormSection = ({ title, icon: Icon, contactKey, color }: { title: string; icon: any; contactKey: 'food_contact' | 'volunteer_contact' | 'security_contact'; color: string }) => (
    <div className={`p-4 rounded-lg ${color}`}>
      <div className="flex items-center mb-3">
        <Icon className="h-5 w-5 mr-2" />
        <span className="font-medium">{title}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Name"
          value={formData[contactKey].name}
          onChange={(e) => setFormData({
            ...formData,
            [contactKey]: { ...formData[contactKey], name: e.target.value }
          })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData[contactKey].phone}
          onChange={(e) => setFormData({
            ...formData,
            [contactKey]: { ...formData[contactKey], phone: e.target.value }
          })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData[contactKey].email}
          onChange={(e) => setFormData({
            ...formData,
            [contactKey]: { ...formData[contactKey], email: e.target.value }
          })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  );

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Church className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Supporting Congregations</h2>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {assignments.length}
          </span>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Congregation
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Church className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No supporting congregations assigned to this project.</p>
          <button onClick={openAddModal} className="mt-2 text-blue-600 hover:underline">
            Add the first congregation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{assignment.congregation.name}</h3>
                  <div className="text-sm text-gray-500">
                    {assignment.congregation.state && <span>{assignment.congregation.state}</span>}
                    {assignment.congregation.congregation_number && (
                      <span className="ml-2">#{assignment.congregation.congregation_number}</span>
                    )}
                  </div>
                  {assignment.congregation.coordinator_name && (
                    <div className="text-sm text-gray-600 mt-1">
                      <User className="h-3 w-3 inline mr-1" />
                      Coordinator: {assignment.congregation.coordinator_name}
                      {assignment.congregation.coordinator_phone && ` • ${assignment.congregation.coordinator_phone}`}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(assignment)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ContactCard
                  title="Food Contact"
                  icon={Utensils}
                  contact={assignment.food_contact}
                  color="bg-green-50"
                />
                <ContactCard
                  title="Volunteer Contact"
                  icon={Users}
                  contact={assignment.volunteer_contact}
                  color="bg-blue-50"
                />
                <ContactCard
                  title="Security Contact"
                  icon={Shield}
                  contact={assignment.security_contact}
                  color="bg-amber-50"
                />
              </div>

              {assignment.notes && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {assignment.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Supporting Congregation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Congregation *</label>
                <select
                  value={selectedCongregationId}
                  onChange={(e) => setSelectedCongregationId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose a congregation...</option>
                  {unassignedCongregations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.state && `(${c.state})`} {c.congregation_number && `#${c.congregation_number}`}
                    </option>
                  ))}
                </select>
              </div>

              <ContactFormSection title="Food Contact" icon={Utensils} contactKey="food_contact" color="bg-green-50" />
              <ContactFormSection title="Volunteer Contact" icon={Users} contactKey="volunteer_contact" color="bg-blue-50" />
              <ContactFormSection title="Security Contact" icon={Shield} contactKey="security_contact" color="bg-amber-50" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!selectedCongregationId || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Congregation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Contacts - {editingAssignment.congregation.name}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <ContactFormSection title="Food Contact" icon={Utensils} contactKey="food_contact" color="bg-green-50" />
              <ContactFormSection title="Volunteer Contact" icon={Users} contactKey="volunteer_contact" color="bg-blue-50" />
              <ContactFormSection title="Security Contact" icon={Shield} contactKey="security_contact" color="bg-amber-50" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
