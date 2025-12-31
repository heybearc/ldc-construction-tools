'use client';

import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, CheckCircle, AlertTriangle, HardDrive, Clock } from 'lucide-react';

interface CacheStats {
  totalSize: string;
  itemCount: number;
  oldestEntry: string;
  newestEntry: string;
  hitRate: string;
}

interface CacheItem {
  key: string;
  size: string;
  created: string;
  accessed: string;
  hits: number;
}

export default function CacheManagementPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [items, setItems] = useState<CacheItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [warming, setWarming] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadCacheData();
  }, []);

  const loadCacheData = async () => {
    setLoading(true);
    try {
      const [statsRes, itemsRes] = await Promise.all([
        fetch('/api/v1/admin/cache/stats'),
        fetch('/api/v1/admin/cache/items')
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load cache data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (type: 'all' | 'old' | 'unused') => {
    if (!confirm(`Are you sure you want to clear ${type} cache entries? This action cannot be undone.`)) {
      return;
    }

    setClearing(true);
    setStatus(null);

    try {
      const response = await fetch('/api/v1/admin/cache/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({ 
          type: 'success', 
          message: `Successfully cleared ${data.cleared} cache entries` 
        });
        loadCacheData();
      } else {
        setStatus({ type: 'error', message: 'Failed to clear cache' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to clear cache' });
    } finally {
      setClearing(false);
    }
  };

  const warmCache = async () => {
    setWarming(true);
    setStatus(null);

    try {
      const response = await fetch('/api/v1/admin/cache/warm', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({ 
          type: 'success', 
          message: `Cache warmed with ${data.warmed} entries` 
        });
        loadCacheData();
      } else {
        setStatus({ type: 'error', message: 'Failed to warm cache' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to warm cache' });
    } finally {
      setWarming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💾 Cache Management</h1>
        <p className="text-gray-600">
          Monitor and manage application cache for optimal performance
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
             <AlertTriangle className="h-5 w-5 mr-2" />}
            {status.message}
          </div>
        </div>
      )}

      {/* Cache Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSize}</p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Item Count</p>
                <p className="text-2xl font-bold text-gray-900">{stats.itemCount}</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hit Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hitRate}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Oldest Entry</p>
                <p className="text-sm font-semibold text-gray-900">{stats.oldestEntry}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Cache Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Operations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => clearCache('all')}
            disabled={clearing}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
            <span>Clear All</span>
          </button>

          <button
            onClick={() => clearCache('old')}
            disabled={clearing}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Clock className="h-5 w-5" />
            <span>Clear Old</span>
          </button>

          <button
            onClick={() => clearCache('unused')}
            disabled={clearing}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
            <span>Clear Unused</span>
          </button>

          <button
            onClick={warmCache}
            disabled={warming}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${warming ? 'animate-spin' : ''}`} />
            <span>Warm Cache</span>
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={loadCacheData}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Cache Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cache Entries</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Accessed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No cache entries found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.key}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.size}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.hits}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.created}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.accessed}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Cache Management Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Clear All:</strong> Removes all cache entries (use with caution)</li>
              <li><strong>Clear Old:</strong> Removes entries older than 7 days</li>
              <li><strong>Clear Unused:</strong> Removes entries not accessed in 24 hours</li>
              <li><strong>Warm Cache:</strong> Pre-loads frequently accessed data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
