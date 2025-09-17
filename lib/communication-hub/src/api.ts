// Communication Hub API - Multi-channel Messaging System
import {
  Message,
  MessageTemplate,
  NotificationRule,
  CommunicationGroup,
  CommunicationPreferences,
  DeliveryReport,
  CommunicationStats,
  ElderCoordination,
  MessageType,
  MessagePriority,
  MessageCategory,
  MessageStatus,
  MessageChannel,
  NotificationEventType,
  GroupType,
  CommunicationModuleConfig
} from './types';

export class CommunicationHubAPI {
  private baseUrl: string;
  private config: CommunicationModuleConfig;

  constructor(config: CommunicationModuleConfig) {
    this.baseUrl = config.apiBaseUrl;
    this.config = config;
  }

  // Message Operations
  async createMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'deliveryStatus' | 'readReceipts' | 'responses'>): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.json();
  }

  async getMessage(id: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages/${id}`);
    return response.json();
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async deleteMessage(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/messages/${id}`, {
      method: 'DELETE'
    });
  }

  async getMessages(filters?: {
    type?: MessageType;
    priority?: MessagePriority;
    category?: MessageCategory;
    status?: MessageStatus;
    senderId?: string;
    recipientId?: string;
    regionId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Message[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/messages?${params}`);
    return response.json();
  }

  async sendMessage(id: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages/${id}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async scheduleMessage(id: string, scheduledFor: Date): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages/${id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledFor: scheduledFor.toISOString() })
    });
    return response.json();
  }

  async cancelMessage(id: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  // Template Operations
  async createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<MessageTemplate> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    return response.json();
  }

  async getTemplate(id: string): Promise<MessageTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`);
    return response.json();
  }

  async getTemplates(filters?: {
    category?: MessageCategory;
    type?: MessageType;
    isActive?: boolean;
  }): Promise<MessageTemplate[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/templates?${params}`);
    return response.json();
  }

  async updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async createMessageFromTemplate(templateId: string, variables: Record<string, any>, recipients: string[]): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}/create-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variables, recipients })
    });
    return response.json();
  }

  // Notification Rules
  async createNotificationRule(rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationRule> {
    const response = await fetch(`${this.baseUrl}/notification-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return response.json();
  }

  async getNotificationRules(filters?: {
    eventType?: NotificationEventType;
    isActive?: boolean;
    regionId?: string;
  }): Promise<NotificationRule[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/notification-rules?${params}`);
    return response.json();
  }

  async updateNotificationRule(id: string, updates: Partial<NotificationRule>): Promise<NotificationRule> {
    const response = await fetch(`${this.baseUrl}/notification-rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async triggerNotification(eventType: NotificationEventType, eventData: any): Promise<{ triggered: number; messages: string[] }> {
    const response = await fetch(`${this.baseUrl}/notifications/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, eventData })
    });
    return response.json();
  }

  // Communication Groups
  async createGroup(group: Omit<CommunicationGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunicationGroup> {
    const response = await fetch(`${this.baseUrl}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group)
    });
    return response.json();
  }

  async getGroup(id: string): Promise<CommunicationGroup> {
    const response = await fetch(`${this.baseUrl}/groups/${id}`);
    return response.json();
  }

  async getGroups(filters?: {
    type?: GroupType;
    regionId?: string;
    projectId?: string;
    tradeTeamId?: string;
    isActive?: boolean;
  }): Promise<CommunicationGroup[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/groups?${params}`);
    return response.json();
  }

  async addGroupMember(groupId: string, userId: string, permissions?: any): Promise<CommunicationGroup> {
    const response = await fetch(`${this.baseUrl}/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, permissions })
    });
    return response.json();
  }

  async removeGroupMember(groupId: string, userId: string): Promise<CommunicationGroup> {
    const response = await fetch(`${this.baseUrl}/groups/${groupId}/members/${userId}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  async sendGroupMessage(groupId: string, message: {
    subject: string;
    content: string;
    priority?: MessagePriority;
    channels?: MessageChannel[];
  }): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/groups/${groupId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.json();
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<CommunicationPreferences> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/preferences`);
    return response.json();
  }

  async updateUserPreferences(userId: string, preferences: Partial<CommunicationPreferences>): Promise<CommunicationPreferences> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    return response.json();
  }

  // Delivery and Analytics
  async getDeliveryReport(messageId: string): Promise<DeliveryReport> {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}/delivery-report`);
    return response.json();
  }

  async getCommunicationStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    regionId?: string;
    userId?: string;
  }): Promise<CommunicationStats> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/stats?${params}`);
    return response.json();
  }

  // Elder Coordination
  async createElderCoordination(coordination: Omit<ElderCoordination, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'decisions'>): Promise<ElderCoordination> {
    if (!this.config.features.elderCoordinationEnabled) {
      throw new Error('Elder coordination feature not enabled');
    }

    const response = await fetch(`${this.baseUrl}/elder-coordination`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coordination)
    });
    return response.json();
  }

  async getElderCoordination(id: string): Promise<ElderCoordination> {
    const response = await fetch(`${this.baseUrl}/elder-coordination/${id}`);
    return response.json();
  }

  async addElderDecision(coordinationId: string, decision: {
    decision: string;
    reasoning: string;
    implementationNotes?: string;
  }): Promise<ElderCoordination> {
    const response = await fetch(`${this.baseUrl}/elder-coordination/${coordinationId}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decision)
    });
    return response.json();
  }

  // Emergency Communications
  async sendEmergencyAlert(alert: {
    title: string;
    message: string;
    regionId?: string;
    recipients?: string[];
    channels?: MessageChannel[];
  }): Promise<Message> {
    if (!this.config.features.emergencyAlertsEnabled) {
      throw new Error('Emergency alerts feature not enabled');
    }

    const response = await fetch(`${this.baseUrl}/emergency/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
    return response.json();
  }

  async getEmergencyContacts(regionId?: string): Promise<{
    userId: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    priority: number;
  }[]> {
    const params = regionId ? `?regionId=${regionId}` : '';
    const response = await fetch(`${this.baseUrl}/emergency/contacts${params}`);
    return response.json();
  }

  // Message Responses
  async respondToMessage(messageId: string, response: {
    content: string;
    responseType: string;
  }): Promise<void> {
    await fetch(`${this.baseUrl}/messages/${messageId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    });
  }

  async markMessageRead(messageId: string, userId: string): Promise<void> {
    await fetch(`${this.baseUrl}/messages/${messageId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  }

  // Bulk Operations
  async sendBulkMessage(message: {
    subject: string;
    content: string;
    recipients: string[];
    channels: MessageChannel[];
    priority?: MessagePriority;
    category?: MessageCategory;
  }): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.json();
  }

  async updateBulkPreferences(updates: {
    userIds: string[];
    preferences: Partial<CommunicationPreferences>;
  }): Promise<{ updated: number; errors: string[] }> {
    const response = await fetch(`${this.baseUrl}/preferences/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // Export Operations
  async exportMessages(filters?: any, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    params.append('format', format);
    
    const response = await fetch(`${this.baseUrl}/messages/export?${params}`);
    return response.blob();
  }

  async exportDeliveryReports(filters?: any, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    params.append('format', format);
    
    const response = await fetch(`${this.baseUrl}/reports/export?${params}`);
    return response.blob();
  }
}
