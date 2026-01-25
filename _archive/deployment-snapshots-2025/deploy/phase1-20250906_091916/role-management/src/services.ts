// Role Management Service Layer
import { Role, RoleAssignment, Permission, User, RoleModuleConfig } from './types';
import { RoleManagementAPI } from './api';

export class RoleManagementService {
  private api: RoleManagementAPI;

  constructor(config: RoleModuleConfig) {
    this.api = new RoleManagementAPI(config);
  }

  // Enhanced Role Operations
  async getRolesWithStats(): Promise<(Role & { userCount: number; assignmentCount: number })[]> {
    const [roles, assignments] = await Promise.all([
      this.api.getRoles(),
      this.api.getRoleAssignments()
    ]);

    return roles.map(role => ({
      ...role,
      userCount: assignments.filter(a => a.roleId === role.id && a.isActive).length,
      assignmentCount: assignments.filter(a => a.roleId === role.id).length
    }));
  }

  async getUsersWithRoles(): Promise<(User & { roles: Role[]; permissions: Permission[] })[]> {
    const [users, assignments, roles] = await Promise.all([
      this.api.getUsers(),
      this.api.getRoleAssignments(),
      this.api.getRoles()
    ]);

    return users.map(user => {
      const userAssignments = assignments.filter(a => a.userId === user.id && a.isActive);
      const userRoles = roles.filter(role => 
        userAssignments.some(a => a.roleId === role.id)
      );
      const userPermissions = userRoles.flatMap(role => role.permissions || []);

      return {
        ...user,
        roles: userRoles,
        permissions: userPermissions
      };
    });
  }

  // Role Assignment with Validation
  async assignRoleWithValidation(
    userId: string, 
    roleId: string, 
    assignedBy: string,
    regionId?: string
  ): Promise<RoleAssignment> {
    // Check if user already has this role
    const existingAssignments = await this.api.getRoleAssignments({ userId, roleId });
    const activeAssignment = existingAssignments.find(a => a.isActive);

    if (activeAssignment) {
      throw new Error('User already has this role assigned');
    }

    // Get role to validate it exists and is active
    const role = await this.api.getRole(roleId);
    if (!role.isActive) {
      throw new Error('Cannot assign inactive role');
    }

    return this.api.assignRole({
      userId,
      roleId,
      assignedBy,
      regionId,
      isActive: true
    });
  }

  // Permission Checking
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    return this.api.checkPermission(userId, resource, action);
  }

  async getUserEffectivePermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.api.getUserRoles(userId);
    const allPermissions = userRoles.flatMap(role => role.permissions || []);
    
    // Remove duplicates based on permission ID
    const uniquePermissions = allPermissions.filter((permission, index, self) => 
      index === self.findIndex(p => p.id === permission.id)
    );

    return uniquePermissions;
  }

  // Role Hierarchy and Inheritance
  async getRoleHierarchy(): Promise<Role[]> {
    const roles = await this.api.getRoles();
    // Sort by hierarchy level if available, otherwise by name
    return roles.sort((a, b) => {
      if (a.hierarchyLevel !== undefined && b.hierarchyLevel !== undefined) {
        return a.hierarchyLevel - b.hierarchyLevel;
      }
      return a.name.localeCompare(b.name);
    });
  }

  // Bulk Operations
  async bulkAssignRole(userIds: string[], roleId: string, assignedBy: string): Promise<{
    successful: RoleAssignment[];
    failed: { userId: string; error: string }[];
  }> {
    const successful: RoleAssignment[] = [];
    const failed: { userId: string; error: string }[] = [];

    for (const userId of userIds) {
      try {
        const assignment = await this.assignRoleWithValidation(userId, roleId, assignedBy);
        successful.push(assignment);
      } catch (error) {
        failed.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }

  // Audit and Reporting
  async getRoleAssignmentHistory(userId?: string, roleId?: string): Promise<RoleAssignment[]> {
    const assignments = await this.api.getRoleAssignments({ userId, roleId });
    return assignments.sort((a, b) => 
      new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );
  }

  async getPermissionUsageReport(): Promise<{
    permission: Permission;
    roleCount: number;
    userCount: number;
  }[]> {
    const [permissions, roles, assignments] = await Promise.all([
      this.api.getPermissions(),
      this.api.getRoles(),
      this.api.getRoleAssignments()
    ]);

    return permissions.map(permission => {
      const rolesWithPermission = roles.filter(role => 
        role.permissions?.some(p => p.id === permission.id)
      );
      
      const usersWithPermission = assignments.filter(assignment => 
        assignment.isActive && 
        rolesWithPermission.some(role => role.id === assignment.roleId)
      );

      return {
        permission,
        roleCount: rolesWithPermission.length,
        userCount: usersWithPermission.length
      };
    });
  }

  // Role Management Utilities
  async validateRoleStructure(role: Role): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!role.name || role.name.trim().length === 0) {
      errors.push('Role name is required');
    }

    if (!role.description || role.description.trim().length === 0) {
      errors.push('Role description is required');
    }

    if (!role.permissions || role.permissions.length === 0) {
      errors.push('Role must have at least one permission');
    }

    // Check for duplicate permissions
    if (role.permissions) {
      const permissionIds = role.permissions.map(p => p.id);
      const uniqueIds = new Set(permissionIds);
      if (permissionIds.length !== uniqueIds.size) {
        errors.push('Role contains duplicate permissions');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async cloneRole(sourceRoleId: string, newRoleName: string, newRoleDescription: string): Promise<Role> {
    const sourceRole = await this.api.getRole(sourceRoleId);
    
    const newRole = await this.api.createRole({
      name: newRoleName,
      description: newRoleDescription,
      permissions: sourceRole.permissions || [],
      isActive: false, // Start as inactive for review
      hierarchyLevel: sourceRole.hierarchyLevel,
      regionId: sourceRole.regionId
    });

    return newRole;
  }

  // Search and Filtering
  async searchRoles(query: string): Promise<Role[]> {
    const roles = await this.api.getRoles();
    const lowercaseQuery = query.toLowerCase();

    return roles.filter(role => 
      role.name.toLowerCase().includes(lowercaseQuery) ||
      role.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async searchUsers(query: string): Promise<User[]> {
    const users = await this.api.getUsers();
    const lowercaseQuery = query.toLowerCase();

    return users.filter(user => 
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Health and Status
  async getModuleHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: { name: string; status: boolean; message?: string }[];
  }> {
    const checks = [];

    try {
      const healthResponse = await this.api.healthCheck();
      checks.push({
        name: 'API Health',
        status: healthResponse.status === 'ok',
        message: healthResponse.status
      });
    } catch (error) {
      checks.push({
        name: 'API Health',
        status: false,
        message: 'API unreachable'
      });
    }

    try {
      const roles = await this.api.getRoles();
      checks.push({
        name: 'Role Data',
        status: Array.isArray(roles),
        message: `${roles.length} roles loaded`
      });
    } catch (error) {
      checks.push({
        name: 'Role Data',
        status: false,
        message: 'Failed to load roles'
      });
    }

    const healthyChecks = checks.filter(c => c.status).length;
    const totalChecks = checks.length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks > totalChecks / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, checks };
  }
}
