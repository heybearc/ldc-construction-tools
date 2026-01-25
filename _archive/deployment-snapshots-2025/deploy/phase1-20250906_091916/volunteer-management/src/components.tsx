// React components for volunteer-management
import React, { useState, useEffect } from 'react';
import { Volunteer, VolunteerStats, CreateVolunteerRequest } from './types';
import { VolunteerManagementAPI } from './api';

export interface VolunteerManagementProps {
  className?: string;
  apiBaseUrl: string;
}

export const VolunteerDashboard: React.FC<VolunteerManagementProps> = ({ className, apiBaseUrl }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVolunteers, setTotalVolunteers] = useState(0);

  const api = new VolunteerManagementAPI({ apiBaseUrl, version: '1.0.0' });

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [volunteersData, statsData] = await Promise.all([
        api.getVolunteers(currentPage, 20, searchTerm || undefined),
        api.getVolunteerStats()
      ]);
      setVolunteers(volunteersData.data);
      setTotalVolunteers(volunteersData.total);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const blob = await api.exportVolunteers(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volunteers.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export volunteers');
    }
  };

  if (loading && volunteers.length === 0) {
    return (
      <div className={`${className} flex justify-center items-center p-8`}>
        <div className="text-lg">Loading volunteers...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Volunteer Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export Excel
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Volunteers</h3>
              <p className="text-2xl font-bold text-blue-900">{stats.total_volunteers}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Active</h3>
              <p className="text-2xl font-bold text-green-900">{stats.active_volunteers}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Pending</h3>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending_volunteers}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">Inactive</h3>
              <p className="text-2xl font-bold text-red-900">{stats.inactive_volunteers}</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search volunteers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Congregation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volunteers.map((volunteer) => (
                <VolunteerRow key={volunteer.id} volunteer={volunteer} onUpdate={fetchData} api={api} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalVolunteers > 20 && (
        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {Math.ceil(totalVolunteers / 20)}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalVolunteers / 20)}
              className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface VolunteerRowProps {
  volunteer: Volunteer;
  onUpdate: () => void;
  api: VolunteerManagementAPI;
}

const VolunteerRow: React.FC<VolunteerRowProps> = ({ volunteer, onUpdate, api }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'pending') => {
    setLoading(true);
    try {
      await api.updateVolunteer(volunteer.id, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error('Failed to update volunteer status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      setLoading(true);
      try {
        await api.deleteVolunteer(volunteer.id);
        onUpdate();
      } catch (err) {
        console.error('Failed to delete volunteer:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{volunteer.email}</div>
        <div className="text-sm text-gray-500">{volunteer.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{volunteer.congregation}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {volunteer.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {skill}
            </span>
          ))}
          {volunteer.skills.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              +{volunteer.skills.length - 3} more
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={volunteer.status}
          onChange={(e) => handleStatusChange(e.target.value as any)}
          disabled={loading}
          className={`text-sm rounded px-2 py-1 ${
            volunteer.status === 'active' ? 'bg-green-100 text-green-800' :
            volunteer.status === 'inactive' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => setIsEditing(true)}
          className="text-indigo-600 hover:text-indigo-900 mr-3"
          disabled={loading}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-900"
          disabled={loading}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};
