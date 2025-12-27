'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';

interface FeedbackUpdate {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
  hasNewComment: boolean;
  latestCommentAuthor: string | null;
}

export default function FeedbackUpdateBanner() {
  const { data: session } = useSession();
  const [updates, setUpdates] = useState<FeedbackUpdate[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const fetchUpdates = async () => {
      try {
        const response = await fetch('/api/v1/feedback/updates');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUpdates(data.data.updates);
          }
        }
      } catch (error) {
        console.error('Failed to fetch feedback updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
    // Check for updates every 5 minutes
    const interval = setInterval(fetchUpdates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleDismiss = (updateId: string) => {
    setDismissed([...dismissed, updateId]);
    // Store dismissed updates in localStorage
    const stored = localStorage.getItem('dismissedFeedbackUpdates');
    const dismissedList = stored ? JSON.parse(stored) : [];
    dismissedList.push(updateId);
    localStorage.setItem('dismissedFeedbackUpdates', JSON.stringify(dismissedList));
  };

  useEffect(() => {
    // Load dismissed updates from localStorage
    const stored = localStorage.getItem('dismissedFeedbackUpdates');
    if (stored) {
      setDismissed(JSON.parse(stored));
    }
  }, []);

  const visibleUpdates = updates.filter(update => !dismissed.includes(update.id));

  if (loading || visibleUpdates.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {visibleUpdates.map((update) => (
          <div key={update.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-900">
                  {update.hasNewComment ? (
                    <>
                      <strong>{update.latestCommentAuthor}</strong> commented on your feedback:{' '}
                      <strong>{update.title}</strong>
                    </>
                  ) : (
                    <>
                      Your feedback <strong>{update.title}</strong> status changed to{' '}
                      <strong>{update.status}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/help/my-feedback"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Feedback
              </Link>
              <button
                onClick={() => handleDismiss(update.id)}
                className="text-blue-400 hover:text-blue-600"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
