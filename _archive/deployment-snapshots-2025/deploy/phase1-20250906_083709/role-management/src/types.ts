// Role Management Types
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  hierarchyLevel?: number;
  regionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
  isActive: boolean;
  regionId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleModuleConfig {
  apiBaseUrl: string;
  version: string;
  features: {
    hierarchicalRoles: boolean;
    regionBasedAccess: boolean;
    auditLogging: boolean;
  };
}