'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminHelpPage() {
  const router = useRouter();

  const adminTopics = [
    {
      title: 'User Management',
      description: 'Add, edit, and manage user accounts and permissions',
      icon: '👥',
      topics: [
        { title: 'Inviting New Users', href: '/help/admin/invitations' },
        { title: 'Understanding User Roles', href: '/help/admin/user-roles' },
        { title: 'Managing User Roles', href: '/help/admin/roles' },
        { title: 'Deactivating Users', href: '/help/admin/users' }
      ]
    },
    {
      title: 'Email Configuration',
      description: 'Set up email for invitations and notifications',
      icon: '📧',
      topics: [
        { title: 'Gmail Setup Guide', href: '/help/admin/email-config' },
        { title: 'Testing Email', href: '/help/admin/email-config#testing' },
        { title: 'Troubleshooting Email', href: '/help/admin/email-config#troubleshooting' }
      ]
    },
    {
      title: 'Organization Management',
      description: 'Manage branches, zones, regions, and construction groups',
      icon: '🏢',
      topics: [
        { title: 'Organization Hierarchy', href: '/help/organization' },
        { title: 'Construction Group Settings', href: '/help/organization/cg-settings' },
        { title: 'Project URL Configuration', href: '/help/organization/project-urls' }
      ]
    },
    {
      title: 'System Administration',
      description: 'System settings, health monitoring, and maintenance',
      icon: '⚙️',
      topics: [
        { title: 'System Health', href: '/admin/system' },
        { title: 'Audit Logs', href: '/help/admin/audit-logs' },
        { title: 'Backup & Recovery', href: '/help/admin/backup' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => router.push('/help')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Help Center
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Admin Panel Help</h1>
        <p className="text-gray-600">
          Comprehensive guides for system administrators and Construction Group overseers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {adminTopics.map((section) => (
          <div key={section.title} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start mb-4">
              <span className="text-4xl mr-3">{section.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{section.title}</h2>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {section.topics.map((topic) => (
                <li key={topic.title}>
                  <Link
                    href={topic.href}
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    <span className="mr-2">→</span>
                    {topic.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">📚 What's New in v1.8.2</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">✨</span>
            <span><strong>User Invitations:</strong> Send email invitations to new users with personalized welcome messages</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔧</span>
            <span><strong>Email Configuration:</strong> Improved email setup with better error handling and testing</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🏢</span>
            <span><strong>CG Settings:</strong> Configure Builder Assistant project links per Construction Group</span>
          </li>
        </ul>
        <Link
          href="/help/release-notes"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          View Full Release Notes →
        </Link>
      </div>
    </div>
  );
}
