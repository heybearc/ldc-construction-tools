'use client';

import { useState, useEffect } from 'react';
import { X, Bell, Mail, Users } from 'lucide-react';

interface NotificationSettings {
  projectId: string;
  projectName: string;
  availableRoles: Array<{ name: string; displayName: string }>;
  assignedUsers: Array<{
    userId: string;
    name: string | null;
    email: string;
    roleName: string;
    roleDisplayName: string;
  }>;
  assignedCrews: Array<{
    crewId: string;
    crewName: string;
  }>;
}

interface ScheduleChangeNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  scheduleVersionId: string;
  onSuccess?: () => void;
}

export default function ScheduleChangeNotificationModal({
  isOpen,
  onClose,
  projectId,
  scheduleVersionId,
  onSuccess
}: ScheduleChangeNotificationModalProps) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [changeDescription, setChangeDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchSettings();
    }
  }, [isOpen, projectId]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/schedule/notification-settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notification settings:', err);
    }
  };

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/schedule/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleVersionId,
          changeDescription,
          sendNotifications,
          notifyRoles: selectedRoles
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          resetForm();
        }, 2000);
      } else {
        setError(data.error || 'Failed to send notifications');
      }
    } catch (err) {
      setError('Error sending notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setChangeDescription('');
    setSendNotifications(false);
    setSelectedRoles([]);
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  const recipientCount = settings?.assignedUsers.filter(u =>
    selectedRoles.includes(u.roleName)
  ).length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Schedule Change Notification
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Notification Sent!
              </h3>
              <p className="text-green-700">
                {sendNotifications
                  ? `Email notifications sent to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`
                  : 'Announcement created successfully'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Project Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Project:</strong> {settings?.projectName || 'Loading...'}
                </p>
              </div>

              {/* Change Description */}
              <div>
                <label htmlFor="changeDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  What Changed? *
                </label>
                <textarea
                  id="changeDescription"
                  required
                  rows={4}
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what changed in the schedule (e.g., 'Moved drywall installation from Week 3 to Week 4 due to material delays')"
                />
                <p className="mt-1 text-sm text-gray-500">
                  This description will be included in the announcement and email notifications.
                </p>
              </div>

              {/* Send Notifications Checkbox */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendNotifications}
                    onChange={(e) => setSendNotifications(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        Send email notifications
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Notify assigned users about this schedule change via email
                    </p>
                  </div>
                </label>
              </div>

              {/* Role Selection */}
              {sendNotifications && settings && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="h-5 w-5 text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Who should be notified?
                    </label>
                  </div>
                  
                  {settings.availableRoles.length > 0 ? (
                    <div className="space-y-2">
                      {settings.availableRoles.map((role) => {
                        const userCount = settings.assignedUsers.filter(
                          u => u.roleName === role.name
                        ).length;
                        
                        return (
                          <label
                            key={role.name}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(role.name)}
                              onChange={() => handleRoleToggle(role.name)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {role.displayName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userCount} user{userCount !== 1 ? 's' : ''} assigned
                              </div>
                            </div>
                          </label>
                        );
                      })}
                      
                      {settings.assignedCrews.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-sm text-gray-700">
                            <strong>Note:</strong> Crew members assigned to this project will also be notified.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No users assigned to this project yet.
                    </p>
                  )}

                  {selectedRoles.length > 0 && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        📧 <strong>{recipientCount}</strong> recipient{recipientCount !== 1 ? 's' : ''} will receive email notifications
                      </p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !changeDescription.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>{sendNotifications ? 'Create & Notify' : 'Create Announcement'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
