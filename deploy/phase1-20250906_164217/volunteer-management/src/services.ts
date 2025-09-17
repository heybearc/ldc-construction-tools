// Service layer for volunteer-management
import { VolunteerManagementAPI } from './api';
import { 
  VolunteerManagementConfig, 
  Volunteer, 
  VolunteerStats, 
  VolunteerAssignment,
  CreateVolunteerRequest,
  UpdateVolunteerRequest
} from './types';

export class VolunteerManagementService {
  private api: VolunteerManagementAPI;

  constructor(config: VolunteerManagementConfig) {
    this.api = new VolunteerManagementAPI(config);
  }

  async initialize(): Promise<void> {
    const isHealthy = await this.api.healthCheck();
    if (!isHealthy) {
      throw new Error('Volunteer Management service is not available');
    }
  }

  async getAllVolunteers(page = 1, limit = 20, search?: string): Promise<{ data: Volunteer[], total: number }> {
    return this.api.getVolunteers(page, limit, search);
  }

  async getVolunteerById(id: number): Promise<Volunteer> {
    return this.api.getVolunteer(id);
  }

  async createVolunteer(data: CreateVolunteerRequest): Promise<Volunteer> {
    // Validate required fields
    if (!data.name || !data.email || !data.congregation) {
      throw new Error('Name, email, and congregation are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    return this.api.createVolunteer(data);
  }

  async updateVolunteer(id: number, data: UpdateVolunteerRequest): Promise<Volunteer> {
    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
    }

    return this.api.updateVolunteer(id, data);
  }

  async deleteVolunteer(id: number): Promise<void> {
    return this.api.deleteVolunteer(id);
  }

  async getStats(): Promise<VolunteerStats> {
    return this.api.getVolunteerStats();
  }

  async getVolunteerAssignments(volunteerId: number): Promise<VolunteerAssignment[]> {
    return this.api.getVolunteerAssignments(volunteerId);
  }

  async searchVolunteersBySkill(skill: string): Promise<Volunteer[]> {
    const { data: volunteers } = await this.getAllVolunteers(1, 1000);
    return volunteers.filter(volunteer => 
      volunteer.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
  }

  async getVolunteersByCongregation(congregation: string): Promise<Volunteer[]> {
    const { data: volunteers } = await this.getAllVolunteers(1, 1000);
    return volunteers.filter(volunteer => 
      volunteer.congregation.toLowerCase().includes(congregation.toLowerCase())
    );
  }

  async getActiveVolunteers(): Promise<Volunteer[]> {
    const { data: volunteers } = await this.getAllVolunteers(1, 1000);
    return volunteers.filter(volunteer => volunteer.status === 'active');
  }

  async exportVolunteers(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    return this.api.exportVolunteers(format);
  }

  async bulkUpdateStatus(volunteerIds: number[], status: 'active' | 'inactive' | 'pending'): Promise<void> {
    const promises = volunteerIds.map(id => this.updateVolunteer(id, { status }));
    await Promise.all(promises);
  }

  async getVolunteersByAvailability(availability: string): Promise<Volunteer[]> {
    const { data: volunteers } = await this.getAllVolunteers(1, 1000);
    return volunteers.filter(volunteer => 
      volunteer.availability.toLowerCase().includes(availability.toLowerCase())
    );
  }
}
