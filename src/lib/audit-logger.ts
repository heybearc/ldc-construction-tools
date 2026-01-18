import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export type AuditAction = 
  | 'CG_FILTER_CHANGE'
  | 'USER_CG_ASSIGNMENT'
  | 'CROSS_CG_ACCESS'
  | 'CG_CREATED'
  | 'CG_UPDATED'
  | 'CG_DELETED'
  | 'CG_REACTIVATED'
  | 'VOLUNTEER_CG_TRANSFER'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'VOLUNTEER_CREATED'
  | 'VOLUNTEER_UPDATED'
  | 'VOLUNTEER_DELETED';

export interface AuditLogParams {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  fromCGId?: string | null;
  toCGId?: string | null;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  request?: NextRequest;
}

/**
 * Log a multi-tenant audit event
 * This function captures all relevant information about actions that affect
 * Construction Group data or cross-CG operations.
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    const {
      userId,
      action,
      resource,
      resourceId,
      fromCGId,
      toCGId,
      oldValues,
      newValues,
      metadata,
      request
    } = params;

    // Extract IP address and user agent from request if provided
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (request) {
      // Get IP address from various headers (considering proxies)
      ipAddress = 
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        null;

      userAgent = request.headers.get('user-agent') || null;
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId: resourceId || null,
        fromConstructionGroupId: fromCGId || null,
        toConstructionGroupId: toCGId || null,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        ipAddress,
        userAgent,
      }
    });

    console.log(`[AUDIT] ${action} by user ${userId} on ${resource}${resourceId ? ` (${resourceId})` : ''}`);
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main operation
    console.error('[AUDIT ERROR] Failed to log audit event:', error);
  }
}

/**
 * Log a CG filter change by SUPER_ADMIN
 */
export async function logCGFilterChange(
  userId: string,
  fromCGId: string | null,
  toCGId: string | null,
  request?: NextRequest
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'CG_FILTER_CHANGE',
    resource: 'CG_FILTER',
    fromCGId,
    toCGId,
    metadata: {
      description: `Changed CG filter from ${fromCGId || 'ALL'} to ${toCGId || 'ALL'}`
    },
    request
  });
}

/**
 * Log a user's CG assignment change (via volunteer linking)
 */
export async function logUserCGAssignment(
  userId: string,
  targetUserId: string,
  fromCGId: string | null,
  toCGId: string | null,
  volunteerId: string,
  request?: NextRequest
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'USER_CG_ASSIGNMENT',
    resource: 'USER',
    resourceId: targetUserId,
    fromCGId,
    toCGId,
    metadata: {
      volunteerId,
      description: `User CG changed from ${fromCGId || 'none'} to ${toCGId || 'none'} via volunteer link`
    },
    request
  });
}

/**
 * Log a CG creation
 */
export async function logCGCreated(
  userId: string,
  cgId: string,
  cgCode: string,
  cgName: string,
  regionId: string,
  request?: NextRequest
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'CG_CREATED',
    resource: 'CONSTRUCTION_GROUP',
    resourceId: cgId,
    toCGId: cgId,
    newValues: { code: cgCode, name: cgName, regionId },
    metadata: {
      description: `Created Construction Group: ${cgCode} - ${cgName}`
    },
    request
  });
}

/**
 * Log a CG update
 */
export async function logCGUpdated(
  userId: string,
  cgId: string,
  oldValues: any,
  newValues: any,
  request?: NextRequest
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'CG_UPDATED',
    resource: 'CONSTRUCTION_GROUP',
    resourceId: cgId,
    fromCGId: cgId,
    toCGId: cgId,
    oldValues,
    newValues,
    metadata: {
      description: `Updated Construction Group: ${newValues.code || oldValues.code}`
    },
    request
  });
}

/**
 * Log a CG deletion (soft delete)
 */
export async function logCGDeleted(
  userId: string,
  cgId: string,
  cgCode: string,
  cgName: string,
  request?: NextRequest
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'CG_DELETED',
    resource: 'CONSTRUCTION_GROUP',
    resourceId: cgId,
    fromCGId: cgId,
    oldValues: { code: cgCode, name: cgName, isActive: true },
    newValues: { isActive: false },
    metadata: {
      description: `Deactivated Construction Group: ${cgCode} - ${cgName}`
    },
    request
  });
}

/**
 * Log a CG reactivation
 */
export async function logCGReactivated(
  userId: string,
  cgId: string,
  cgCode: string,
  cgName: string,
  request?: NextRequest
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'CG_REACTIVATED',
    resource: 'CONSTRUCTION_GROUP',
    resourceId: cgId,
    toCGId: cgId,
    oldValues: { isActive: false },
    newValues: { isActive: true },
    metadata: {
      description: `Reactivated Construction Group: ${cgCode} - ${cgName}`
    },
    request
  });
}

/**
 * Log a volunteer CG transfer
 */
export async function logVolunteerCGTransfer(
  userId: string,
  volunteerId: string,
  volunteerName: string,
  fromCGId: string,
  toCGId: string,
  request?: NextRequest
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'VOLUNTEER_CG_TRANSFER',
    resource: 'VOLUNTEER',
    resourceId: volunteerId,
    fromCGId,
    toCGId,
    metadata: {
      volunteerName,
      description: `Transferred volunteer ${volunteerName} between CGs`
    },
    request
  });
}
