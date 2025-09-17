// Communication Hub Types - Multi-channel Messaging System

export interface Message {
  id: string;
  type: MessageType;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipients: MessageRecipient[];
  channels: MessageChannel[];
  priority: MessagePriority;
  category: MessageCategory;
  templateId?: string;
  attachments: MessageAttachment[];
  scheduledFor?: Date;
  sentAt?: Date;
  status: MessageStatus;
  deliveryStatus: DeliveryStatus[];
  readReceipts: ReadReceipt[];
  responses: MessageResponse[];
  relatedEntityId?: string;
  relatedEntityType?: string;
  regionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageType {
  NOTIFICATION = 'notification',
  ANNOUNCEMENT = 'announcement',
  ASSIGNMENT_UPDATE = 'assignment_update',
  EMERGENCY_ALERT = 'emergency_alert',
  REMINDER = 'reminder',
  INVITATION = 'invitation',
  CONFIRMATION_REQUEST = 'confirmation_request',
  GROUP_MESSAGE = 'group_message',
  ELDER_COORDINATION = 'elder_coordination'
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency'
}

export enum MessageCategory {
  ASSIGNMENT = 'assignment',
  VOLUNTEER = 'volunteer',
  PROJECT = 'project',
  SAFETY = 'safety',
  ADMINISTRATIVE = 'administrative',
  SPIRITUAL = 'spiritual',
  EMERGENCY = 'emergency',
  GENERAL = 'general'
}

export enum MessageStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface MessageRecipient {
  id: string;
  userId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  preferredChannels: MessageChannel[];
  deliveryStatus: DeliveryStatus;
  readAt?: Date;
  responseRequired: boolean;
  responseReceived: boolean;
}

export enum MessageChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
  PUSH_NOTIFICATION = 'push_notification',
  PHONE_CALL = 'phone_call'
}

export interface MessageAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  BLOCKED = 'blocked'
}

export interface ReadReceipt {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;
  channel: MessageChannel;
}

export interface MessageResponse {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  content: string;
  responseType: ResponseType;
  respondedAt: Date;
  channel: MessageChannel;
}

export enum ResponseType {
  CONFIRMATION = 'confirmation',
  DECLINE = 'decline',
  QUESTION = 'question',
  COMMENT = 'comment',
  ACKNOWLEDGMENT = 'acknowledgment'
}

export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  category: MessageCategory;
  type: MessageType;
  subject: string;
  content: string;
  variables: TemplateVariable[];
  defaultChannels: MessageChannel[];
  defaultPriority: MessagePriority;
  requiresApproval: boolean;
  approvalLevel: ApprovalLevel;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: VariableType;
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export enum VariableType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  USER = 'user',
  ROLE = 'role',
  PROJECT = 'project'
}

export enum ApprovalLevel {
  NONE = 'none',
  OVERSEER = 'overseer',
  ELDER = 'elder',
  BRANCH = 'branch'
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  eventType: NotificationEventType;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  recipients: NotificationRecipient[];
  isActive: boolean;
  regionId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationEventType {
  ASSIGNMENT_CREATED = 'assignment_created',
  ASSIGNMENT_UPDATED = 'assignment_updated',
  ASSIGNMENT_CANCELLED = 'assignment_cancelled',
  VOLUNTEER_ASSIGNED = 'volunteer_assigned',
  VOLUNTEER_CONFIRMED = 'volunteer_confirmed',
  VOLUNTEER_DECLINED = 'volunteer_declined',
  DEADLINE_APPROACHING = 'deadline_approaching',
  CAPACITY_EXCEEDED = 'capacity_exceeded',
  CONFLICT_DETECTED = 'conflict_detected',
  EMERGENCY_DECLARED = 'emergency_declared'
}

export interface NotificationCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  IN = 'in',
  NOT_IN = 'not_in'
}

export interface NotificationAction {
  type: NotificationActionType;
  templateId?: string;
  customMessage?: string;
  channels: MessageChannel[];
  delay?: number; // minutes
}

export enum NotificationActionType {
  SEND_MESSAGE = 'send_message',
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  CREATE_TASK = 'create_task',
  ESCALATE = 'escalate'
}

export interface NotificationRecipient {
  type: RecipientType;
  value: string; // userId, roleId, or group identifier
}

export enum RecipientType {
  USER = 'user',
  ROLE = 'role',
  GROUP = 'group',
  TRADE_TEAM = 'trade_team',
  PROJECT_TEAM = 'project_team',
  REGION = 'region'
}

export interface CommunicationGroup {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  members: GroupMember[];
  permissions: GroupPermissions;
  regionId?: string;
  projectId?: string;
  tradeTeamId?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum GroupType {
  PROJECT_TEAM = 'project_team',
  TRADE_TEAM = 'trade_team',
  VOLUNTEER_GROUP = 'volunteer_group',
  OVERSIGHT_GROUP = 'oversight_group',
  EMERGENCY_RESPONSE = 'emergency_response',
  ADMINISTRATIVE = 'administrative'
}

export interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  role: string;
  permissions: MemberPermissions;
  joinedAt: Date;
  isActive: boolean;
}

export interface GroupPermissions {
  canSendMessages: boolean;
  canCreateAnnouncements: boolean;
  canManageMembers: boolean;
  canViewHistory: boolean;
  canDeleteMessages: boolean;
}

export interface MemberPermissions {
  canSend: boolean;
  canReceive: boolean;
  canModerate: boolean;
  isAdmin: boolean;
}

export interface CommunicationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  phoneCallsEnabled: boolean;
  preferredChannels: MessageChannel[];
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    timezone: string;
  };
  categoryPreferences: {
    [key in MessageCategory]: {
      enabled: boolean;
      channels: MessageChannel[];
      priority: MessagePriority;
    };
  };
  emergencyOverride: boolean;
  updatedAt: Date;
}

export interface DeliveryReport {
  messageId: string;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  readCount: number;
  responseCount: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  channelBreakdown: {
    [key in MessageChannel]: {
      sent: number;
      delivered: number;
      failed: number;
      read: number;
    };
  };
  failureReasons: {
    reason: string;
    count: number;
  }[];
  generatedAt: Date;
}

export interface CommunicationStats {
  totalMessages: number;
  messagesByType: Record<MessageType, number>;
  messagesByPriority: Record<MessagePriority, number>;
  messagesByChannel: Record<MessageChannel, number>;
  averageDeliveryTime: number; // minutes
  averageResponseTime: number; // minutes
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  activeUsers: number;
  topSenders: {
    userId: string;
    userName: string;
    messageCount: number;
  }[];
  emergencyResponseTime: number; // minutes
}

export interface ElderCoordination {
  id: string;
  title: string;
  description: string;
  initiatedBy: string;
  elders: ElderParticipant[];
  status: CoordinationStatus;
  priority: MessagePriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
  messages: Message[];
  decisions: ElderDecision[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ElderParticipant {
  userId: string;
  name: string;
  role: string;
  status: ParticipationStatus;
  joinedAt: Date;
  lastActiveAt?: Date;
}

export enum ParticipationStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed'
}

export enum CoordinationStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  PENDING_DECISION = 'pending_decision',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ElderDecision {
  id: string;
  coordinationId: string;
  decision: string;
  reasoning: string;
  decidedBy: string;
  decidedAt: Date;
  implementationNotes?: string;
}

export interface CommunicationModuleConfig {
  apiBaseUrl: string;
  version: string;
  features: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushNotificationsEnabled: boolean;
    phoneCallsEnabled: boolean;
    elderCoordinationEnabled: boolean;
    emergencyAlertsEnabled: boolean;
    messageApprovalRequired: boolean;
  };
  providers: {
    email: {
      provider: 'smtp' | 'sendgrid' | 'ses';
      config: any;
    };
    sms: {
      provider: 'twilio' | 'nexmo' | 'aws-sns';
      config: any;
    };
    push: {
      provider: 'firebase' | 'apns' | 'expo';
      config: any;
    };
  };
  limits: {
    maxRecipientsPerMessage: number;
    maxAttachmentSize: number; // MB
    maxMessageLength: number;
    rateLimitPerHour: number;
  };
}
