// Assignment Workflow Components - USLDC-2829-E Compliance UI
import React, { useState, useEffect } from 'react';
import {
  Assignment,
  AssignmentWorkflow,
  AssignmentStatus,
  AssignmentCategory,
  AssignmentPriority,
  ApprovalStatus,
  StepStatus,
  PreConsultation,
  ImpactAssessment
} from './types';

interface AssignmentWorkflowDashboardProps {
  userId: string;
  regionId: string;
  onAssignmentSelect?: (assignment: Assignment) => void;
}

export const AssignmentWorkflowDashboard: React.FC<AssignmentWorkflowDashboardProps> = ({
  userId,
  regionId,
  onAssignmentSelect
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Assignment[]>([]);
  const [activeFilter, setActiveFilter] = useState<AssignmentStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId, regionId, activeFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load assignments and pending approvals
      // API calls would go here
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: AssignmentStatus): string => {
    const colors = {
      [AssignmentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [AssignmentStatus.PENDING_CONSULTATION]: 'bg-yellow-100 text-yellow-800',
      [AssignmentStatus.PENDING_APPROVAL]: 'bg-orange-100 text-orange-800',
      [AssignmentStatus.APPROVED]: 'bg-green-100 text-green-800',
      [AssignmentStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
      [AssignmentStatus.COMPLETED]: 'bg-purple-100 text-purple-800',
      [AssignmentStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [AssignmentStatus.REJECTED]: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: AssignmentPriority): string => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Assignment Workflow</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          New Assignment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Assignments</div>
          <div className="text-2xl font-bold text-gray-900">{assignments.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Pending Approvals</div>
          <div className="text-2xl font-bold text-orange-600">{pendingApprovals.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-blue-600">
            {assignments.filter(a => a.status === AssignmentStatus.ACTIVE).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {(['all', ...Object.values(AssignmentStatus)] as const).map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Assignments</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-6 hover:bg-gray-50 cursor-pointer"
              onClick={() => onAssignmentSelect?.(assignment)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{assignment.title}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{assignment.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Category: {assignment.category.replace('_', ' ')}</span>
                    <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                    {assignment.estimatedHours && (
                      <span>Est. Hours: {assignment.estimatedHours}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {assignment.approvalRequired && (
                    <div className="text-xs text-orange-600 font-medium">
                      Approval Required
                    </div>
                  )}
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface WorkflowProgressProps {
  workflow: AssignmentWorkflow;
  onStepClick?: (stepId: string) => void;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  workflow,
  onStepClick
}) => {
  const getStepStatus = (step: any) => {
    switch (step.status) {
      case StepStatus.COMPLETED:
        return 'bg-green-500';
      case StepStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case StepStatus.FAILED:
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Progress</h3>
      
      <div className="space-y-4">
        {workflow.steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatus(step)}`}>
              {step.status === StepStatus.COMPLETED ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-white text-sm font-medium">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                <span className="text-xs text-gray-500">
                  {step.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-500">{step.description}</p>
              {step.completedAt && (
                <p className="text-xs text-gray-400">
                  Completed: {new Date(step.completedAt).toLocaleString()}
                </p>
              )}
            </div>
            
            {step.status === StepStatus.PENDING && onStepClick && (
              <button
                onClick={() => onStepClick(step.id)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Take Action
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Approvers Section */}
      {workflow.approvers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Required Approvals</h4>
          <div className="space-y-2">
            {workflow.approvers.map((approver) => (
              <div key={approver.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-900">{approver.role}</span>
                  {approver.comments && (
                    <p className="text-xs text-gray-500">{approver.comments}</p>
                  )}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  approver.status === ApprovalStatus.APPROVED
                    ? 'bg-green-100 text-green-800'
                    : approver.status === ApprovalStatus.REJECTED
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {approver.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface AssignmentFormProps {
  assignment?: Assignment;
  onSave: (assignment: Partial<Assignment>) => void;
  onCancel: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  assignment,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    category: assignment?.category || AssignmentCategory.FIELD_ASSIGNED,
    priority: assignment?.priority || 'medium' as AssignmentPriority,
    assigneeId: assignment?.assigneeId || '',
    startDate: assignment?.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : '',
    estimatedHours: assignment?.estimatedHours || 0,
    requiredSkills: assignment?.requiredSkills?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      startDate: new Date(formData.startDate),
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {assignment ? 'Edit Assignment' : 'New Assignment'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as AssignmentCategory})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(AssignmentCategory).map((category) => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value as AssignmentPriority})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(AssignmentPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Estimated Hours</label>
            <input
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({...formData, estimatedHours: parseInt(e.target.value)})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
          <input
            type="text"
            value={formData.requiredSkills}
            onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="carpentry, electrical, plumbing"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
          >
            {assignment ? 'Update' : 'Create'} Assignment
          </button>
        </div>
      </form>
    </div>
  );
};
