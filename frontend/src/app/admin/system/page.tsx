'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Server, Database, RefreshCw, Download, Upload, Trash2, AlertTriangle, CheckCircle, HardDrive } from 'lucide-react';

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

interface BackupInfo {
  backups: Array<{ filename: string; size: string; date: string }>;
  lastBackup: { filename: string; size: string; date: string } | null;
  databases: Array<{ name: string; size: string }>;
  backupCount: number;
}

export default function SystemOperationsPage() {
  const [operations, setOperations] = useState<SystemOperation[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningOperation, setRunningOperation] = useState<string | null>(null);
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [backupMessage, setBackupMessage] = useState('');
  const [showBackupList, setShowBackupList] = useState(false);

  const fetchBackupInfo = async () => {
    try {
      const response = await fetch('/api/v1/admin/backup/info', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setBackupInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch backup info:', error);
    }
  };

  const handleBackup = async () => {
    setBackupStatus('running');
    setBackupMessage('Creating backup...');
    
    try {
      const response = await fetch('/api/v1/admin/backup', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBackupStatus('success');
        setBackupMessage('Backup completed successfully!');
        fetchBackupInfo(); // Refresh backup info
      } else {
        setBackupStatus('error');
        setBackupMessage(data.error || 'Backup failed');
      }
    } catch (error) {
      setBackupStatus('error');
      setBackupMessage('Failed to trigger backup');
    }
    
    setTimeout(() => {
      setBackupStatus('idle');
      setBackupMessage('');
    }, 5000);
  };

  useEffect(() => {
    loadSystemData();
    fetchBackupInfo();
    const interval = setInterval(fetchBackupInfo, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      const response = await fetch('/api/v1/admin/system/info', {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data.systemInfo);
        
        // Set predefined operations (these are UI-only for now)
        // In production, these would trigger actual system operations
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
            id: 'deploy-standby',
            name: 'Deploy to STANDBY (GREEN)',
            description: 'Deploy latest changes to STANDBY environment for testing',
            category: 'deployment',
            status: 'completed',
            lastRun: new Date().toISOString(),
            duration: 180
          }
        ]);
      } else {
        console.error('Failed to load system info:', response.statusText);
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

      {/* Data Protection - Backup Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HardDrive className="mr-2 h-5 w-5 text-green-600" />
              Data Protection
            </h3>
            {backupInfo && backupInfo.backupCount > 0 && (
              <button
                onClick={() => setShowBackupList(!showBackupList)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showBackupList ? '▼ Hide' : '▶'} View {backupInfo.backupCount} Backups
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">Database backups to TrueNAS (auto-backups run daily at 2 AM)</p>
        </div>
        <div className="p-6">
          {backupMessage && (
            <div className={`mb-4 p-4 rounded-lg ${
              backupStatus === 'success' ? 'bg-green-100 text-green-800' : 
              backupStatus === 'error' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {backupMessage}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            {backupInfo?.databases.map((db, idx) => (
              <div key={idx}>
                <div className="text-gray-600">Database Size</div>
                <div className="font-medium">{db.size || 'Unknown'}</div>
              </div>
            ))}
            <div>
              <div className="text-gray-600">Total Backups</div>
              <div className="font-medium">{backupInfo?.backupCount || 0}</div>
            </div>
            <div>
              <div className="text-gray-600">Last Backup</div>
              <div className="font-medium">{backupInfo?.lastBackup?.date || 'Never'}</div>
            </div>
            <div>
              <button
                onClick={handleBackup}
                disabled={backupStatus === 'running'}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  backupStatus === 'running'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {backupStatus === 'running' ? '⏳ Running...' : '▶️ Backup Now'}
              </button>
            </div>
          </div>

          {showBackupList && backupInfo && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Recent Backups</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {backupInfo.backups.map((backup, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-2 px-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-mono text-xs text-gray-600">{backup.filename}</div>
                    </div>
                    <div className="text-gray-600 ml-4">{backup.size}</div>
                    <div className="text-gray-500 ml-4 text-xs">{backup.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
