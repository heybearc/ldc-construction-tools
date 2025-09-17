// Calendar Scheduling Components - Work Assignment Management UI
import React, { useState, useEffect } from 'react';
import {
  WorkAssignment,
  CalendarEvent,
  CalendarViewType,
  AssignmentStatus,
  AssignmentPriority,
  ResourceCapacity,
  SchedulingConflict,
  ConflictSeverity,
  ConfirmationStatus
} from './types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from 'date-fns';

interface CalendarSchedulingDashboardProps {
  regionId: string;
  userId: string;
  onAssignmentSelect?: (assignment: WorkAssignment) => void;
}

export const CalendarSchedulingDashboard: React.FC<CalendarSchedulingDashboardProps> = ({
  regionId,
  userId,
  onAssignmentSelect
}) => {
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [currentView, setCurrentView] = useState<CalendarViewType>(CalendarViewType.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [capacity, setCapacity] = useState<ResourceCapacity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [regionId, currentDate, currentView]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      // Load assignments, conflicts, and capacity data
      // API calls would go here
      setLoading(false);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: AssignmentStatus): string => {
    const colors = {
      [AssignmentStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-300',
      [AssignmentStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 border-blue-300',
      [AssignmentStatus.CONFIRMED]: 'bg-green-100 text-green-800 border-green-300',
      [AssignmentStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [AssignmentStatus.COMPLETED]: 'bg-purple-100 text-purple-800 border-purple-300',
      [AssignmentStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
      [AssignmentStatus.POSTPONED]: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPriorityColor = (priority: AssignmentPriority): string => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600 font-bold'
    };
    return colors[priority] || 'text-gray-600';
  };

  const getViewDates = () => {
    switch (currentView) {
      case CalendarViewType.DAY:
        return [currentDate];
      case CalendarViewType.WEEK:
        return eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        });
      case CalendarViewType.MONTH:
        // Simplified - would show full month grid
        return eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: addDays(endOfWeek(currentDate), 21)
        });
      default:
        return [currentDate];
    }
  };

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter(assignment => 
      isSameDay(assignment.startDate, date) || 
      (assignment.isMultiDay && 
       assignment.startDate <= date && 
       assignment.endDate >= date)
    );
  };

  const getCapacityForDate = (date: Date) => {
    return capacity.find(cap => isSameDay(cap.date, date));
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Assignment Calendar</h2>
          <p className="text-sm text-gray-500">
            {format(currentDate, 'MMMM yyyy')} • {assignments.length} assignments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            New Assignment
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Use Template
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Assignments</div>
          <div className="text-2xl font-bold text-gray-900">{assignments.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Confirmed</div>
          <div className="text-2xl font-bold text-green-600">
            {assignments.filter(a => a.status === AssignmentStatus.CONFIRMED).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">
            {assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Conflicts</div>
          <div className="text-2xl font-bold text-red-600">{conflicts.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Avg Utilization</div>
          <div className="text-2xl font-bold text-purple-600">
            {capacity.length > 0 
              ? Math.round(capacity.reduce((sum, c) => sum + c.utilizationPercentage, 0) / capacity.length)
              : 0}%
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium text-gray-900">
            {format(currentDate, 'MMMM dd, yyyy')}
          </span>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Today
          </button>
        </div>

        <div className="flex space-x-1">
          {Object.values(CalendarViewType).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentView === view
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">
              {conflicts.length} Scheduling Conflict{conflicts.length > 1 ? 's' : ''} Detected
            </h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            {conflicts.slice(0, 3).map(conflict => (
              <div key={conflict.id} className="mb-1">
                • {conflict.description}
              </div>
            ))}
            {conflicts.length > 3 && (
              <div className="text-red-600 font-medium">+ {conflicts.length - 3} more conflicts</div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow border">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {getViewDates().map((date) => {
            const dayAssignments = getAssignmentsForDate(date);
            const dayCapacity = getCapacityForDate(date);
            const isToday = isSameDay(date, new Date());
            
            return (
              <div
                key={date.toISOString()}
                className={`bg-white p-2 min-h-[120px] border-r border-b ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  {dayCapacity && (
                    <div className={`text-xs px-1 py-0.5 rounded ${
                      dayCapacity.utilizationPercentage > 100
                        ? 'bg-red-100 text-red-800'
                        : dayCapacity.utilizationPercentage > 80
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {dayCapacity.utilizationPercentage}%
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayAssignments.slice(0, 3).map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => onAssignmentSelect?.(assignment)}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                        getStatusColor(assignment.status)
                      }`}
                    >
                      <div className="font-medium truncate">{assignment.title}</div>
                      <div className="flex items-center justify-between">
                        <span className="truncate">{assignment.location}</span>
                        <span className={getPriorityColor(assignment.priority)}>
                          {assignment.priority === 'urgent' ? '⚡' : 
                           assignment.priority === 'high' ? '🔥' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {dayAssignments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAssignments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface AssignmentDetailsProps {
  assignment: WorkAssignment;
  onUpdate: (updates: Partial<WorkAssignment>) => void;
  onClose: () => void;
}

export const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({
  assignment,
  onUpdate,
  onClose
}) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(assignment);

  const handleSave = () => {
    onUpdate(formData);
    setEditing(false);
  };

  const getVolunteerStatus = (volunteer: any) => {
    switch (volunteer.confirmationStatus) {
      case ConfirmationStatus.CONFIRMED:
        return 'text-green-600';
      case ConfirmationStatus.DECLINED:
        return 'text-red-600';
      case ConfirmationStatus.PENDING:
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: AssignmentStatus): string => {
    const colors = {
      [AssignmentStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-300',
      [AssignmentStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 border-blue-300',
      [AssignmentStatus.CONFIRMED]: 'bg-green-100 text-green-800 border-green-300',
      [AssignmentStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [AssignmentStatus.COMPLETED]: 'bg-purple-100 text-purple-800 border-purple-300',
      [AssignmentStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
      [AssignmentStatus.POSTPONED]: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPriorityColor = (priority: AssignmentPriority): string => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600 font-bold'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
          <p className="text-sm text-gray-500">
            {format(assignment.startDate, 'MMM dd, yyyy')} - {format(assignment.endDate, 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditing(!editing)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status and Priority */}
        <div className="flex items-center space-x-4">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            getStatusColor(assignment.status)
          }`}>
            {assignment.status.replace('_', ' ')}
          </span>
          <span className={`text-sm font-medium ${getPriorityColor(assignment.priority)}`}>
            {assignment.priority.toUpperCase()} Priority
          </span>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-600">{assignment.description}</p>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Location</h4>
          <p className="text-sm text-gray-600">{assignment.location}</p>
        </div>

        {/* Required Volunteers */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Required Volunteers</h4>
          <div className="space-y-2">
            {assignment.requiredVolunteers.map((req, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{req.skillRequired} ({req.experienceLevel})</span>
                <span className="font-medium">{req.quantity} needed</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Volunteers */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Assigned Volunteers ({assignment.assignedVolunteers.length})
          </h4>
          <div className="space-y-2">
            {assignment.assignedVolunteers.map((volunteer) => (
              <div key={volunteer.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{volunteer.volunteerName}</div>
                  <div className="text-xs text-gray-500">{volunteer.role}</div>
                  <div className="text-xs text-gray-500">
                    Skills: {volunteer.skills.join(', ')}
                  </div>
                </div>
                <span className={`text-xs font-medium ${
                  getVolunteerStatus(volunteer)
                }`}>
                  {volunteer.confirmationStatus.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {assignment.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{assignment.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Duplicate
              </button>
              <button className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700">
                Manage Volunteers
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface CapacityPlanningProps {
  capacity: ResourceCapacity[];
  dateRange: { start: Date; end: Date };
}

export const CapacityPlanning: React.FC<CapacityPlanningProps> = ({
  capacity,
  dateRange
}) => {
  const getUtilizationColor = (percentage: number): string => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    if (percentage > 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity Planning</h3>
      
      <div className="space-y-4">
        {capacity.map((cap) => (
          <div key={`${cap.resourceId}-${cap.date.toISOString()}`} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{cap.resourceName}</h4>
                <p className="text-sm text-gray-500">{format(cap.date, 'MMM dd, yyyy')}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {cap.utilizationPercentage}%
                </div>
                <div className="text-sm text-gray-500">
                  {cap.allocatedCapacity}/{cap.totalCapacity} hours
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  getUtilizationColor(cap.utilizationPercentage)
                }`}
                style={{ width: `${Math.min(cap.utilizationPercentage, 100)}%` }}
              ></div>
            </div>
            
            {cap.overallocation > 0 && (
              <div className="mt-2 text-sm text-red-600">
                ⚠️ Overallocated by {cap.overallocation} hours
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
