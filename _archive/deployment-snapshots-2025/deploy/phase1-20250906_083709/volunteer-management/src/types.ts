// Type definitions for volunteer-management
export interface VolunteerManagementConfig {
  apiBaseUrl: string;
  version: string;
}

export interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  congregation: string;
  skills: string[];
  availability: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface VolunteerStats {
  total_volunteers: number;
  active_volunteers: number;
  pending_volunteers: number;
  inactive_volunteers: number;
  by_congregation: Record<string, number>;
  by_skills: Record<string, number>;
}

export interface VolunteerAssignment {
  id: number;
  volunteer_id: number;
  project_id: number;
  trade_crew_id: number;
  role: string;
  start_date: string;
  end_date: string;
  status: 'assigned' | 'completed' | 'cancelled';
}

export interface VolunteerManagementModule {
  initialize(config: VolunteerManagementConfig): Promise<void>;
  getVersion(): string;
}

export interface CreateVolunteerRequest {
  name: string;
  email: string;
  phone: string;
  congregation: string;
  skills: string[];
  availability: string;
}

export interface UpdateVolunteerRequest {
  name?: string;
  email?: string;
  phone?: string;
  congregation?: string;
  skills?: string[];
  availability?: string;
  status?: 'active' | 'inactive' | 'pending';
}
