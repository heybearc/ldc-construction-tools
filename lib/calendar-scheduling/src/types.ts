// Calendar Scheduling Types - Work Assignment Management

export interface WorkAssignment {
  id: string;
  title: string;
  description: string;
  tradeTeamId: string;
  tradeCrewId: string;
  projectId: string;
  regionId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string; // HH:MM format
  endTime?: string;   // HH:MM format
  isMultiDay: boolean;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  requiredVolunteers: VolunteerRequirement[];
  assignedVolunteers: AssignedVolunteer[];
  location: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

export enum AssignmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface VolunteerRequirement {
  id: string;
  skillRequired: string;
  experienceLevel: ExperienceLevel;
  quantity: number;
  isOptional: boolean;
  notes?: string;
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface AssignedVolunteer {
  id: string;
  volunteerId: string;
  volunteerName: string;
  role: string;
  skills: string[];
  confirmationStatus: ConfirmationStatus;
  confirmedAt?: Date;
  notes?: string;
}

export enum ConfirmationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  NO_RESPONSE = 'no_response'
}

export interface CalendarView {
  id: string;
  name: string;
  type: CalendarViewType;
  startDate: Date;
  endDate: Date;
  filters: CalendarFilters;
  assignments: WorkAssignment[];
}

export enum CalendarViewType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  TIMELINE = 'timeline',
  RESOURCE = 'resource'
}

export interface CalendarFilters {
  tradeTeams?: string[];
  tradeCrew?: string[];
  projects?: string[];
  regions?: string[];
  status?: AssignmentStatus[];
  priority?: AssignmentPriority[];
  showConflicts?: boolean;
  showCapacityIndicators?: boolean;
}

export interface ResourceCapacity {
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  date: Date;
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  overallocation: number;
  utilizationPercentage: number;
}

export enum ResourceType {
  TRADE_CREW = 'trade_crew',
  VOLUNTEER = 'volunteer',
  EQUIPMENT = 'equipment',
  LOCATION = 'location'
}

export interface SchedulingConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedAssignments: string[];
  affectedResources: string[];
  suggestedResolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum ConflictType {
  RESOURCE_DOUBLE_BOOKING = 'resource_double_booking',
  VOLUNTEER_UNAVAILABLE = 'volunteer_unavailable',
  SKILL_MISMATCH = 'skill_mismatch',
  CAPACITY_EXCEEDED = 'capacity_exceeded',
  LOCATION_CONFLICT = 'location_conflict',
  TIME_OVERLAP = 'time_overlap'
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SchedulingTemplate {
  id: string;
  name: string;
  description: string;
  tradeTeamId: string;
  duration: number; // in hours
  requiredVolunteers: VolunteerRequirement[];
  preferredTimeSlots: TimeSlot[];
  recurrencePattern?: RecurrencePattern;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}

export interface RecurrencePattern {
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  occurrences?: number;
}

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export interface CalendarEvent {
  id: string;
  assignmentId: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    tradeTeam: string;
    tradeCrew: string;
    project: string;
    status: AssignmentStatus;
    priority: AssignmentPriority;
    requiredVolunteers: number;
    assignedVolunteers: number;
    location: string;
    conflicts: SchedulingConflict[];
  };
}

export interface SchedulingStats {
  totalAssignments: number;
  scheduledAssignments: number;
  completedAssignments: number;
  cancelledAssignments: number;
  averageUtilization: number;
  conflictRate: number;
  onTimeCompletionRate: number;
  volunteerFulfillmentRate: number;
  byTradeTeam: Record<string, number>;
  byStatus: Record<AssignmentStatus, number>;
  byPriority: Record<AssignmentPriority, number>;
  capacityTrends: CapacityTrend[];
}

export interface CapacityTrend {
  date: Date;
  totalCapacity: number;
  utilizedCapacity: number;
  utilizationRate: number;
}

export interface SchedulingNotification {
  id: string;
  type: NotificationType;
  recipientId: string;
  assignmentId: string;
  title: string;
  message: string;
  scheduledFor: Date;
  sentAt?: Date;
  status: NotificationStatus;
}

export enum NotificationType {
  ASSIGNMENT_CREATED = 'assignment_created',
  ASSIGNMENT_UPDATED = 'assignment_updated',
  ASSIGNMENT_CANCELLED = 'assignment_cancelled',
  CONFIRMATION_REQUEST = 'confirmation_request',
  REMINDER = 'reminder',
  CONFLICT_ALERT = 'conflict_alert',
  CAPACITY_WARNING = 'capacity_warning'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

export interface JWHubIntegration {
  projectId: string;
  taskId: string;
  syncStatus: SyncStatus;
  lastSyncAt?: Date;
  syncErrors?: string[];
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  ERROR = 'error',
  DISABLED = 'disabled'
}

export interface CalendarModuleConfig {
  apiBaseUrl: string;
  version: string;
  features: {
    conflictDetection: boolean;
    capacityPlanning: boolean;
    jwHubIntegration: boolean;
    automaticNotifications: boolean;
    recurringAssignments: boolean;
  };
  defaultView: CalendarViewType;
  workingHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  timeZone: string;
}
