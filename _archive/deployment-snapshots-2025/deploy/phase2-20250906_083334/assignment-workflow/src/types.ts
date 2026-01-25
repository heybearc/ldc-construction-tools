// Assignment Workflow Types - USLDC-2829-E Compliance

export interface Assignment {
  id: string;
  category: AssignmentCategory;
  title: string;
  description: string;
  assigneeId: string;
  assignerId: string;
  projectId?: string;
  regionId: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  startDate: Date;
  endDate?: Date;
  estimatedHours?: number;
  requiredSkills: string[];
  impactedRoles: string[];
  approvalRequired: boolean;
  approvalLevel: ApprovalLevel;
  createdAt: Date;
  updatedAt: Date;
}

export enum AssignmentCategory {
  BRANCH_APPOINTED = 'branch_appointed',      // Requires branch approval
  FIELD_ASSIGNED = 'field_assigned',          // Field overseer assignment
  TEMPORARY = 'temporary',                    // Short-term assignment
  EMERGENCY = 'emergency',                    // Emergency replacement
  TRAINING = 'training',                      // Training assignment
  SPECIAL_PROJECT = 'special_project'         // Special project work
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PENDING_CONSULTATION = 'pending_consultation',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

export enum AssignmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ApprovalLevel {
  NONE = 'none',
  OVERSEER = 'overseer',
  BRANCH = 'branch',
  ZONE = 'zone'
}

export interface AssignmentWorkflow {
  id: string;
  assignmentId: string;
  currentStep: WorkflowStep;
  steps: WorkflowStep[];
  approvers: WorkflowApprover[];
  consultations: PreConsultation[];
  impactAssessment?: ImpactAssessment;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  requiredDocuments: string[];
  order: number;
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed'
}

export interface WorkflowApprover {
  id: string;
  userId: string;
  role: string;
  level: ApprovalLevel;
  status: ApprovalStatus;
  comments?: string;
  approvedAt?: Date;
  order: number;
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELEGATED = 'delegated'
}

export interface PreConsultation {
  id: string;
  assignmentId: string;
  consultedPersonId: string;
  consultedRole: string;
  topic: string;
  notes: string;
  impactLevel: ImpactLevel;
  recommendations: string[];
  consultedAt: Date;
  consultedBy: string;
}

export enum ImpactLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ImpactAssessment {
  id: string;
  assignmentId: string;
  impactedRoles: RoleImpact[];
  impactedProjects: ProjectImpact[];
  overallImpact: ImpactLevel;
  mitigationPlan?: string;
  assessedBy: string;
  assessedAt: Date;
}

export interface RoleImpact {
  roleId: string;
  roleName: string;
  personId: string;
  impactType: ImpactType;
  impactLevel: ImpactLevel;
  description: string;
  mitigationRequired: boolean;
}

export interface ProjectImpact {
  projectId: string;
  projectName: string;
  impactType: ImpactType;
  impactLevel: ImpactLevel;
  description: string;
  delayEstimate?: number; // in days
}

export enum ImpactType {
  WORKLOAD_INCREASE = 'workload_increase',
  WORKLOAD_DECREASE = 'workload_decrease',
  SKILL_GAP = 'skill_gap',
  SCHEDULE_CONFLICT = 'schedule_conflict',
  RESOURCE_CONFLICT = 'resource_conflict',
  OVERSIGHT_CHANGE = 'oversight_change'
}

export interface AssignmentTemplate {
  id: string;
  name: string;
  category: AssignmentCategory;
  description: string;
  defaultSteps: Omit<WorkflowStep, 'id' | 'status' | 'completedBy' | 'completedAt'>[];
  requiredApprovals: ApprovalLevel[];
  estimatedDuration: number; // in hours
  requiredSkills: string[];
  isActive: boolean;
}

export interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  pendingApprovals: number;
  completedThisMonth: number;
  averageCompletionTime: number; // in days
  byCategory: Record<AssignmentCategory, number>;
  byStatus: Record<AssignmentStatus, number>;
  byPriority: Record<AssignmentPriority, number>;
}

export interface AssignmentModuleConfig {
  apiBaseUrl: string;
  version: string;
  features: {
    preConsultationRequired: boolean;
    impactAssessmentRequired: boolean;
    automaticApprovalRouting: boolean;
    ldcTechSupportIntegration: boolean;
  };
}
