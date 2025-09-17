// Communication Hub Messaging Engine - Multi-channel Message Processing
import {
  Message,
  MessageTemplate,
  NotificationRule,
  CommunicationPreferences,
  MessageChannel,
  MessagePriority,
  MessageType,
  MessageCategory,
  DeliveryStatus,
  NotificationEventType,
  NotificationCondition,
  ConditionOperator,
  TemplateVariable,
  VariableType
} from './types';

export class MessagingEngine {
  
  /**
   * Processes message for multi-channel delivery
   */
  static async processMessage(
    message: Message,
    recipientPreferences: Map<string, CommunicationPreferences>
  ): Promise<{
    deliveryPlan: DeliveryPlan[];
    estimatedDeliveryTime: number;
    warnings: string[];
  }> {
    const deliveryPlan: DeliveryPlan[] = [];
    const warnings: string[] = [];
    let maxDeliveryTime = 0;

    for (const recipient of message.recipients) {
      const preferences = recipientPreferences.get(recipient.userId);
      const channels = this.determineOptimalChannels(
        message,
        recipient,
        preferences
      );

      for (const channel of channels) {
        const plan: DeliveryPlan = {
          recipientId: recipient.userId,
          channel,
          priority: this.calculateDeliveryPriority(message, channel),
          scheduledFor: this.calculateDeliveryTime(message, channel, preferences),
          retryAttempts: this.getRetryAttempts(channel, message.priority),
          content: await this.formatMessageForChannel(message, channel)
        };

        deliveryPlan.push(plan);
        maxDeliveryTime = Math.max(maxDeliveryTime, plan.scheduledFor.getTime() - Date.now());
      }

      // Check for potential delivery issues
      if (!channels.length) {
        warnings.push(`No available delivery channels for recipient ${recipient.userId}`);
      }
    }

    return {
      deliveryPlan,
      estimatedDeliveryTime: Math.ceil(maxDeliveryTime / 1000 / 60), // minutes
      warnings
    };
  }

  /**
   * Evaluates notification rules against events
   */
  static evaluateNotificationRules(
    eventType: NotificationEventType,
    eventData: any,
    rules: NotificationRule[]
  ): NotificationRule[] {
    return rules.filter(rule => {
      if (!rule.isActive || rule.eventType !== eventType) {
        return false;
      }

      return rule.conditions.every(condition => 
        this.evaluateCondition(condition, eventData)
      );
    });
  }

  /**
   * Creates message from template with variable substitution
   */
  static createMessageFromTemplate(
    template: MessageTemplate,
    variables: Record<string, any>,
    recipients: string[]
  ): Omit<Message, 'id' | 'createdAt' | 'updatedAt'> {
    // Validate required variables
    const missingVariables = template.variables
      .filter(v => v.required && !variables.hasOwnProperty(v.name))
      .map(v => v.name);

    if (missingVariables.length > 0) {
      throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
    }

    // Substitute variables in subject and content
    const subject = this.substituteVariables(template.subject, template.variables, variables);
    const content = this.substituteVariables(template.content, template.variables, variables);

    return {
      type: template.type,
      subject,
      content,
      senderId: variables.senderId || 'system',
      senderName: variables.senderName || 'System',
      senderRole: variables.senderRole || 'System',
      recipients: recipients.map(userId => ({
        id: this.generateId(),
        userId,
        name: variables[`${userId}_name`] || 'Unknown',
        role: variables[`${userId}_role`] || 'Unknown',
        preferredChannels: template.defaultChannels,
        deliveryStatus: DeliveryStatus.PENDING,
        responseRequired: template.type === MessageType.CONFIRMATION_REQUEST,
        responseReceived: false
      })),
      channels: template.defaultChannels,
      priority: template.defaultPriority,
      category: template.category,
      templateId: template.id,
      attachments: [],
      status: 'draft' as any,
      deliveryStatus: [],
      readReceipts: [],
      responses: [],
      regionId: variables.regionId || 'default'
    };
  }

  /**
   * Determines optimal delivery channels for recipient
   */
  private static determineOptimalChannels(
    message: Message,
    recipient: any,
    preferences?: CommunicationPreferences
  ): MessageChannel[] {
    const channels: MessageChannel[] = [];

    // Emergency messages override preferences
    if (message.priority === MessagePriority.EMERGENCY) {
      if (preferences?.emergencyOverride) {
        return [MessageChannel.SMS, MessageChannel.PHONE_CALL, MessageChannel.EMAIL];
      }
    }

    // Use recipient's preferred channels if available
    if (recipient.preferredChannels?.length > 0) {
      channels.push(...recipient.preferredChannels);
    }

    // Fall back to message default channels
    if (channels.length === 0) {
      channels.push(...message.channels);
    }

    // Filter based on user preferences
    if (preferences) {
      return channels.filter(channel => this.isChannelEnabled(channel, preferences));
    }

    return channels;
  }

  /**
   * Calculates delivery priority based on message and channel
   */
  private static calculateDeliveryPriority(message: Message, channel: MessageChannel): number {
    let priority = 50; // Base priority

    // Adjust for message priority
    switch (message.priority) {
      case MessagePriority.EMERGENCY:
        priority += 50;
        break;
      case MessagePriority.URGENT:
        priority += 30;
        break;
      case MessagePriority.HIGH:
        priority += 20;
        break;
      case MessagePriority.NORMAL:
        priority += 10;
        break;
    }

    // Adjust for channel reliability
    switch (channel) {
      case MessageChannel.SMS:
        priority += 15;
        break;
      case MessageChannel.EMAIL:
        priority += 10;
        break;
      case MessageChannel.IN_APP:
        priority += 5;
        break;
    }

    return priority;
  }

  /**
   * Calculates optimal delivery time considering preferences
   */
  private static calculateDeliveryTime(
    message: Message,
    channel: MessageChannel,
    preferences?: CommunicationPreferences
  ): Date {
    const now = new Date();

    // Immediate delivery for emergency messages
    if (message.priority === MessagePriority.EMERGENCY) {
      return now;
    }

    // Scheduled messages
    if (message.scheduledFor) {
      return message.scheduledFor;
    }

    // Consider quiet hours
    if (preferences?.quietHours?.enabled && this.isInQuietHours(now, preferences)) {
      return this.getNextAvailableTime(preferences);
    }

    return now;
  }

  /**
   * Formats message content for specific channel
   */
  private static async formatMessageForChannel(
    message: Message,
    channel: MessageChannel
  ): Promise<string> {
    switch (channel) {
      case MessageChannel.SMS:
        // Truncate for SMS length limits
        const smsContent = `${message.subject}\n\n${message.content}`;
        return smsContent.length > 160 
          ? smsContent.substring(0, 157) + '...'
          : smsContent;

      case MessageChannel.EMAIL:
        // Full HTML formatting for email
        return this.formatEmailContent(message);

      case MessageChannel.IN_APP:
        // Rich formatting for in-app notifications
        return this.formatInAppContent(message);

      default:
        return `${message.subject}\n\n${message.content}`;
    }
  }

  /**
   * Evaluates a single notification condition
   */
  private static evaluateCondition(condition: NotificationCondition, data: any): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);

    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return fieldValue === condition.value;
      case ConditionOperator.NOT_EQUALS:
        return fieldValue !== condition.value;
      case ConditionOperator.GREATER_THAN:
        return fieldValue > condition.value;
      case ConditionOperator.LESS_THAN:
        return fieldValue < condition.value;
      case ConditionOperator.CONTAINS:
        return String(fieldValue).includes(condition.value);
      case ConditionOperator.IN:
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case ConditionOperator.NOT_IN:
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Substitutes variables in template text
   */
  private static substituteVariables(
    text: string,
    templateVariables: TemplateVariable[],
    values: Record<string, any>
  ): string {
    let result = text;

    templateVariables.forEach(variable => {
      const value = values[variable.name] ?? variable.defaultValue ?? '';
      const formattedValue = this.formatVariableValue(value, variable.type);
      
      // Replace all occurrences of {{variableName}}
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      result = result.replace(regex, formattedValue);
    });

    return result;
  }

  /**
   * Formats variable value based on type
   */
  private static formatVariableValue(value: any, type: VariableType): string {
    switch (type) {
      case VariableType.DATE:
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      case VariableType.NUMBER:
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case VariableType.BOOLEAN:
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }

  /**
   * Checks if channel is enabled in user preferences
   */
  private static isChannelEnabled(channel: MessageChannel, preferences: CommunicationPreferences): boolean {
    switch (channel) {
      case MessageChannel.EMAIL:
        return preferences.emailEnabled;
      case MessageChannel.SMS:
        return preferences.smsEnabled;
      case MessageChannel.IN_APP:
        return preferences.inAppEnabled;
      case MessageChannel.PUSH_NOTIFICATION:
        return preferences.pushEnabled;
      case MessageChannel.PHONE_CALL:
        return preferences.phoneCallsEnabled;
      default:
        return true;
    }
  }

  /**
   * Checks if current time is within quiet hours
   */
  private static isInQuietHours(time: Date, preferences: CommunicationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false;

    const timeStr = time.toTimeString().substring(0, 5); // HH:MM format
    const start = preferences.quietHours.startTime;
    const end = preferences.quietHours.endTime;

    if (start <= end) {
      return timeStr >= start && timeStr <= end;
    } else {
      // Quiet hours span midnight
      return timeStr >= start || timeStr <= end;
    }
  }

  /**
   * Gets next available delivery time after quiet hours
   */
  private static getNextAvailableTime(preferences: CommunicationPreferences): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [hours, minutes] = preferences.quietHours.endTime.split(':').map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);
    
    return tomorrow;
  }

  /**
   * Gets retry attempts based on channel and priority
   */
  private static getRetryAttempts(channel: MessageChannel, priority: MessagePriority): number {
    const baseRetries = {
      [MessageChannel.EMAIL]: 3,
      [MessageChannel.SMS]: 2,
      [MessageChannel.IN_APP]: 1,
      [MessageChannel.PUSH_NOTIFICATION]: 2,
      [MessageChannel.PHONE_CALL]: 1
    };

    const priorityMultiplier = {
      [MessagePriority.EMERGENCY]: 3,
      [MessagePriority.URGENT]: 2,
      [MessagePriority.HIGH]: 1.5,
      [MessagePriority.NORMAL]: 1,
      [MessagePriority.LOW]: 0.5
    };

    return Math.ceil((baseRetries[channel] || 1) * (priorityMultiplier[priority] || 1));
  }

  /**
   * Formats email content with HTML
   */
  private static formatEmailContent(message: Message): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c5aa0;">${message.subject}</h2>
          <div style="margin: 20px 0;">
            ${message.content.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Sent by ${message.senderName} (${message.senderRole})<br>
            LDC Construction Tools - Communication Hub
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Formats in-app notification content
   */
  private static formatInAppContent(message: Message): string {
    return JSON.stringify({
      title: message.subject,
      body: message.content,
      priority: message.priority,
      category: message.category,
      sender: {
        name: message.senderName,
        role: message.senderRole
      },
      actions: message.type === MessageType.CONFIRMATION_REQUEST 
        ? ['Confirm', 'Decline'] 
        : ['Mark as Read']
    });
  }

  /**
   * Gets nested value from object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

interface DeliveryPlan {
  recipientId: string;
  channel: MessageChannel;
  priority: number;
  scheduledFor: Date;
  retryAttempts: number;
  content: string;
}
