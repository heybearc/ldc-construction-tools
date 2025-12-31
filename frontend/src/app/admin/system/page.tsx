'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Server, Database, RefreshCw, Download, Upload, Trash2, AlertTriangle, CheckCircle, HardDrive, Power, Calendar } from 'lucide-react';

interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  allowedIPs?: string[];
}

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

interface DeploymentState {
  prodServer: string;
  standbyServer: string;
  deployTarget: string;
  currentEnvironment: string;
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
  const [deploymentState, setDeploymentState] = useState<DeploymentState | null>(null);
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>({
    enabled: false,
    message: 'LDC Tools is currently undergoing scheduled maintenance. We\'ll be back shortly!',
    allowedIPs: []
  });
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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

  const fetchDeploymentState = async () => {
    try {
      const response = await fetch('/api/v1/admin/system/deployment-state');
      if (response.ok) {
        const data = await response.json();
        setDeploymentState(data);
      }
    } catch (error) {
      console.error('Failed to fetch deployment state:', error);
    }
  };

  useEffect(() => {
    loadSystemData();
    fetchBackupInfo();
    fetchDeploymentState();
    loadMaintenanceConfig();
    const interval = setInterval(fetchBackupInfo, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadMaintenanceConfig = async () => {
    try {
      const response = await fetch('/api/v1/admin/maintenance/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setMaintenanceConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Failed to load maintenance config:', error);
    }
  };

  const toggleMaintenanceMode = async () => {
    const newEnabled = !maintenanceConfig.enabled;
    setMaintenanceConfig({ ...maintenanceConfig, enabled: newEnabled });
    
    try {
      const response = await fetch('/api/v1/admin/maintenance/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled })
      });
      
      if (response.ok) {
        setMaintenanceStatus({ 
          type: 'success', 
          message: newEnabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled' 
        });
        setTimeout(() => setMaintenanceStatus(null), 3000);
      } else {
        setMaintenanceConfig({ ...maintenanceConfig, enabled: !newEnabled });
        setMaintenanceStatus({ type: 'error', message: 'Failed to toggle maintenance mode' });
      }
    } catch (error) {
      setMaintenanceConfig({ ...maintenanceConfig, enabled: !newEnabled });
      setMaintenanceStatus({ type: 'error', message: 'Failed to toggle maintenance mode' });
    }
  };

  const saveMaintenanceConfig = async () => {
    setSavingMaintenance(true);
    setMaintenanceStatus(null);
    
    try {
      const response = await fetch('/api/v1/admin/maintenance/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceConfig)
      });
      
      if (response.ok) {
        setMaintenanceStatus({ type: 'success', message: 'Maintenance configuration saved successfully!' });
        setTimeout(() => setMaintenanceStatus(null), 3000);
      } else {
        const data = await response.json();
        setMaintenanceStatus({ type: 'error', message: data.error || 'Failed to save configuration' });
      }
    } catch (error) {
      setMaintenanceStatus({ type: 'error', message: 'Failed to save configuration' });
    } finally {
      setSavingMaintenance(false);
    }
  };

  const loadSystemData = async () => {
    try {
      const response = await fetch('/api/v1/admin/system/info', {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data.systemInfo);
        
        // Set predefined operations
        setOperations([
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
            id: 'deploy-standby',
            name: `Deploy to ${deploymentState?.deployTarget || 'STANDBY'}`,
            description: `Deploy latest changes to ${deploymentState?.standbyServer || 'STANDBY'} environment for testing`,
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

      {/* Maintenance Mode Control */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Power className="mr-2 h-5 w-5 text-yellow-600" />
            Maintenance Mode
          </h3>
          <p className="text-sm text-gray-600 mt-1">Control system-wide maintenance mode and scheduled downtime</p>
        </div>
        <div className="p-6">
          {maintenanceStatus && (
            <div className={`mb-4 p-4 rounded-lg ${
              maintenanceStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              maintenanceStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div className="flex items-center">
                {maintenanceStatus.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : 
                 <AlertTriangle className="h-5 w-5 mr-2" />}
                {maintenanceStatus.message}
              </div>
            </div>
          )}

          {/* Status and Toggle */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  maintenanceConfig.enabled ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <Power className={`h-6 w-6 ${
                    maintenanceConfig.enabled ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {maintenanceConfig.enabled ? 'Maintenance Mode Active' : 'System Operational'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {maintenanceConfig.enabled ? 'Users will see the maintenance message' : 'All users can access the system normally'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleMaintenanceMode}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  maintenanceConfig.enabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {maintenanceConfig.enabled ? 'Disable Maintenance' : 'Enable Maintenance'}
              </button>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={maintenanceConfig.message}
                onChange={(e) => setMaintenanceConfig({ ...maintenanceConfig, message: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the message users will see during maintenance..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Scheduled Start (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={maintenanceConfig.scheduledStart || ''}
                  onChange={(e) => setMaintenanceConfig({ ...maintenanceConfig, scheduledStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Scheduled End (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={maintenanceConfig.scheduledEnd || ''}
                  onChange={(e) => setMaintenanceConfig({ ...maintenanceConfig, scheduledEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed IP Addresses (Optional)
              </label>
              <input
                type="text"
                value={maintenanceConfig.allowedIPs?.join(', ') || ''}
                onChange={(e) => setMaintenanceConfig({ 
                  ...maintenanceConfig, 
                  allowedIPs: e.target.value.split(',').map(ip => ip.trim()).filter(ip => ip) 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10.92.3.1, 192.168.1.100 (comma-separated)"
              />
              <p className="mt-1 text-xs text-gray-500">
                These IPs will bypass maintenance mode (useful for admin access)
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={loadMaintenanceConfig}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={saveMaintenanceConfig}
                disabled={savingMaintenance}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {savingMaintenance ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
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
      {['deployment', 'monitoring'].map(category => {
        const categoryOps = operations.filter(op => op.category === category);
        if (categoryOps.length === 0) return null;

        const categoryTitles: Record<string, string> = {
          deployment: 'Deployment',
          monitoring: 'Monitoring'
        };

        return (
          <div key={category} className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                {getCategoryIcon(category)}
                <span className="ml-2">{categoryTitles[category]} Operations</span>
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {categoryOps.map((operation) => (
                <div key={operation.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(operation.status)}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{operation.name}</p>
                      <p className="text-sm text-gray-500 truncate">{operation.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 ml-4">
                    <div className="hidden sm:flex flex-col items-end text-xs text-gray-500">
                      {operation.lastRun && (
                        <span>Last: {new Date(operation.lastRun).toLocaleDateString()}</span>
                      )}
                      {operation.duration && (
                        <span>{operation.duration}s</span>
                      )}
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(operation.status)}`}>
                      {operation.status}
                    </span>
                    <button
                      onClick={() => runOperation(operation)}
                      disabled={runningOperation === operation.id || operation.status === 'running'}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {runningOperation === operation.id ? (
                        <>
                          <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />
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

      {/* Quick Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg">
        <div className="px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Additional System Tools
          </h3>
          <p className="text-sm text-blue-700 mt-1">Access other system management features</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/cache" className="p-4 border border-blue-300 rounded-lg text-left hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">Cache Management</div>
                  <div className="text-sm text-blue-700 mt-1">View and manage application cache</div>
                </div>
              </div>
            </a>
            
            <a href="/admin/health" className="p-4 border border-blue-300 rounded-lg text-left hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">Health Monitoring</div>
                  <div className="text-sm text-blue-700 mt-1">Real-time system health metrics</div>
                </div>
              </div>
            </a>

            <a href="/admin/audit" className="p-4 border border-blue-300 rounded-lg text-left hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">Audit Logs</div>
                  <div className="text-sm text-blue-700 mt-1">View system activity and changes</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
