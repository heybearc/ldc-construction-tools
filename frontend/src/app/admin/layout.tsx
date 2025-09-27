'use client';

import React from 'react';
import { Shield, Users, Mail, Activity, BarChart, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const adminModules = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Shield,
      description: 'Admin overview and quick actions'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      description: 'Manage users, roles, and invitations'
    },
    {
      name: 'Email Configuration',
      href: '/admin/email',
      icon: Mail,
      description: 'Configure Gmail and email templates'
    },
    {
      name: 'Health Monitor',
      href: '/admin/health',
      icon: Activity,
      description: 'System health and performance metrics'
    },
    {
      name: 'API Status',
      href: '/admin/api',
      icon: BarChart,
      description: 'API monitoring and performance'
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit',
      icon: FileText,
      description: 'Activity logs and compliance reports'
    },
    {
      name: 'System Operations',
      href: '/admin/system',
      icon: Settings,
      description: 'Backup, restore, and maintenance'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
                <p className="text-sm text-gray-600">LDC Construction Tools Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                WMACS Compliant
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Staging Environment
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Admin Navigation Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {adminModules.map((module) => {
                const Icon = module.icon;
                const isActive = pathname === module.href;
                
                return (
                  <Link
                    key={module.name}
                    href={module.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <div>
                      <div className="font-medium">{module.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{module.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* WMACS Compliance Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">WMACS Protocol</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Staging-first development</li>
                <li>• Battle-tested deployment</li>
                <li>• USLDC-2829-E compliant</li>
                <li>• Role-based access control</li>
              </ul>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
