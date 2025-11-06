'use client';

import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle, AlertTriangle, Clock, RefreshCw, TrendingUp, Database, Server } from 'lucide-react';

interface APIEndpoint {
  name: string;
  path: string;
  method: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime: number;
  lastChecked: string;
  description: string;
}

interface APIStats {
  totalEndpoints: number;
  healthyEndpoints: number;
  averageResponseTime: number;
  uptime: string;
}

export default function APIStatusPage() {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [stats, setStats] = useState<APIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadAPIStatus();
  }, []);

  const loadAPIStatus = async () => {
    try {
      setLoading(true);
      
      // Call the real API status endpoint
      const response = await fetch('/api/v1/admin/api/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`API status check failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setEndpoints(data.endpoints || []);
      setStats(data.stats || {
        totalEndpoints: 0,
        healthyEndpoints: 0,
        averageResponseTime: 0,
        uptime: '0%',
      });
    } catch (error) {
      console.error('Failed to load API status:', error);
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async (endpoint: APIEndpoint) => {
    setTesting(endpoint.path);
    
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: endpoint.method === 'POST' ? { 'Content-Type': 'application/json' } : {}
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const updatedEndpoint = {
        ...endpoint,
        status: response.ok ? 'healthy' as const : 'error' as const,
        responseTime,
        lastChecked: new Date().toISOString()
      };

      setEndpoints(prev => prev.map(ep => 
        ep.path === endpoint.path ? updatedEndpoint : ep
      ));
    } catch (error) {
      const updatedEndpoint = {
        ...endpoint,
        status: 'error' as const,
        responseTime: 0,
        lastChecked: new Date().toISOString()
      };

      setEndpoints(prev => prev.map(ep => 
        ep.path === endpoint.path ? updatedEndpoint : ep
      ));
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 100) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading API status...</p>
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
            <Globe className="mr-3 h-8 w-8 text-blue-600" />
            API Status Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor API endpoint health and performance
          </p>
        </div>
        <button
          onClick={loadAPIStatus}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh All
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Globe className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Endpoints</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalEndpoints}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Healthy</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.healthyEndpoints}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Response</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.averageResponseTime}ms</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Server className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Uptime</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.uptime}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Endpoints Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            API Endpoints ({endpoints.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {endpoints.map((endpoint, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                      <div className="text-sm text-gray-500">{endpoint.path}</div>
                      <div className="text-xs text-gray-400">{endpoint.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(endpoint.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(endpoint.status)}`}>
                        {endpoint.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getResponseTimeColor(endpoint.responseTime)}`}>
                      {endpoint.responseTime}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(endpoint.lastChecked).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => testEndpoint(endpoint)}
                      disabled={testing === endpoint.path}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      {testing === endpoint.path ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Database className="mr-2 h-5 w-5" />
            API Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Endpoint Categories</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Authentication:</strong> User login and session management</li>
                <li>• <strong>Admin:</strong> Administrative functions and configuration</li>
                <li>• <strong>Users:</strong> User management and profiles</li>
                <li>• <strong>Projects:</strong> Project data and management</li>
                <li>• <strong>Trade Teams:</strong> Organizational structure</li>
                <li>• <strong>Health:</strong> System monitoring and diagnostics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Response Time Guidelines</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <span className="text-green-600">&lt; 100ms:</span> Excellent performance</li>
                <li>• <span className="text-yellow-600">100-500ms:</span> Acceptable performance</li>
                <li>• <span className="text-red-600">&gt; 500ms:</span> Poor performance - needs attention</li>
                <li>• <strong>Target:</strong> 95% of requests under 200ms</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
