// Calendar Scheduling API - Work Assignment Management
import {
  WorkAssignment,
  CalendarView,
  CalendarEvent,
  ResourceCapacity,
  SchedulingConflict,
  SchedulingTemplate,
  SchedulingStats,
  SchedulingNotification,
  AssignmentStatus,
  AssignmentPriority,
  CalendarViewType,
  CalendarFilters,
  ResourceType,
  ConflictSeverity,
  CalendarModuleConfig
} from './types';

export class CalendarSchedulingAPI {
  private baseUrl: string;
  private config: CalendarModuleConfig;

  constructor(config: CalendarModuleConfig) {
    this.baseUrl = config.apiBaseUrl;
    this.config = config;
  }

  // Work Assignment CRUD Operations
  async createWorkAssignment(assignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkAssignment> {
    const response = await fetch(`${this.baseUrl}/work-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment)
    });
    return response.json();
  }

  async getWorkAssignment(id: string): Promise<WorkAssignment> {
    const response = await fetch(`${this.baseUrl}/work-assignments/${id}`);
    return response.json();
  }

  async updateWorkAssignment(id: string, updates: Partial<WorkAssignment>): Promise<WorkAssignment> {
    const response = await fetch(`${this.baseUrl}/work-assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async deleteWorkAssignment(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/work-assignments/${id}`, {
      method: 'DELETE'
    });
  }

  async getWorkAssignments(filters?: {
    startDate?: Date;
    endDate?: Date;
    tradeTeamId?: string;
    tradeCrewId?: string;
    projectId?: string;
    regionId?: string;
    status?: AssignmentStatus;
    priority?: AssignmentPriority;
    limit?: number;
    offset?: number;
  }): Promise<WorkAssignment[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/work-assignments?${params}`);
    return response.json();
  }

  // Calendar View Operations
  async createCalendarView(view: Omit<CalendarView, 'id' | 'assignments'>): Promise<CalendarView> {
    const response = await fetch(`${this.baseUrl}/calendar-views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(view)
    });
    return response.json();
  }

  async getCalendarView(id: string): Promise<CalendarView> {
    const response = await fetch(`${this.baseUrl}/calendar-views/${id}`);
    return response.json();
  }

  async getCalendarEvents(filters: {
    startDate: Date;
    endDate: Date;
    viewType: CalendarViewType;
    filters?: CalendarFilters;
  }): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      viewType: filters.viewType
    });

    if (filters.filters) {
      Object.entries(filters.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/calendar-events?${params}`);
    return response.json();
  }

  // Resource Capacity Management
  async getResourceCapacity(filters: {
    startDate: Date;
    endDate: Date;
    resourceType?: ResourceType;
    resourceIds?: string[];
  }): Promise<ResourceCapacity[]> {
    const params = new URLSearchParams({
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString()
    });

    if (filters.resourceType) {
      params.append('resourceType', filters.resourceType);
    }

    if (filters.resourceIds) {
      filters.resourceIds.forEach(id => params.append('resourceIds', id));
    }
    
    const response = await fetch(`${this.baseUrl}/resource-capacity?${params}`);
    return response.json();
  }

  async updateResourceCapacity(resourceId: string, date: Date, capacity: number): Promise<ResourceCapacity> {
    const response = await fetch(`${this.baseUrl}/resource-capacity/${resourceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: date.toISOString(), capacity })
    });
    return response.json();
  }

  // Conflict Detection and Management
  async detectConflicts(assignmentId?: string): Promise<SchedulingConflict[]> {
    const params = assignmentId ? `?assignmentId=${assignmentId}` : '';
    const response = await fetch(`${this.baseUrl}/conflicts/detect${params}`);
    return response.json();
  }

  async getConflicts(filters?: {
    severity?: ConflictSeverity;
    resolved?: boolean;
    assignmentId?: string;
    resourceId?: string;
  }): Promise<SchedulingConflict[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/conflicts?${params}`);
    return response.json();
  }

  async resolveConflict(conflictId: string, resolution: string, resolvedBy: string): Promise<SchedulingConflict> {
    const response = await fetch(`${this.baseUrl}/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution, resolvedBy })
    });
    return response.json();
  }

  // Template Management
  async createTemplate(template: Omit<SchedulingTemplate, 'id' | 'createdAt'>): Promise<SchedulingTemplate> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    return response.json();
  }

  async getTemplates(filters?: {
    tradeTeamId?: string;
    isActive?: boolean;
  }): Promise<SchedulingTemplate[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/templates?${params}`);
    return response.json();
  }

  async createFromTemplate(templateId: string, customizations: {
    startDate: Date;
    endDate?: Date;
    projectId: string;
    location: string;
    notes?: string;
  }): Promise<WorkAssignment> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}/create-assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...customizations,
        startDate: customizations.startDate.toISOString(),
        endDate: customizations.endDate?.toISOString()
      })
    });
    return response.json();
  }

  // Volunteer Assignment Management
  async assignVolunteer(assignmentId: string, volunteerId: string, role: string): Promise<WorkAssignment> {
    const response = await fetch(`${this.baseUrl}/work-assignments/${assignmentId}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerId, role })
    });
    return response.json();
  }

  async removeVolunteer(assignmentId: string, volunteerId: string): Promise<WorkAssignment> {
    const response = await fetch(`${this.baseUrl}/work-assignments/${assignmentId}/volunteers/${volunteerId}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  async confirmVolunteer(assignmentId: string, volunteerId: string, confirmed: boolean, notes?: string): Promise<WorkAssignment> {
    const response = await fetch(`${this.baseUrl}/work-assignments/${assignmentId}/volunteers/${volunteerId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed, notes })
    });
    return response.json();
  }

  // Statistics and Reporting
  async getSchedulingStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    regionId?: string;
    tradeTeamId?: string;
  }): Promise<SchedulingStats> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/stats?${params}`);
    return response.json();
  }

  async getCapacityReport(filters: {
    startDate: Date;
    endDate: Date;
    resourceType?: ResourceType;
    regionId?: string;
  }): Promise<{
    summary: {
      averageUtilization: number;
      peakUtilization: number;
      underutilizedDays: number;
      overallocatedDays: number;
    };
    details: ResourceCapacity[];
  }> {
    const params = new URLSearchParams({
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString()
    });

    if (filters.resourceType) {
      params.append('resourceType', filters.resourceType);
    }
    if (filters.regionId) {
      params.append('regionId', filters.regionId);
    }
    
    const response = await fetch(`${this.baseUrl}/reports/capacity?${params}`);
    return response.json();
  }

  // Notification Management
  async getNotifications(recipientId: string, filters?: {
    type?: string;
    status?: string;
    assignmentId?: string;
  }): Promise<SchedulingNotification[]> {
    const params = new URLSearchParams({ recipientId });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/notifications?${params}`);
    return response.json();
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
      method: 'POST'
    });
  }

  // JW Hub Integration
  async syncWithJWHub(assignmentId: string): Promise<{ success: boolean; syncId: string }> {
    if (!this.config.features.jwHubIntegration) {
      throw new Error('JW Hub integration not enabled');
    }

    const response = await fetch(`${this.baseUrl}/work-assignments/${assignmentId}/sync-jw-hub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async getJWHubSyncStatus(assignmentId: string): Promise<{
    status: string;
    lastSync: Date | null;
    errors: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/work-assignments/${assignmentId}/jw-hub-status`);
    return response.json();
  }

  // Bulk Operations
  async bulkUpdateAssignments(updates: {
    assignmentIds: string[];
    updates: Partial<WorkAssignment>;
  }): Promise<{ updated: number; errors: string[] }> {
    const response = await fetch(`${this.baseUrl}/work-assignments/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async bulkAssignVolunteers(assignments: {
    assignmentId: string;
    volunteerId: string;
    role: string;
  }[]): Promise<{ assigned: number; errors: string[] }> {
    const response = await fetch(`${this.baseUrl}/volunteers/bulk-assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments })
    });
    return response.json();
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // Export Operations
  async exportCalendar(filters: {
    startDate: Date;
    endDate: Date;
    format: 'ics' | 'csv' | 'xlsx';
    filters?: CalendarFilters;
  }): Promise<Blob> {
    const params = new URLSearchParams({
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      format: filters.format
    });

    if (filters.filters) {
      Object.entries(filters.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/export/calendar?${params}`);
    return response.blob();
  }
}
