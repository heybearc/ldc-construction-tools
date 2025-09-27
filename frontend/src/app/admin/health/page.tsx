'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  description: string;
  lastChecked: string;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error';
  uptime: string;
  metrics: HealthMetric[];
}

export default function HealthMonitorPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadHealthData = async () => {
    try {
      const response = await fetch('/api/v1/admin/health/status');
      if (response.ok) {
        const data = await response.json();
        setHealth(data.health);
      } else {
        // Mock data for development
        setHealth({
          overall: 'healthy',
          uptime: '2 days, 14 hours, 32 minutes',
          metrics: [
            {
              name: 'Database Connection',
              status: 'healthy',
              value: '< 5ms',
              description: 'PostgreSQL connection response time',
              lastChecked: new Date().toISOString()
            },
            {
              name: 'API Response Time',
              status: 'healthy',
              value: '28ms avg',
              description: 'Average API endpoint response time',
              lastChecked: new Date().toISOString()
            },
            {
              name: 'Memory Usage',
              status: 'warning',
              value: '78%',
              description: 'Current memory utilization',
              lastChecked: new Date().toISOString()
            },
            {
              name: 'Disk Space',
              status: 'healthy',
              value: '45% used',
              description: 'Available disk space',
              lastChecked: new Date().toISOString()
            },
            {
              name: 'Email Service',
              status: 'healthy',
              value: 'Connected',
              description: 'SMTP connection status',
              lastChecked: new Date().toISOString()
            },
            {
              name: 'Background Jobs',
              status: 'healthy',
              value: '3 active',
              description: 'Running background processes',
              lastChecked: new Date().toISOString()
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading health data...</p>
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
            <Activity className="mr-3 h-8 w-8 text-blue-600" />
            Health Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-refresh (30s)</span>
          </label>
          <button
            onClick={loadHealthData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      {health && (
        <div className={`rounded-lg border-2 p-6 ${getStatusColor(health.overall)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(health.overall)}
              <div className="ml-3">
                <h3 className="text-lg font-medium">
                  System Status: {health.overall.charAt(0).toUpperCase() + health.overall.slice(1)}
                </h3>
                <p className="text-sm opacity-75">
                  Uptime: {health.uptime}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Last updated</p>
              <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Health Metrics Grid */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {health.metrics.map((metric, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(metric.status)}
                  <h3 className="ml-2 text-lg font-medium text-gray-900">{metric.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-500">{metric.description}</div>
              </div>
              
              <div className="text-xs text-gray-400">
                Last checked: {new Date(metric.lastChecked).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* System Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Server className="mr-2 h-5 w-5" />
            System Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Database</div>
              <div className="text-sm text-gray-500">PostgreSQL 14.2</div>
            </div>
            
            <div className="text-center">
              <Server className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Runtime</div>
              <div className="text-sm text-gray-500">Node.js 18.17.0</div>
            </div>
            
            <div className="text-center">
              <Wifi className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Framework</div>
              <div className="text-sm text-gray-500">Next.js 15.1.3</div>
            </div>
            
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Environment</div>
              <div className="text-sm text-gray-500">Staging</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50">
              <div className="font-medium text-gray-900">Clear Cache</div>
              <div className="text-sm text-gray-500 mt-1">Clear application cache and temporary files</div>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50">
              <div className="font-medium text-gray-900">Restart Services</div>
              <div className="text-sm text-gray-500 mt-1">Restart background services and workers</div>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50">
              <div className="font-medium text-gray-900">Export Logs</div>
              <div className="text-sm text-gray-500 mt-1">Download system logs for analysis</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
