'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Power, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  allowedIPs?: string[];
}

export default function MaintenanceModePage() {
  const [config, setConfig] = useState<MaintenanceConfig>({
    enabled: false,
    message: 'LDC Tools is currently undergoing scheduled maintenance. We\'ll be back shortly!',
    allowedIPs: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadMaintenanceConfig();
  }, []);

  const loadMaintenanceConfig = async () => {
    try {
      const response = await fetch('/api/v1/admin/maintenance/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Failed to load maintenance config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    setStatus(null);
    
    try {
      const response = await fetch('/api/v1/admin/maintenance/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setStatus({ type: 'success', message: 'Maintenance configuration saved successfully!' });
      } else {
        const data = await response.json();
        setStatus({ type: 'error', message: data.error || 'Failed to save configuration' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    const newEnabled = !config.enabled;
    setConfig({ ...config, enabled: newEnabled });
    
    try {
      const response = await fetch('/api/v1/admin/maintenance/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled })
      });
      
      if (response.ok) {
        setStatus({ 
          type: 'success', 
          message: newEnabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled' 
        });
      } else {
        setConfig({ ...config, enabled: !newEnabled });
        setStatus({ type: 'error', message: 'Failed to toggle maintenance mode' });
      }
    } catch (error) {
      setConfig({ ...config, enabled: !newEnabled });
      setStatus({ type: 'error', message: 'Failed to toggle maintenance mode' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🛠️ Maintenance Mode</h1>
        <p className="text-gray-600">
          Control system maintenance mode and scheduled downtime
        </p>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`mb-6 p-4 rounded-lg ${
          status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center">
            {status.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : 
             status.type === 'error' ? <AlertTriangle className="h-5 w-5 mr-2" /> : 
             <Settings className="h-5 w-5 mr-2" />}
            {status.message}
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              config.enabled ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <Power className={`h-6 w-6 ${config.enabled ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {config.enabled ? 'Maintenance Mode Active' : 'System Operational'}
              </h2>
              <p className="text-sm text-gray-600">
                {config.enabled ? 'Users will see the maintenance message' : 'All users can access the system normally'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleMaintenanceMode}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              config.enabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {config.enabled ? 'Disable Maintenance' : 'Enable Maintenance'}
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Message</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Display
            </label>
            <textarea
              value={config.message}
              onChange={(e) => setConfig({ ...config, message: e.target.value })}
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
                value={config.scheduledStart || ''}
                onChange={(e) => setConfig({ ...config, scheduledStart: e.target.value })}
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
                value={config.scheduledEnd || ''}
                onChange={(e) => setConfig({ ...config, scheduledEnd: e.target.value })}
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
              value={config.allowedIPs?.join(', ') || ''}
              onChange={(e) => setConfig({ 
                ...config, 
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
              onClick={saveConfiguration}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Maintenance mode will prevent all users from accessing the system</li>
              <li>Admin users with allowed IPs can still access the system</li>
              <li>Scheduled times are in your local timezone</li>
              <li>The system will automatically enable/disable based on scheduled times</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
