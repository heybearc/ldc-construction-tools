// Oversight Types and Utilities
// Future-proofed for extensibility

// Role configuration with limits and display names
export const TRADE_TEAM_OVERSIGHT_CONFIG = {
  TTO: {
    name: 'Trade Team Overseer',
    shortName: 'TTO',
    maxPerEntity: 1,
    description: 'Primary overseer responsible for trade team operations'
  },
  TTOA: {
    name: 'Trade Team Overseer Assistant',
    shortName: 'TTOA', 
    maxPerEntity: 2,
    description: 'Assists the Trade Team Overseer'
  },
  TT_SUPPORT: {
    name: 'Trade Team Support',
    shortName: 'TT Support',
    maxPerEntity: null, // unlimited
    description: 'Provides support for trade team activities'
  }
} as const;

export const TRADE_CREW_OVERSIGHT_CONFIG = {
  TCO: {
    name: 'Trade Crew Overseer',
    shortName: 'TCO',
    maxPerEntity: 1,
    description: 'Primary overseer responsible for crew operations'
  },
  TCOA: {
    name: 'Trade Crew Overseer Assistant',
    shortName: 'TCOA',
    maxPerEntity: 3,
    description: 'Assists the Trade Crew Overseer'
  },
  TC_SUPPORT: {
    name: 'Trade Crew Support',
    shortName: 'TC Support',
    maxPerEntity: null, // unlimited
    description: 'Provides support for crew activities'
  }
} as const;

export const PERSONNEL_CONTACT_CONFIG = {
  PC: {
    name: 'Personnel Contact',
    shortName: 'PC',
    maxPerEntity: 1,
    description: 'Primary personnel contact for the Construction Group'
  },
  PCA: {
    name: 'Personnel Contact Assistant',
    shortName: 'PCA',
    maxPerEntity: null, // unlimited
    description: 'Assists the Personnel Contact'
  },
  PC_SUPPORT: {
    name: 'Personnel Contact Support',
    shortName: 'PC Support',
    maxPerEntity: null, // unlimited
    description: 'Provides support for personnel management'
  }
} as const;

export const CG_STAFF_CONFIG = {
  CGO: {
    name: 'Construction Group Overseer',
    shortName: 'CGO',
    maxPerEntity: 1,
    description: 'Primary overseer responsible for Construction Group operations'
  },
  CGOA: {
    name: 'Construction Group Overseer Assistant',
    shortName: 'CGOA',
    maxPerEntity: 2,
    description: 'Assists the Construction Group Overseer'
  },
  CG_SECRETARY: {
    name: 'Construction Group Secretary',
    shortName: 'CG Secretary',
    maxPerEntity: 1,
    description: 'Handles administrative duties for the Construction Group'
  },
  CG_SAFETY: {
    name: 'Construction Group Safety Officer',
    shortName: 'CG Safety',
    maxPerEntity: 1,
    description: 'Oversees safety protocols and compliance'
  }
} as const;

// Type exports for use in components
export type TradeTeamOversightRole = keyof typeof TRADE_TEAM_OVERSIGHT_CONFIG;
export type TradeCrewOversightRole = keyof typeof TRADE_CREW_OVERSIGHT_CONFIG;
export type PersonnelContactRole = keyof typeof PERSONNEL_CONTACT_CONFIG;
export type CGStaffRole = keyof typeof CG_STAFF_CONFIG;

// Generic oversight assignment interface
export interface OversightAssignment {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

// Validation helper
export function validateRoleLimit(
  config: Record<string, { maxPerEntity: number | null }>,
  role: string,
  currentCount: number
): { valid: boolean; message?: string } {
  const roleConfig = config[role];
  if (!roleConfig) {
    return { valid: false, message: `Invalid role: ${role}` };
  }
  
  if (roleConfig.maxPerEntity !== null && currentCount >= roleConfig.maxPerEntity) {
    return { 
      valid: false, 
      message: `Maximum of ${roleConfig.maxPerEntity} ${role} role(s) allowed` 
    };
  }
  
  return { valid: true };
}

// Get display name for role
export function getRoleDisplayName(
  config: Record<string, { name: string; shortName: string }>,
  role: string
): string {
  return config[role]?.name || role;
}

// Get all roles for a config as options for select
export function getRoleOptions(
  config: Record<string, { name: string; shortName: string; description: string }>
): Array<{ value: string; label: string; description: string }> {
  return Object.entries(config).map(([key, value]) => ({
    value: key,
    label: value.name,
    description: value.description
  }));
}
