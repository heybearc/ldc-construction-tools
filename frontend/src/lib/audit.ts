import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'EXPORT'
  | 'IMPORT'
  | 'INVITE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'PASSWORD_CHANGE'
  | 'ROLE_CHANGE'
  | 'CONFIG_CHANGE';

export type AuditResource = 
  | 'USER'
  | 'SESSION'
  | 'PROJECT'
  | 'ROLE'
  | 'ROLE_ASSIGNMENT'
  | 'TRADE_TEAM'
  | 'CREW'
  | 'EMAIL_CONFIG'
  | 'INVITATION'
  | 'SYSTEM';

interface AuditLogParams {
  userId?: string | null;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    // Try to get IP and user agent from headers if not provided
    let ipAddress = params.ipAddress;
    let userAgent = params.userAgent;
    
    if (!ipAddress || !userAgent) {
      try {
        const headersList = await headers();
        ipAddress = ipAddress || headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
        userAgent = userAgent || headersList.get('user-agent') || undefined;
      } catch {
        // Headers not available (e.g., in non-request context)
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        oldValues: params.oldValues || undefined,
        newValues: params.newValues || undefined,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Log a user login event
 */
export async function logUserLogin(userId: string, email: string): Promise<void> {
  await createAuditLog({
    userId,
    action: 'LOGIN',
    resource: 'SESSION',
    newValues: { email, loginTime: new Date().toISOString() },
  });
}

/**
 * Log a user logout event
 */
export async function logUserLogout(userId: string, email: string): Promise<void> {
  await createAuditLog({
    userId,
    action: 'LOGOUT',
    resource: 'SESSION',
    newValues: { email, logoutTime: new Date().toISOString() },
  });
}

/**
 * Log a resource creation
 */
export async function logCreate(
  userId: string | null,
  resource: AuditResource,
  resourceId: string,
  newValues: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'CREATE',
    resource,
    resourceId,
    newValues,
  });
}

/**
 * Log a resource update
 */
export async function logUpdate(
  userId: string | null,
  resource: AuditResource,
  resourceId: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'UPDATE',
    resource,
    resourceId,
    oldValues,
    newValues,
  });
}

/**
 * Log a resource deletion
 */
export async function logDelete(
  userId: string | null,
  resource: AuditResource,
  resourceId: string,
  oldValues: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'DELETE',
    resource,
    resourceId,
    oldValues,
  });
}

/**
 * Log a configuration change
 */
export async function logConfigChange(
  userId: string | null,
  configType: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'CONFIG_CHANGE',
    resource: 'SYSTEM',
    resourceId: configType,
    oldValues,
    newValues,
  });
}

/**
 * Log a data export
 */
export async function logExport(
  userId: string | null,
  resource: AuditResource,
  details: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'EXPORT',
    resource,
    newValues: details,
  });
}

/**
 * Log a data import
 */
export async function logImport(
  userId: string | null,
  resource: AuditResource,
  details: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'IMPORT',
    resource,
    newValues: details,
  });
}
