'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Server, Database, RefreshCw, Download, Upload, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

interface SystemOperation {
  id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'backup' | 'deployment' | 'monitoring';
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  duration?: number;
}

interface SystemInfo {
  version: string;
  environment: string;
  uptime: string;
  lastDeployment: string;
  databaseVersion: string;
  nodeVersion: string;
}

export default function SystemOperationsPage() {
  const [operations, setOperations] = useState<SystemOperation[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningOperation, setRunningOperation] = useState<string | null>(null);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      const response = await fetch('/api/v1/admin/system/info');
      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations);
        setSystemInfo(data.systemInfo);
      } else {
        // Mock data for development
        setOperations([
          {
            id: 'cache-clear',
            name: 'Clear Application Cache',
            description: 'Clear all cached data and temporary files',
            category: 'maintenance',
            status: 'idle',
            lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            duration: 15
          },
          {
            id: 'db-backup',
            name: 'Database Backup',
            description: 'Create a full backup of the PostgreSQL database',
            category: 'backup',
            status: 'completed',
            lastRun: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            duration: 120
          },
          {
            id: 'restart-services',
            name: 'Restart Background Services',
            description: 'Restart all background workers and services',
            category: 'maintenance',
            status: 'idle',
            lastRun: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            duration: 30
          },
          {
            id: 'health-check',
            name: 'System Health Check',
            description: 'Run comprehensive system diagnostics',
            category: 'monitoring',
            status: 'idle',
            lastRun: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            duration: 45
          },
          {
            id: 'log-cleanup',
            name: 'Clean Old Logs',
            description: 'Remove log files older than 30 days',
            category: 'maintenance',
            status: 'idle',
            lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            duration: 10
          },
          {
            id: 'deploy-staging',
            name: 'Deploy to Staging',
            description: 'Deploy latest changes to staging environment',
            category: 'deployment',
            status: 'failed',
            lastRun: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            duration: 180
          }
        ]);

        setSystemInfo({
          version: '1.0.0-beta',
          environment: 'Staging',
          uptime: '2 days, 14 hours, 32 minutes',
          lastDeployment: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          databaseVersion: 'PostgreSQL 15.2',
          nodeVersion: 'Node.js 18.17.0'
        });
      }
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runOperation = async (operation: SystemOperation) => {
    setRunningOperation(operation.id);
    
    // Update operation status to running
    setOperations(prev => prev.map(op => 
      op.id === operation.id ? { ...op, status: 'running' } : op
    ));

    try {
      const response = await fetch(`/api/v1/admin/system/operations/${operation.id}`, {
        method: 'POST'
      });

      if (response.ok) {
        // Simulate operation duration
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setOperations(prev => prev.map(op => 
          op.id === operation.id 
            ? { 
                ...op, 
                status: 'completed', 
                lastRun: new Date().toISOString(),
                duration: Math.floor(Math.random() * 60) + 10
              } 
            : op
        ));
      } else {
        setOperations(prev => prev.map(op => 
          op.id === operation.id ? { ...op, status: 'failed' } : op
        ));
      }
    } catch (error) {
      setOperations(prev => prev.map(op => 
        op.id === operation.id ? { ...op, status: 'failed' } : op
      ));
    } finally {
      setRunningOperation(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance':
        return <Settings className="h-5 w-5 text-blue-500" />;
      case 'backup':
        return <Download className="h-5 w-5 text-green-500" />;
      case 'deployment':
        return <Upload className="h-5 w-5 text-purple-500" />;
      case 'monitoring':
        return <Server className="h-5 w-5 text-orange-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading system information...</p>
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
            <Settings className="mr-3 h-8 w-8 text-blue-600" />
            System Operations
          </h2>
          <p className="text-gray-600 mt-1">
            Manage system maintenance, backups, and deployments
          </p>
        </div>
        <button
          onClick={loadSystemData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* System Information */}
      {systemInfo && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Server className="mr-2 h-5 w-5" />
              System Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Version</label>
                <p className="text-sm text-gray-900">{systemInfo.version}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Environment</label>
                <p className="text-sm text-gray-900">{systemInfo.environment}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Uptime</label>
                <p className="text-sm text-gray-900">{systemInfo.uptime}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Deployment</label>
                <p className="text-sm text-gray-900">{new Date(systemInfo.lastDeployment).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Database</label>
                <p className="text-sm text-gray-900">{systemInfo.databaseVersion}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Runtime</label>
                <p className="text-sm text-gray-900">{systemInfo.nodeVersion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operations by Category */}
      {['maintenance', 'backup', 'deployment', 'monitoring'].map(category => {
        const categoryOps = operations.filter(op => op.category === category);
        if (categoryOps.length === 0) return null;

        return (
          <div key={category} className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center capitalize">
                {getCategoryIcon(category)}
                <span className="ml-2">{category} Operations</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryOps.map((operation) => (
                  <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          {getCategoryIcon(operation.category)}
                          <h4 className="ml-2 text-sm font-medium text-gray-900">{operation.name}</h4>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{operation.description}</p>
                        
                        <div className="flex items-center mt-3 space-x-4">
                          <div className="flex items-center">
                            {getStatusIcon(operation.status)}
                            <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(operation.status)}`}>
                              {operation.status}
                            </span>
                          </div>
                          
                          {operation.lastRun && (
                            <div className="text-xs text-gray-500">
                              Last run: {new Date(operation.lastRun).toLocaleString()}
                            </div>
                          )}
                          
                          {operation.duration && (
                            <div className="text-xs text-gray-500">
                              Duration: {operation.duration}s
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => runOperation(operation)}
                        disabled={runningOperation === operation.id || operation.status === 'running'}
                        className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        {runningOperation === operation.id ? (
                          <>
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                            Running
                          </>
                        ) : (
                          'Run'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Emergency Operations */}
      <div className="bg-red-50 border border-red-200 rounded-lg">
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-medium text-red-900 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Emergency Operations
          </h3>
          <p className="text-sm text-red-700 mt-1">Use these operations only in emergency situations</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border border-red-300 rounded-lg text-left hover:bg-red-100">
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <div className="font-medium text-red-900">Emergency Cache Clear</div>
                  <div className="text-sm text-red-700 mt-1">Clear all caches and restart services</div>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-red-300 rounded-lg text-left hover:bg-red-100">
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <div className="font-medium text-red-900">Force Application Restart</div>
                  <div className="text-sm text-red-700 mt-1">Force restart the entire application</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
