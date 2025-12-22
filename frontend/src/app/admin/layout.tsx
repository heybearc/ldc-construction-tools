'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Users, Mail, Activity, BarChart, FileText, Settings, MessageSquare, FolderTree, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [environment, setEnvironment] = useState<string>('');
  
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('green')) {
      setEnvironment('GREEN');
    } else if (hostname.includes('blue')) {
      setEnvironment('BLUE');
    } else if (hostname === 'ldctools.com' || hostname === 'www.ldctools.com') {
      setEnvironment('PRODUCTION');
    } else {
      setEnvironment('DEVELOPMENT');
    }
  }, []);

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
      name: 'Announcements',
      href: '/admin/announcements',
      icon: Bell,
      description: 'Manage site-wide and CG announcements'
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
      description: 'View system audit logs'
    },
    {
      name: 'System Settings',
      href: '/admin/system',
      icon: Settings,
      description: 'System configuration and settings'
    },
    {
      name: 'Feedback',
      href: '/admin/feedback',
      icon: MessageSquare,
      description: 'User feedback and suggestions'
    },
    {
      name: 'Organization',
      href: '/admin/organization',
      icon: FolderTree,
      description: 'Manage organizational hierarchy'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-500">
                System administration and configuration
              </p>
            </div>
            {environment && (
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                environment === 'PRODUCTION' ? 'bg-green-100 text-green-800' :
                environment === 'BLUE' ? 'bg-blue-100 text-blue-800' :
                environment === 'GREEN' ? 'bg-emerald-100 text-emerald-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {environment}
              </div>
            )}
          </div>
        </div>

        {pathname === '/admin' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center mb-3">
                    <Icon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {module.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
