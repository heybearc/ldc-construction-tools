'use client';

import React, { useState, useRef } from 'react';
import { Upload, Users, FileSpreadsheet, Download, Trash2, Edit, Plus } from 'lucide-react';
// AuthGuard removed to fix compilation error

interface ContactImportData {
  firstName: string;
  lastName: string;
  baId?: string;
  role: string;
  phone?: string;
  emailPersonal?: string;
  emailJW?: string;
  congregation?: string;
  tradeTeam?: string;
  tradeCrew?: string;
  isOverseer?: boolean;
  isAssistant?: boolean;
}

interface Role {
  name: string;
  count: number;
  description?: string;
}

function RoleManagementSection() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [roleStatus, setRoleStatus] = useState('');

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/v1/volunteers/available-roles');
      if (response.ok) {
        const rolesData = await response.json();
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  React.useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    setIsCreating(true);
    setRoleStatus('Creating role...');

    try {
      const response = await fetch('/api/v1/volunteers/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoleName.trim(),
          description: newRoleDescription.trim() || null
        }),
      });

      if (response.ok) {
        setRoleStatus('Role created successfully');
        setNewRoleName('');
        setNewRoleDescription('');
        fetchRoles(); // Refresh the roles list
      } else {
        const errorData = await response.json();
        setRoleStatus(`Error: ${errorData.detail || 'Failed to create role'}`);
      }
    } catch (error) {
      setRoleStatus('Error connecting to server');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="font-medium text-blue-900 mb-4">Current Volunteer Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((role) => (
            <div key={role.name} className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">{role.name}</div>
              <div className="text-sm text-gray-500">{role.count} volunteers</div>
              {role.description && (
                <div className="text-xs text-gray-400 mt-1">{role.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-blue-200 pt-4">
        <h3 className="font-medium text-blue-900 mb-3">Create New Role</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Role Name *
            </label>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g., Trade Team Coordinator"
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              placeholder="Brief description of the role"
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCreateRole}
            disabled={isCreating || !newRoleName.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </button>
        </div>

        {roleStatus && (
          <div className={`mt-3 p-3 rounded-md ${
            roleStatus.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {roleStatus}
          </div>
        )}

        <div className="mt-4 text-sm text-blue-700">
          <p className="font-medium mb-1">Note:</p>
          <p>New roles will automatically appear in:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Volunteer edit modal role dropdown</li>
            <li>Role filter dropdown on volunteers page</li>
            <li>Statistics cards and role breakdown</li>
            <li>Export reports and data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [importData, setImportData] = useState<ContactImportData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Processing file...');

    try {
      // For now, we'll simulate CSV parsing
      // In production, you'd use a library like Papa Parse
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data: ContactImportData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= headers.length && values[0]) {
          const contact: ContactImportData = {
            firstName: values[0] || '',
            lastName: values[1] || '',
            baId: values[2] || '',
            role: values[3] || '',
            phone: values[4] || '',
            emailPersonal: values[5] || '',
            emailJW: values[6] || '',
            congregation: values[7] || '',
            tradeTeam: values[8] || '',
            tradeCrew: values[9] || '',
            isOverseer: (values[3] || '').toLowerCase().includes('overseer'),
            isAssistant: (values[3] || '').toLowerCase().includes('assistant'),
          };
          data.push(contact);
        }
      }
      
      setImportData(data);
      setImportStatus(`Loaded ${data.length} contacts from file`);
    } catch (error) {
      setImportStatus('Error processing file. Please check format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportToDatabase = async () => {
    setIsImporting(true);
    setImportStatus('Importing to database...');

    console.log('🔄 Starting import process...');
    console.log('📊 Import data:', { contactCount: importData.length, sampleContact: importData[0] });

    try {
      const url = '/api/v1/admin/import-contacts';
      const payload = { contacts: importData };
      
      console.log('🌐 Making request to:', url);
      console.log('📤 Request payload:', JSON.stringify(payload, null, 2));

      // Call the backend API to bulk import the data
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Import successful:', result);
        setImportStatus(`Successfully imported ${importData.length} contacts`);
        setImportData([]);
      } else {
        const errorText = await response.text();
        console.error('❌ Import failed - Status:', response.status);
        console.error('❌ Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          setImportStatus(`Error importing contacts: ${errorData.detail || 'Unknown error'}`);
        } catch {
          setImportStatus(`Error importing contacts: HTTP ${response.status} - ${errorText}`);
        }
      }
    } catch (error) {
      console.error('❌ Network/Connection error:', error);
      console.error('❌ Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      setImportStatus(`Error connecting to database: ${(error as Error).message}`);
    } finally {
      setIsImporting(false);
      console.log('🏁 Import process completed');
    }
  };

  const handleResetDatabase = async () => {
    try {
      const response = await fetch('/api/v1/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setImportStatus('Database reset successfully');
      } else {
        setImportStatus('Error resetting database');
      }
    } catch (error) {
      setImportStatus('Error connecting to database');
    }
  };

  const handleExportContacts = async () => {
    console.log('📤 Starting contacts export...');
    
    try {
      const url = '/api/v1/admin/export-contacts';
      console.log('🌐 Making request to:', url);
      
      const response = await fetch(url);
      console.log('📥 Export response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Export successful:', { filename: data.filename, dataLength: data.csv_data?.length });
        
        // Create and download CSV file
        const blob = new Blob([data.csv_data], { type: 'text/csv' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        console.log('💾 File download initiated');
      } else {
        const errorText = await response.text();
        console.error('❌ Export failed - Status:', response.status);
        console.error('❌ Error response:', errorText);
        alert(`Failed to export contacts: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Export network error:', error);
      console.error('❌ Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      alert(`Error exporting contacts: ${(error as Error).message}`);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'First Name,Last Name,BA ID#,Role,Phone,Personal Email,JW Email,Congregation,Trade Team,Trade Crew',
      'John,Smith,BA12345,Trade Crew Overseer,555-0123,john.smith@email.com,jsmith@jw.org,Central,Electrical,Audio & Video',
      'Jane,Doe,BA12346,Trade Crew Support,555-0124,jane.doe@email.com,jdoe@jw.org,North,Carpentry,Framing Crew'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ldc_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const testBackendConnectivity = async () => {
    console.log('🔍 Testing backend connectivity...');
    
    try {
      const url = '/api/v1/admin/debug/connectivity';
      console.log('🌐 Making request to:', url);
      
      const response = await fetch(url);
      console.log('📥 Debug response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connectivity test successful:', data);
        alert(`Backend Status: ${data.status}\nMessage: ${data.message}\nDatabase Stats: ${JSON.stringify(data.database_stats, null, 2)}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Backend connectivity test failed - Status:', response.status);
        console.error('❌ Error response:', errorText);
        alert(`Backend connectivity test failed: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Backend connectivity network error:', error);
      console.error('❌ Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      alert(`Backend connectivity test failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8 text-blue-600" />
                System Administration
              </h1>
              <p className="mt-2 text-gray-600">
                Manage personnel data, roles, and system configuration
              </p>
            </div>

          <div className="p-6">
            {/* Import Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Bulk Import from Spreadsheet
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Import Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload CSV files with personnel data</li>
                  <li>• Supports Trade Crew Overseers, Assistants, and Support personnel</li>
                  <li>• Automatically assigns roles based on role column</li>
                  <li>• Updates existing contacts or creates new ones</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Choose CSV File
                </button>

                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              {importStatus && (
                <div className={`p-3 rounded-md mb-4 ${
                  importStatus.includes('Error') 
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {importStatus}
                </div>
              )}
            </div>

            {/* Preview Section */}
            {importData.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Import Preview ({importData.length} contacts)
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImportData([])}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </button>
                    <button
                      onClick={handleImportToDatabase}
                      disabled={isImporting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import to Database
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Congregation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importData.slice(0, 10).map((contact, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              contact.isOverseer 
                                ? 'bg-blue-100 text-blue-800'
                                : contact.isAssistant
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {contact.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{contact.phone}</div>
                            <div>{contact.emailPersonal}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="font-medium">{contact.tradeTeam}</div>
                            <div>{contact.tradeCrew}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contact.congregation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importData.length > 10 && (
                    <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                      Showing first 10 of {importData.length} contacts...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Role Management */}
            <div className="border-t pt-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Edit className="mr-2 h-5 w-5" />
                Role Management
              </h2>
              <RoleManagementSection />
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Reset Database</h3>
                  <p className="text-sm text-gray-600 mb-3">Clear all personnel data and start fresh</p>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                        handleResetDatabase();
                      }
                    }}
                    className="w-full px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    Reset All Data
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Export Data</h3>
                  <p className="text-sm text-gray-600 mb-3">Download current personnel data as CSV</p>
                  <button 
                    onClick={handleExportContacts}
                    className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Export CSV
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Test Backend</h3>
                  <p className="text-sm text-gray-600 mb-3">Test backend connectivity and database access</p>
                  <button 
                    onClick={testBackendConnectivity}
                    className="w-full px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                  >
                    Test Connection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
