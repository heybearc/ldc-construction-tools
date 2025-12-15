'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [feedbackType, setFeedbackType] = useState('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType.toUpperCase(),
          title,
          description,
          priority: priority.toUpperCase()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-900 mb-4">Feedback Submitted!</h1>
          <p className="text-green-700 mb-6">
            Thank you for your feedback. Your input helps us improve LDC Tools.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setSubmitted(false);
                setTitle('');
                setDescription('');
                setFeedbackType('bug');
                setPriority('medium');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Submit Another
            </button>
            <Link
              href="/help"
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors inline-block"
            >
              Back to Help
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💡 Send Feedback</h1>
        <p className="text-gray-600">
          Help us improve LDC Tools by reporting bugs, suggesting enhancements, or requesting new features.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feedback Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'bug', label: '🐛 Bug Report', desc: 'Something is broken or not working correctly' },
                { value: 'enhancement', label: '⚡ Enhancement', desc: 'Improve an existing feature' },
                { value: 'feature', label: '✨ New Feature', desc: 'Request a completely new feature' }
              ].map((type) => (
                <label key={type.value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="feedbackType"
                    value={type.value}
                    checked={feedbackType === type.value}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-lg p-4 transition-colors ${
                    feedbackType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-gray-900 mb-1">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief summary of your feedback"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                feedbackType === 'bug' 
                  ? "Please describe the bug, steps to reproduce it, and what you expected to happen..."
                  : feedbackType === 'enhancement'
                  ? "Please describe the current behavior and how you'd like it to be improved..."
                  : "Please describe the new feature you'd like to see and how it would help you..."
              }
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low - Nice to have</option>
              <option value="medium">Medium - Would be helpful</option>
              <option value="high">High - Important for my work</option>
              <option value="urgent">Urgent - Blocking my work</option>
            </select>
          </div>

          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Your Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> {session?.user?.name || 'Unknown'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'Unknown'}</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/help"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
