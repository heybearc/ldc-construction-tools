/**
 * LDC Tools - Permission Helper Functions
 * 
 * This module provides centralized permission checking for the application.
 * Permissions are based on:
 * 1. System Role (User.role): Platform-level access (USER, ADMIN, SUPER_ADMIN)
 * 2. Organizational Roles (VolunteerRole): Functional LDC roles (PC, TTO, etc.)
 * 
 * Permission Model:
 * - System Role controls platform access (can they log in, see admin features)
 * - Organizational Role controls functional permissions (what they can do)
 */

import { Session } from 'next-auth';

/**
 * Personnel Contact organizational role codes
 * These roles have special permissions for managing volunteers and crew requests
 */
const PERSONNEL_CONTACT_ROLES = ['PC', 'PCA', 'PC-Support'];

/**
 * Construction Group Oversight organizational role codes
 * These roles have oversight permissions
 */
const CG_OVERSIGHT_ROLES = ['CGO', 'CGOA', 'CG-Support'];

/**
 * Trade Team oversight organizational role codes
 */
const TRADE_TEAM_OVERSIGHT_ROLES = ['TTO', 'TTOA', 'TT-Support'];

/**
 * Trade Crew oversight organizational role codes
 */
const TRADE_CREW_OVERSIGHT_ROLES = ['TCO', 'TCOA', 'TC-Support'];

// ============================================================================
// SYSTEM ROLE CHECKS
// ============================================================================

/**
 * Check if user has admin privileges (can access admin menu and features)
 * Requires: ADMIN or SUPER_ADMIN system role
 */
export function canAccessAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  
  const role = session.user.role?.toUpperCase();
  const adminLevel = (session.user as any).adminLevel?.toUpperCase();
  
  return role === 'ADMIN' || 
         role === 'SUPER_ADMIN' || 
         adminLevel === 'ADMIN' || 
         adminLevel === 'SUPER_ADMIN';
}

/**
 * Check if user has super admin privileges
 * Requires: SUPER_ADMIN system role
 */
export function isSuperAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  
  const role = session.user.role?.toUpperCase();
  const adminLevel = (session.user as any).adminLevel?.toUpperCase();
  
  return role === 'SUPER_ADMIN' || adminLevel === 'SUPER_ADMIN';
}

/**
 * Check if user has read-only admin access
 */
export function isReadOnlyAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  
  const adminLevel = (session.user as any).adminLevel?.toUpperCase();
  return adminLevel === 'READ_ONLY_ADMIN';
}

// ============================================================================
// ORGANIZATIONAL ROLE CHECKS
// ============================================================================

/**
 * Check if user has any Personnel Contact organizational role
 * @param userOrgRoles Array of organizational role codes (e.g., ['PC', 'TCV'])
 */
export function hasPersonnelContactRole(userOrgRoles: string[]): boolean {
  return userOrgRoles.some(role => PERSONNEL_CONTACT_ROLES.includes(role));
}

/**
 * Check if user has any CG Oversight organizational role
 * @param userOrgRoles Array of organizational role codes
 */
export function hasCGOversightRole(userOrgRoles: string[]): boolean {
  return userOrgRoles.some(role => CG_OVERSIGHT_ROLES.includes(role));
}

/**
 * Check if user has any Trade Team oversight organizational role
 * @param userOrgRoles Array of organizational role codes
 */
export function hasTradeTeamOversightRole(userOrgRoles: string[]): boolean {
  return userOrgRoles.some(role => TRADE_TEAM_OVERSIGHT_ROLES.includes(role));
}

/**
 * Check if user has any Trade Crew oversight organizational role
 * @param userOrgRoles Array of organizational role codes
 */
export function hasTradeCrewOversightRole(userOrgRoles: string[]): boolean {
  return userOrgRoles.some(role => TRADE_CREW_OVERSIGHT_ROLES.includes(role));
}

// ============================================================================
// CREW REQUEST PERMISSIONS
// ============================================================================

/**
 * Check if user can submit crew requests on behalf of other volunteers
 * 
 * Requirements:
 * - System Role: USER (minimum)
 * - Organizational Role: PC, PCA, or PC-Support
 * 
 * @param session NextAuth session
 * @param userOrgRoles Array of user's organizational role codes
 */
export function canSubmitCrewRequestOnBehalf(
  session: Session | null,
  userOrgRoles: string[]
): boolean {
  if (!session?.user) return false;
  
  // Must have Personnel Contact organizational role
  return hasPersonnelContactRole(userOrgRoles);
}

/**
 * Check if user can view and manage all crew requests
 * 
 * Requirements:
 * - System Role: USER (minimum)
 * - Organizational Role: PC, PCA, PC-Support, CGO, or CGOA
 * 
 * @param session NextAuth session
 * @param userOrgRoles Array of user's organizational role codes
 */
export function canManageCrewRequests(
  session: Session | null,
  userOrgRoles: string[]
): boolean {
  if (!session?.user) return false;
  
  // Personnel contacts or CG oversight can manage requests
  return hasPersonnelContactRole(userOrgRoles) || hasCGOversightRole(userOrgRoles);
}

/**
 * Check if user can assign crew requests to personnel contacts
 * 
 * Requirements:
 * - System Role: USER (minimum)
 * - Organizational Role: PC, PCA, or PC-Support
 * 
 * @param session NextAuth session
 * @param userOrgRoles Array of user's organizational role codes
 */
export function canAssignCrewRequests(
  session: Session | null,
  userOrgRoles: string[]
): boolean {
  if (!session?.user) return false;
  
  // Only personnel contacts can assign requests
  return hasPersonnelContactRole(userOrgRoles);
}

/**
 * Check if user can delete crew requests
 * 
 * Requirements:
 * - System Role: SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canDeleteCrewRequests(session: Session | null): boolean {
  return isSuperAdmin(session);
}

// ============================================================================
// VOLUNTEER MANAGEMENT PERMISSIONS
// ============================================================================

/**
 * Check if user can create, edit, or delete volunteers
 * 
 * Requirements:
 * - System Role: ADMIN or SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canManageVolunteers(session: Session | null): boolean {
  return canAccessAdmin(session);
}

/**
 * Check if user can assign organizational roles to volunteers
 * 
 * Requirements:
 * - System Role: ADMIN or SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canAssignOrganizationalRoles(session: Session | null): boolean {
  return canAccessAdmin(session);
}

/**
 * Check if user can export volunteer data
 * 
 * Requirements:
 * - System Role: USER (minimum)
 * - Organizational Role: PC, PCA, PC-Support, CGO, or CGOA
 * 
 * @param session NextAuth session
 * @param userOrgRoles Array of user's organizational role codes
 */
export function canExportVolunteers(
  session: Session | null,
  userOrgRoles: string[]
): boolean {
  if (!session?.user) return false;
  
  // Personnel contacts or CG oversight can export
  return hasPersonnelContactRole(userOrgRoles) || hasCGOversightRole(userOrgRoles);
}

/**
 * Check if user can import volunteers via CSV
 * 
 * Requirements:
 * - System Role: ADMIN or SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canImportVolunteers(session: Session | null): boolean {
  return canAccessAdmin(session);
}

// ============================================================================
// TRADE TEAM/CREW MANAGEMENT PERMISSIONS
// ============================================================================

/**
 * Check if user can create, edit, or delete trade teams/crews
 * 
 * Requirements:
 * - System Role: ADMIN or SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canManageTradeTeams(session: Session | null): boolean {
  return canAccessAdmin(session);
}

/**
 * Check if user can assign volunteers to trade teams/crews
 * 
 * Requirements:
 * - System Role: USER (minimum)
 * - Organizational Role: TTO, TTOA, TCO, TCOA, PC, PCA, or PC-Support
 * 
 * @param session NextAuth session
 * @param userOrgRoles Array of user's organizational role codes
 */
export function canAssignVolunteersToTeams(
  session: Session | null,
  userOrgRoles: string[]
): boolean {
  if (!session?.user) return false;
  
  // Team/crew overseers or personnel contacts can assign
  return hasTradeTeamOversightRole(userOrgRoles) ||
         hasTradeCrewOversightRole(userOrgRoles) ||
         hasPersonnelContactRole(userOrgRoles);
}

// ============================================================================
// PROJECT MANAGEMENT PERMISSIONS
// ============================================================================

/**
 * Check if user can create, edit, or delete projects
 * 
 * Requirements:
 * - System Role: ADMIN or SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canManageProjects(session: Session | null): boolean {
  return canAccessAdmin(session);
}

/**
 * Check if user can manage project rosters
 * 
 * Requirements:
 * - System Role: USER (minimum)
 * - Organizational Role: CGO, CGOA, PC, PCA, or PC-Support
 * 
 * @param session NextAuth session
 * @param userOrgRoles Array of user's organizational role codes
 */
export function canManageProjectRosters(
  session: Session | null,
  userOrgRoles: string[]
): boolean {
  if (!session?.user) return false;
  
  // CG oversight or personnel contacts can manage rosters
  return hasCGOversightRole(userOrgRoles) || hasPersonnelContactRole(userOrgRoles);
}

// ============================================================================
// ADMIN FEATURE PERMISSIONS
// ============================================================================

/**
 * Check if user can manage system users
 * 
 * Requirements:
 * - System Role: SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canManageUsers(session: Session | null): boolean {
  return isSuperAdmin(session);
}

/**
 * Check if user can manage announcements
 * 
 * Requirements:
 * - System Role: ADMIN or SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canManageAnnouncements(session: Session | null): boolean {
  return canAccessAdmin(session);
}

/**
 * Check if user can view feedback
 * 
 * Requirements:
 * - System Role: ADMIN or SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canViewFeedback(session: Session | null): boolean {
  return canAccessAdmin(session);
}

/**
 * Check if user can manage organizational hierarchy
 * 
 * Requirements:
 * - System Role: SUPER_ADMIN
 * 
 * @param session NextAuth session
 */
export function canManageOrganizationalHierarchy(session: Session | null): boolean {
  return isSuperAdmin(session);
}
