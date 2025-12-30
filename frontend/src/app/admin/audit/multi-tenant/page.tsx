'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Download, Filter, RefreshCw, Search, User, FileText, Database } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  fromConstructionGroupId: string | null;
  toConstructionGroupId: string | null;
  oldValues: any;
  newValues: any;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
  fromConstructionGroup: {
    id: string;
    code: string;
    name: string;
  } | null;
  toConstructionGroup: {
    id: string;
    code: string;
    name: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MultiTenantAuditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resource: '',
    constructionGroupId: '',
    startDate: '',
    endDate: ''
  });

  // Redirect if not authenticated or not SUPER_ADMIN
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch audit logs
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });

      const response = await fetch(`/api/v1/admin/audit/multi-tenant?${params}`);
      if (!response.ok) throw new Error('Failed to fetch audit logs');

      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'SUPER_ADMIN') {
      fetchLogs();
    }
  }, [status, session]);

  // Export to CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      );

      const response = await fetch(`/api/v1/admin/audit/multi-tenant/export?${params}`);
      if (!response.ok) throw new Error('Failed to export audit logs');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      alert('Failed to export audit logs');
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchLogs(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      userId: '',
      action: '',
      resource: '',
      constructionGroupId: '',
      startDate: '',
      endDate: ''
    });
    setTimeout(() => fetchLogs(1), 0);
  };

  // Format action name for display
  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Tenant Audit Logs</h1>
        <p className="text-gray-600">
          Track all Construction Group management and multi-tenant operations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="CG_FILTER_CHANGE">CG Filter Change</option>
              <option value="CG_CREATED">CG Created</option>
              <option value="CG_UPDATED">CG Updated</option>
              <option value="CG_DELETED">CG Deleted</option>
              <option value="CG_REACTIVATED">CG Reactivated</option>
              <option value="USER_CG_ASSIGNMENT">User CG Assignment</option>
              <option value="VOLUNTEER_CG_TRANSFER">Volunteer CG Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource Type
            </label>
            <select
              value={filters.resource}
              onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Resources</option>
              <option value="CG_FILTER">CG Filter</option>
              <option value="CONSTRUCTION_GROUP">Construction Group</option>
              <option value="USER">User</option>
              <option value="VOLUNTEER">Volunteer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Showing {logs.length} of {pagination.total} audit logs
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchLogs(pagination.page)}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CG Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No audit logs found</p>
                    <p className="text-sm mt-2">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.user?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">{log.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{log.resource}</div>
                          {log.resourceId && (
                            <div className="text-xs text-gray-500">{log.resourceId.substring(0, 8)}...</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.fromConstructionGroup || log.toConstructionGroup ? (
                        <div className="flex items-center gap-2">
                          {log.fromConstructionGroup && (
                            <span className="text-xs text-gray-600">
                              {log.fromConstructionGroup.code}
                            </span>
                          )}
                          {log.fromConstructionGroup && log.toConstructionGroup && (
                            <span className="text-gray-400">→</span>
                          )}
                          {log.toConstructionGroup && (
                            <span className="text-xs font-medium text-blue-600">
                              {log.toConstructionGroup.code}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedLog === log.id ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded Details */}
        {expandedLog && logs.find(l => l.id === expandedLog) && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            {(() => {
              const log = logs.find(l => l.id === expandedLog)!;
              return (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                      <p className="text-sm text-gray-900">{log.ipAddress || 'Not recorded'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                      <p className="text-sm text-gray-900 truncate">{log.userAgent || 'Not recorded'}</p>
                    </div>
                  </div>

                  {log.metadata && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Metadata</label>
                      <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.oldValues && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Old Values</label>
                      <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(log.oldValues, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.newValues && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Values</label>
                      <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(log.newValues, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => fetchLogs(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
