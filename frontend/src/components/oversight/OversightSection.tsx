'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, X, UserCheck, UserCog, HeadphonesIcon } from 'lucide-react';

interface OversightAssignment {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

interface RoleConfig {
  name: string;
  shortName: string;
  maxPerEntity: number | null;
  description: string;
}

interface OversightSectionProps {
  title: string;
  entityId: string;
  apiBasePath: string;
  roleConfig: Record<string, RoleConfig>;
  roleOrder: string[];
  availableUsers: Array<{ id: string; name: string | null; email: string }>;
  onRefresh?: () => void;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  TTO: <UserCheck className="w-4 h-4" />,
  TTOA: <UserCog className="w-4 h-4" />,
  TT_SUPPORT: <HeadphonesIcon className="w-4 h-4" />,
  TCO: <UserCheck className="w-4 h-4" />,
  TCOA: <UserCog className="w-4 h-4" />,
  TC_SUPPORT: <HeadphonesIcon className="w-4 h-4" />,
  PC: <UserCheck className="w-4 h-4" />,
  PCA: <UserCog className="w-4 h-4" />,
  PC_SUPPORT: <HeadphonesIcon className="w-4 h-4" />
};

const ROLE_COLORS: Record<string, string> = {
  TTO: 'bg-blue-100 text-blue-800 border-blue-200',
  TTOA: 'bg-green-100 text-green-800 border-green-200',
  TT_SUPPORT: 'bg-gray-100 text-gray-800 border-gray-200',
  TCO: 'bg-purple-100 text-purple-800 border-purple-200',
  TCOA: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  TC_SUPPORT: 'bg-gray-100 text-gray-800 border-gray-200',
  PC: 'bg-orange-100 text-orange-800 border-orange-200',
  PCA: 'bg-amber-100 text-amber-800 border-amber-200',
  PC_SUPPORT: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function OversightSection({
  title,
  entityId,
  apiBasePath,
  roleConfig,
  roleOrder,
  availableUsers,
  onRefresh
}: OversightSectionProps) {
  const [assignments, setAssignments] = useState<OversightAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${apiBasePath}`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.oversight || data.contacts || []);
      }
    } catch (err) {
      console.error('Failed to fetch oversight:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [entityId, apiBasePath]);

  const handleAdd = async () => {
    if (!selectedRole || !selectedUserId) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch(`${apiBasePath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, role: selectedRole })
      });
      
      if (res.ok) {
        await fetchAssignments();
        setShowAddModal(false);
        setSelectedRole('');
        setSelectedUserId('');
        onRefresh?.();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add assignment');
      }
    } catch (err) {
      setError('Failed to add assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    if (!confirm('Remove this assignment?')) return;
    
    try {
      const res = await fetch(`${apiBasePath}/${assignmentId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await fetchAssignments();
        onRefresh?.();
      }
    } catch (err) {
      console.error('Failed to remove assignment:', err);
    }
  };

  const getAssignmentsByRole = (role: string) => 
    assignments.filter(a => a.role === role);

  const getRoleLimit = (role: string) => roleConfig[role]?.maxPerEntity;

  const canAddRole = (role: string) => {
    const limit = getRoleLimit(role);
    if (limit === null) return true;
    return getAssignmentsByRole(role).length < limit;
  };

  const getUserDisplayName = (user: OversightAssignment['user']) => {
    if (!user) return 'Unknown';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    return user.name || user.email;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">({assignments.length})</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="p-4 space-y-4">
        {roleOrder.map(role => {
          const roleAssignments = getAssignmentsByRole(role);
          const config = roleConfig[role];
          const limit = config?.maxPerEntity;
          
          return (
            <div key={role} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${ROLE_COLORS[role] || 'bg-gray-100'}`}>
                  {ROLE_ICONS[role]}
                  {config?.name || role}
                </span>
                {limit !== null && (
                  <span className="text-xs text-gray-500">
                    ({roleAssignments.length}/{limit})
                  </span>
                )}
              </div>
              
              {roleAssignments.length === 0 ? (
                <p className="text-sm text-gray-400 italic pl-2">No {config?.name || role} assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2 pl-2">
                  {roleAssignments.map(assignment => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border text-sm group"
                    >
                      <span>{getUserDisplayName(assignment.user)}</span>
                      <button
                        onClick={() => handleRemove(assignment.id)}
                        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Add {title}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a role...</option>
                  {roleOrder.map(role => {
                    const config = roleConfig[role];
                    const canAdd = canAddRole(role);
                    return (
                      <option key={role} value={role} disabled={!canAdd}>
                        {config?.name || role}
                        {!canAdd ? ' (limit reached)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a user...</option>
                  {availableUsers
                    .filter(u => !assignments.some(a => a.userId === u.id && a.role === selectedRole))
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!selectedRole || !selectedUserId || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : 'Add Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
