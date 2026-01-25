// API layer for volunteer-management
import { 
  VolunteerManagementConfig, 
  Volunteer, 
  VolunteerStats, 
  VolunteerAssignment,
  CreateVolunteerRequest,
  UpdateVolunteerRequest
} from './types';

export class VolunteerManagementAPI {
  private config: VolunteerManagementConfig;

  constructor(config: VolunteerManagementConfig) {
    this.config = config;
  }

  async getVolunteers(page = 1, limit = 20, search?: string): Promise<{ data: Volunteer[], total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/volunteers?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch volunteers: ${response.statusText}`);
    }
    return response.json();
  }

  async getVolunteer(id: number): Promise<Volunteer> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/volunteers/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch volunteer: ${response.statusText}`);
    }
    return response.json();
  }

  async createVolunteer(data: CreateVolunteerRequest): Promise<Volunteer> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/volunteers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create volunteer: ${response.statusText}`);
    }
    return response.json();
  }

  async updateVolunteer(id: number, data: UpdateVolunteerRequest): Promise<Volunteer> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/volunteers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update volunteer: ${response.statusText}`);
    }
    return response.json();
  }

  async deleteVolunteer(id: number): Promise<void> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/volunteers/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete volunteer: ${response.statusText}`);
    }
  }

  async getVolunteerStats(): Promise<VolunteerStats> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/volunteers/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch volunteer stats: ${response.statusText}`);
    }
    return response.json();
  }

  async getVolunteerAssignments(volunteerId: number): Promise<VolunteerAssignment[]> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/volunteers/${volunteerId}/assignments`);
    if (!response.ok) {
      throw new Error(`Failed to fetch volunteer assignments: ${response.statusText}`);
    }
    return response.json();
  }

  async exportVolunteers(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/export?type=volunteers&format=${format}`);
    if (!response.ok) {
      throw new Error(`Failed to export volunteers: ${response.statusText}`);
    }
    return response.blob();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/v1/volunteers/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
