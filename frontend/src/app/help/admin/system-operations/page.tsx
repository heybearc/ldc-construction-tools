'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SystemOperationsHelpPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => router.push('/help/admin')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Admin Help
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ System Operations</h1>
        <p className="text-gray-600">
          Manage system maintenance, monitoring, backups, and cache
        </p>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Overview</h2>
        <p className="text-gray-700 mb-4">
          The System Operations page provides centralized control over critical system functions including:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">🔧</span>
            <span><strong>Maintenance Mode:</strong> Control system-wide downtime for updates and maintenance</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📊</span>
            <span><strong>System Information:</strong> View version, uptime, and environment details</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🚀</span>
            <span><strong>Deployment Operations:</strong> Manage deployments to STANDBY environment</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">💾</span>
            <span><strong>Database Backups:</strong> Create and manage database backups to TrueNAS</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🗄️</span>
            <span><strong>Cache Management:</strong> Monitor and control application cache</span>
          </li>
        </ul>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 Maintenance Mode</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">What is Maintenance Mode?</h3>
          <p className="text-gray-700 mb-4">
            Maintenance mode allows you to temporarily disable user access to the system while you perform updates, 
            maintenance, or troubleshooting. When enabled, users will see a custom message instead of the normal application.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Enable Maintenance Mode</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Navigate to <strong>Admin → System Operations</strong></span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Find the <strong>Maintenance Mode</strong> section at the top of the page</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Click the <strong>"Enable Maintenance"</strong> button (yellow button on the right)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>The status will change to <strong>"Maintenance Mode Active"</strong> with a yellow indicator</span>
            </li>
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Customizing the Maintenance Message</h3>
          <p className="text-gray-700 mb-4">
            You can customize what users see during maintenance:
          </p>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Edit the <strong>Maintenance Message</strong> text area with your custom message</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>(Optional) Set <strong>Scheduled Start</strong> and <strong>Scheduled End</strong> times</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>(Optional) Add <strong>Allowed IP Addresses</strong> that can bypass maintenance mode (comma-separated)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Click <strong>"Save Configuration"</strong> to apply your changes</span>
            </li>
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">IP Whitelist</h3>
          <p className="text-gray-700 mb-4">
            The IP whitelist allows specific IP addresses to bypass maintenance mode. This is useful for:
          </p>
          <ul className="space-y-2 text-gray-700 ml-6">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Allowing admin access during maintenance</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Testing the system before re-enabling for all users</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Permitting specific offices or locations to continue working</span>
            </li>
          </ul>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Example:</strong> Enter <code className="bg-blue-100 px-2 py-1 rounded">10.92.3.1, 192.168.1.100</code> to allow those two IP addresses
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">⚠️ Important Notes</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Users currently logged in will be logged out when maintenance mode is enabled</li>
            <li>• Save your configuration before enabling maintenance mode</li>
            <li>• Remember to disable maintenance mode when you're done!</li>
            <li>• The toggle button changes color: Yellow = Enable, Green = Disable</li>
          </ul>
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🗄️ Cache Management</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">What is Cache?</h3>
          <p className="text-gray-700 mb-4">
            The application cache stores frequently accessed data in memory to improve performance. 
            Over time, cached data can become stale or consume too much memory.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessing Cache Management</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Navigate to <strong>Admin → System Operations</strong></span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Scroll to the bottom <strong>Quick Links</strong> section</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Click <strong>"Cache Management"</strong></span>
            </li>
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Cache Operations</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🗑️ Clear All</h4>
              <p className="text-gray-700">
                Removes all cached data. Use this when you need a complete cache reset or if you suspect 
                cached data is causing issues.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">⏰ Clear Old</h4>
              <p className="text-gray-700">
                Removes cache entries older than 7 days. This helps free up memory while keeping 
                recently accessed data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🚮 Clear Unused</h4>
              <p className="text-gray-700">
                Removes cache entries that haven't been accessed in the last 24 hours. This is the 
                safest option for routine cleanup.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🔄 Warm Cache</h4>
              <p className="text-gray-700">
                Pre-loads frequently accessed data into the cache. Use this after clearing the cache 
                or during off-peak hours to improve performance.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Cache Statistics</h3>
          <p className="text-gray-700 mb-4">
            The Cache Management page displays:
          </p>
          <ul className="space-y-2 text-gray-700 ml-6">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Total Size:</strong> Amount of memory used by cached data</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Item Count:</strong> Number of items currently cached</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Hit Rate:</strong> Percentage of requests served from cache</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Oldest Entry:</strong> Age of the oldest cached item</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Best Practices</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Clear cache during off-peak hours to minimize user impact</li>
            <li>• Use "Clear Unused" for routine maintenance</li>
            <li>• Use "Clear All" only when troubleshooting issues</li>
            <li>• Warm the cache after clearing to restore performance</li>
            <li>• Monitor cache statistics to identify trends</li>
          </ul>
        </div>
      </div>

      {/* Database Backups */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💾 Database Backups</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatic Backups</h3>
          <p className="text-gray-700 mb-4">
            The system automatically backs up the database to TrueNAS every day at 2:00 AM. 
            These backups are stored securely and can be used for disaster recovery.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Manual Backup</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Navigate to <strong>Admin → System Operations</strong></span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Find the <strong>Data Protection</strong> section</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Click the <strong>"▶️ Backup Now"</strong> button</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Wait for the backup to complete (you'll see a success message)</span>
            </li>
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Viewing Backup History</h3>
          <p className="text-gray-700 mb-4">
            Click <strong>"▶ View X Backups"</strong> to see a list of recent backups including:
          </p>
          <ul className="space-y-2 text-gray-700 ml-6">
            <li>• Backup filename</li>
            <li>• File size</li>
            <li>• Date and time created</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">✅ When to Create Manual Backups</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Before making major system changes</li>
            <li>• Before bulk data imports or updates</li>
            <li>• Before deploying new versions</li>
            <li>• When requested by support</li>
          </ul>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 System Information</h2>
        
        <p className="text-gray-700 mb-4">
          The System Information section displays key details about your LDC Tools installation:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <h4 className="font-semibold mb-1">Version</h4>
            <p className="text-sm">Current application version number</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Environment</h4>
            <p className="text-sm">Production or Development</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Uptime</h4>
            <p className="text-sm">How long the system has been running</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Last Deployment</h4>
            <p className="text-sm">When the system was last updated</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Database</h4>
            <p className="text-sm">PostgreSQL version</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Runtime</h4>
            <p className="text-sm">Node.js version</p>
          </div>
        </div>
      </div>

      {/* Server Indicator */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔵 Server Indicator</h2>
        
        <p className="text-gray-700 mb-4">
          Look at the bottom right of any page (in the footer, next to the version number) to see a small colored dot:
        </p>
        
        <div className="space-y-3 text-gray-700 ml-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span><strong>Green dot:</strong> You're on the LIVE server (active production)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <span><strong>Blue dot:</strong> You're on the STANDBY server (testing environment)</span>
          </div>
        </div>

        <p className="text-gray-700 mt-4">
          Hover over the dot to see full server details including server name, status, container number, and IP address.
        </p>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> This indicator helps you quickly verify which environment you're working in, 
            especially useful when testing new features on STANDBY before releasing to LIVE.
          </p>
        </div>
      </div>

      {/* Common Questions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">❓ Common Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: How long should maintenance mode be enabled?</h4>
            <p className="text-gray-700">
              Keep maintenance mode as short as possible. For most updates, 5-15 minutes is sufficient. 
              For major changes, plan for 30-60 minutes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: Will clearing the cache affect users?</h4>
            <p className="text-gray-700">
              Users may experience slightly slower page loads immediately after clearing the cache, 
              but performance will return to normal as the cache rebuilds. Use "Warm Cache" to minimize this impact.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: Where are backups stored?</h4>
            <p className="text-gray-700">
              Backups are stored on TrueNAS, a secure network storage system. They are retained for 30 days 
              and can be restored by system administrators if needed.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: Can I schedule maintenance mode in advance?</h4>
            <p className="text-gray-700">
              Yes! Use the "Scheduled Start" and "Scheduled End" fields to set when maintenance mode should 
              automatically activate and deactivate. This is useful for planned maintenance windows.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: What's the difference between BLUE and GREEN servers?</h4>
            <p className="text-gray-700">
              BLUE and GREEN are the two server environments. One is always LIVE (serving users) and the other 
              is STANDBY (for testing). The server indicator shows which one you're currently on.
            </p>
          </div>
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">📞 Need More Help?</h3>
        <p className="text-gray-700 mb-4">
          If you have questions about system operations or need assistance:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Check the <Link href="/help/troubleshooting" className="text-blue-600 hover:underline">Troubleshooting Guide</Link></span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Review <Link href="/help/admin/audit-logs" className="text-blue-600 hover:underline">Audit Logs</Link> for system activity</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use the <strong>Send Feedback</strong> button to report issues</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Contact your system administrator for advanced support</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
