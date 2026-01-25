// Assignment Workflow API - USLDC-2829-E Compliance
import {
  Assignment,
  AssignmentWorkflow,
  AssignmentStats,
  AssignmentTemplate,
  PreConsultation,
  ImpactAssessment,
  AssignmentCategory,
  AssignmentStatus,
  AssignmentPriority,
  ApprovalLevel,
  AssignmentModuleConfig
} from './types';

export class AssignmentWorkflowAPI {
  private baseUrl: string;
  private config: AssignmentModuleConfig;

  constructor(config: AssignmentModuleConfig) {
    this.baseUrl = config.apiBaseUrl;
    this.config = config;
  }

  // Assignment CRUD Operations
  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    const response = await fetch(`${this.baseUrl}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment)
    });
    return response.json();
  }

  async getAssignment(id: string): Promise<Assignment> {
    const response = await fetch(`${this.baseUrl}/assignments/${id}`);
    return response.json();
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const response = await fetch(`${this.baseUrl}/assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async deleteAssignment(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/assignments/${id}`, {
      method: 'DELETE'
    });
  }

  async getAssignments(filters?: {
    status?: AssignmentStatus;
    category?: AssignmentCategory;
    priority?: AssignmentPriority;
    assigneeId?: string;
    assignerId?: string;
    regionId?: string;
    projectId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Assignment[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/assignments?${params}`);
    return response.json();
  }

  // Workflow Operations
  async createWorkflow(assignmentId: string): Promise<AssignmentWorkflow> {
    const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async getWorkflow(assignmentId: string): Promise<AssignmentWorkflow> {
    const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/workflow`);
    return response.json();
  }

  async advanceWorkflow(assignmentId: string, stepId: string, data?: any): Promise<AssignmentWorkflow> {
    const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/workflow/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId, data })
    });
    return response.json();
  }

  async approveAssignment(assignmentId: string, approverId: string, comments?: string): Promise<AssignmentWorkflow> {
    const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverId, comments })
    });
    return response.json();
  }

  async rejectAssignment(assignmentId: string, approverId: string, reason: string): Promise<AssignmentWorkflow> {
    const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverId, reason })
    });
    return response.json();
  }

  // Pre-Consultation Operations
  async createConsultation(consultation: Omit<PreConsultation, 'id' | 'consultedAt'>): Promise<PreConsultation> {
    const response = await fetch(`${this.baseUrl}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultation)
    });
    return response.json();
  }

  async getConsultations(assignmentId: string): Promise<PreConsultation[]> {
    const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/consultations`);
    return response.json();
  }

  // Impact Assessment Operations
  async createImpactAssessment(assessment: Omit<ImpactAssessment, 'id' | 'assessedAt'>): Promise<ImpactAssessment> {
    const response = await fetch(`${this.baseUrl}/impact-assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    });
    return response.json();
  }

  async getImpactAssessment(assignmentId: string): Promise<ImpactAssessment | null> {
    try {
      const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/impact-assessment`);
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }

  // Template Operations
  async getTemplates(category?: AssignmentCategory): Promise<AssignmentTemplate[]> {
    const params = category ? `?category=${category}` : '';
    const response = await fetch(`${this.baseUrl}/templates${params}`);
    return response.json();
  }

  async createTemplate(template: Omit<AssignmentTemplate, 'id'>): Promise<AssignmentTemplate> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    return response.json();
  }

  // Statistics and Reporting
  async getAssignmentStats(filters?: {
    regionId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<AssignmentStats> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value instanceof Date ? value.toISOString() : value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/stats?${params}`);
    return response.json();
  }

  async getPendingApprovals(approverId: string): Promise<Assignment[]> {
    const response = await fetch(`${this.baseUrl}/pending-approvals/${approverId}`);
    return response.json();
  }

  async getMyAssignments(userId: string, status?: AssignmentStatus): Promise<Assignment[]> {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${this.baseUrl}/users/${userId}/assignments${params}`);
    return response.json();
  }

  // LDC Tech Support Integration
  async submitToLDCTechSupport(assignmentId: string, supportData: {
    issueType: string;
    description: string;
    priority: string;
    attachments?: string[];
  }): Promise<{ ticketId: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/ldc-tech-support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supportData)
    });
    return response.json();
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // Export Operations
  async exportAssignments(filters?: any, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    params.append('format', format);
    
    const response = await fetch(`${this.baseUrl}/assignments/export?${params}`);
    return response.blob();
  }
}
