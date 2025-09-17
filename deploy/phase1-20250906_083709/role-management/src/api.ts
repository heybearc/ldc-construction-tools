// Role Management API
import { Role, RoleAssignment, Permission, User, RoleModuleConfig } from './types';

export class RoleManagementAPI {
  private baseUrl: string;
  private config: RoleModuleConfig;

  constructor(config: RoleModuleConfig) {
    this.baseUrl = config.apiBaseUrl;
    this.config = config;
  }

  // Role Operations
  async getRoles(): Promise<Role[]> {
    const response = await fetch(`${this.baseUrl}/roles`);
    return response.json();
  }

  async getRole(id: string): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/roles/${id}`);
    return response.json();
  }

  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(role)
    });
    return response.json();
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/roles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async deleteRole(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/roles/${id}`, {
      method: 'DELETE'
    });
  }

  // Role Assignment Operations
  async getRoleAssignments(filters?: {
    userId?: string;
    roleId?: string;
    isActive?: boolean;
  }): Promise<RoleAssignment[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/role-assignments?${params}`);
    return response.json();
  }

  async assignRole(assignment: Omit<RoleAssignment, 'id' | 'assignedAt'>): Promise<RoleAssignment> {
    const response = await fetch(`${this.baseUrl}/role-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment)
    });
    return response.json();
  }

  async revokeRole(assignmentId: string): Promise<void> {
    await fetch(`${this.baseUrl}/role-assignments/${assignmentId}`, {
      method: 'DELETE'
    });
  }

  // Permission Operations
  async getPermissions(): Promise<Permission[]> {
    const response = await fetch(`${this.baseUrl}/permissions`);
    return response.json();
  }

  async createPermission(permission: Omit<Permission, 'id'>): Promise<Permission> {
    const response = await fetch(`${this.baseUrl}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permission)
    });
    return response.json();
  }

  // User Operations
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/users`);
    return response.json();
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    return response.json();
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/roles`);
    return response.json();
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/permissions`);
    return response.json();
  }

  // Authorization Check
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, resource, action })
    });
    const result = await response.json();
    return result.allowed;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}
