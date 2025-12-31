'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Filter, Search, Download, Eye, Calendar, User, Activity, Building2 } from 'lucide-react';

interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  // Multi-tenant specific fields
  fromConstructionGroupId?: string | null;
  toConstructionGroupId?: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
  fromConstructionGroup?: {
    id: string;
    code: string;
    name: string;
  } | null;
  toConstructionGroup?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

interface AuditFilters {
  action: string;
  resource: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

type TabType = 'all' | 'system' | 'cg-operations' | 'user-operations' | 'volunteer-operations';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [filters, setFilters] = useState<AuditFilters>({
    action: '',
    resource: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filters, activeTab]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      // Fetch both general and multi-tenant logs
      const [generalResponse, multiTenantResponse] = await Promise.all([
        fetch('/api/v1/admin/audit/logs', {
          credentials: 'include',
          cache: 'no-store',
        }),
        fetch('/api/v1/admin/audit/multi-tenant', {
          credentials: 'include',
          cache: 'no-store',
        })
      ]);
      
      let allLogs: AuditLog[] = [];
      
      if (generalResponse.ok) {
        const generalData = await generalResponse.json();
        allLogs = [...allLogs, ...(generalData.logs || [])];
      }
      
      if (multiTenantResponse.ok) {
        const multiTenantData = await multiTenantResponse.json();
        allLogs = [...allLogs, ...(multiTenantData.logs || [])];
      }
      
      // Sort by timestamp descending
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Apply tab filtering
      const filteredLogs = filterLogsByTab(allLogs);
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogsByTab = (logs: AuditLog[]): AuditLog[] => {
    switch (activeTab) {
      case 'system':
        return logs.filter(log => 
          ['EMAIL_CONFIG', 'SESSION', 'ANNOUNCEMENT', 'SYSTEM'].includes(log.resource)
        );
      case 'cg-operations':
        return logs.filter(log => 
          log.resource === 'CONSTRUCTION_GROUP' || 
          log.resource === 'CG_FILTER' ||
          log.action.includes('CG_')
        );
      case 'user-operations':
        return logs.filter(log => 
          log.resource === 'USER' && !log.action.includes('CG_')
        );
      case 'volunteer-operations':
        return logs.filter(log => 
          log.resource === 'VOLUNTEER'
        );
      case 'all':
      default:
        return logs;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('CREATED')) {
      return 'bg-green-100 text-green-800';
    } else if (action.includes('UPDATE') || action.includes('UPDATED')) {
      return 'bg-blue-100 text-blue-800';
    } else if (action.includes('DELETE') || action.includes('DELETED')) {
      return 'bg-red-100 text-red-800';
    } else if (action.includes('LOGIN')) {
      return 'bg-purple-100 text-purple-800';
    } else if (action.includes('REACTIVATED')) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'From CG', 'To CG', 'IP Address'].join(','),
      ...logs.map(log => [
        log.timestamp,
        log.userName || log.user?.name || 'Unknown',
        log.action,
        log.resource,
        log.resourceId || '',
        log.fromConstructionGroup?.code || '',
        log.toConstructionGroup?.code || '',
        log.ipAddress || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'all' as TabType, label: 'All Logs', icon: FileText },
    { id: 'system' as TabType, label: 'System Operations', icon: Activity },
    { id: 'cg-operations' as TabType, label: 'CG Operations', icon: Building2 },
    { id: 'user-operations' as TabType, label: 'User Operations', icon: User },
    { id: 'volunteer-operations' as TabType, label: 'Volunteer Operations', icon: User },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-600" />
            Audit Logs
          </h2>
          <p className="text-gray-600 mt-1">
            Track all system activities, CG operations, and user actions
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search logs..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="CG_CREATED">CG Created</option>
              <option value="CG_UPDATED">CG Updated</option>
              <option value="CG_DELETED">CG Deleted</option>
              <option value="CG_REACTIVATED">CG Reactivated</option>
              <option value="CG_FILTER_CHANGE">CG Filter Change</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              value={filters.resource}
              onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Resources</option>
              <option value="USER">User</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="CONSTRUCTION_GROUP">Construction Group</option>
              <option value="CG_FILTER">CG Filter</option>
              <option value="PROJECT">Project</option>
              <option value="EMAIL_CONFIG">Email Config</option>
              <option value="SESSION">Session</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                action: '',
                resource: '',
                userId: '',
                dateFrom: '',
                dateTo: '',
                search: ''
              })}
              className="w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {tabs.find(t => t.id === activeTab)?.label} ({logs.length})
          </h3>
        </div>

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
                  CG Context
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.userName || log.user?.name || 'Unknown'}
                            </div>
                            {log.user?.email && (
                              <div className="text-xs text-gray-500">{log.user.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <div>{log.resource}</div>
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
                        {log.ipAddress || 'N/A'}
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
                    {expandedLog === log.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 bg-gray-50">
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
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
