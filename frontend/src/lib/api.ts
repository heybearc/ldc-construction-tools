/**
 * API client for LDC Construction Tools
 */

const API_BASE_URL = '/api/v1';

// Types
export interface TradeTeamSummary {
  id: number;
  name: string;
  crew_count: number;
  total_members: number;
  active_crews: number;
  is_active: boolean;
}

export interface TradeCrewSummary {
  id: number;
  name: string;
  specialization?: string;
  capacity?: number;
  member_count: number;
  overseer_name?: string;
  is_active: boolean;
}

export interface CrewMemberSummary {
  id: number;
  full_name: string;
  role: string;
  phone?: string;
  email_jw?: string;
  congregation?: string;
  is_overseer: boolean;
  is_assistant: boolean;
  is_active: boolean;
}

export interface ProjectSummary {
  id: number;
  name: string;
  project_number?: string;
  location?: string;
  project_type?: string;
  status: string;
  current_phase?: string;
  start_date?: string;
  end_date?: string;
  assignment_count: number;
  active_assignments: number;
  jw_sharepoint_url?: string;
  builder_assistant_url?: string;
  is_active: boolean;
}

export interface ProjectAssignmentSummary {
  id: number;
  trade_crew_name: string;
  trade_team_name: string;
  role_description?: string;
  phase?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  overseer_name?: string;
  overseer_phone?: string;
  overseer_email?: string;
}

// API Client Class
class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Trade Teams
  async getTradeTeams(): Promise<TradeTeamSummary[]> {
    return this.request<TradeTeamSummary[]>('/trade-teams/');
  }

  async getTradeCrews(teamId: number): Promise<TradeCrewSummary[]> {
    return this.request<TradeCrewSummary[]>(`/trade-teams/${teamId}/crews`);
  }

  async getCrewMembers(crewId: number): Promise<CrewMemberSummary[]> {
    return this.request<CrewMemberSummary[]>(`/trade-teams/crews/${crewId}/members`);
  }

  // Projects
  async getProjects(): Promise<ProjectSummary[]> {
    return this.request<ProjectSummary[]>('/projects/');
  }

  async getProject(projectId: number): Promise<ProjectSummary> {
    return this.request<ProjectSummary>(`/projects/${projectId}`);
  }

  async createProject(data: {
    name: string;
    project_number?: string;
    location?: string;
    project_type?: string;
    status: string;
    current_phase?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    jw_sharepoint_url?: string;
    builder_assistant_url?: string;
  }) {
    return this.request('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(projectId: number, data: {
    name?: string;
    project_number?: string;
    location?: string;
    project_type?: string;
    status?: string;
    current_phase?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    jw_sharepoint_url?: string;
    builder_assistant_url?: string;
  }) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: number) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async getProjectAssignments(projectId: number): Promise<ProjectAssignmentSummary[]> {
    return this.request<ProjectAssignmentSummary[]>(`/projects/${projectId}/assignments`);
  }

  async createProjectAssignment(projectId: number, data: {
    trade_crew_id: number;
    role_description?: string;
    phase?: string;
    start_date?: string;
    end_date?: string;
    requirements?: string;
    assignment_notes?: string;
  }) {
    return this.request(`/projects/${projectId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Role Assignments
  async getRoleAssignments(): Promise<any[]> {
    return this.request<any[]>('/role-assignments/');
  }

  async updateRoleAssignment(roleId: number, data: any) {
    return this.request(`/role-assignments/${roleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getRoleStats() {
    return this.request('/role-assignments/stats/summary');
  }

  // Export
  async exportTradeTeams(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/trade-teams`);
    if (!response.ok) {
      throw new Error(`Export Error: ${response.status} ${response.statusText}`);
    }
    return response.blob();
  }

  async exportProject(projectId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/projects/${projectId}`);
    if (!response.ok) {
      throw new Error(`Export Error: ${response.status} ${response.statusText}`);
    }
    return response.blob();
  }

  async exportContacts(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/contacts`);
    if (!response.ok) {
      throw new Error(`Export Error: ${response.status} ${response.statusText}`);
    }
    return response.blob();
  }
}

export const apiClient = new ApiClient();
