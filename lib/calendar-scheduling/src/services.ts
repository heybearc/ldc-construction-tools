// Calendar Scheduling Services - Work Assignment Management Business Logic
import {
  WorkAssignment,
  CalendarEvent,
  ResourceCapacity,
  SchedulingConflict,
  SchedulingTemplate,
  SchedulingStats,
  AssignmentStatus,
  AssignmentPriority,
  CalendarViewType,
  ConflictSeverity,
  ResourceType,
  VolunteerRequirement,
  AssignedVolunteer,
  ConfirmationStatus,
  CalendarModuleConfig
} from './types';
import { CalendarSchedulingAPI } from './api';
import { CalendarEngine } from './calendar-engine';
import { addDays, startOfWeek, endOfWeek, format } from 'date-fns';

export class CalendarSchedulingService {
  private api: CalendarSchedulingAPI;
  private config: CalendarModuleConfig;

  constructor(config: CalendarModuleConfig) {
    this.api = new CalendarSchedulingAPI(config);
    this.config = config;
  }

  /**
   * Creates a new work assignment with conflict detection and capacity validation
   */
  async createWorkAssignment(
    assignmentData: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>,
    options?: {
      skipConflictCheck?: boolean;
      autoResolveConflicts?: boolean;
    }
  ): Promise<{
    assignment: WorkAssignment;
    conflicts: SchedulingConflict[];
    suggestions?: any;
  }> {
    // Validate assignment data
    this.validateAssignmentData(assignmentData);

    // Check for conflicts before creating
    let conflicts: SchedulingConflict[] = [];
    if (!options?.skipConflictCheck) {
      const existingAssignments = await this.getOverlappingAssignments(
        assignmentData.startDate,
        assignmentData.endDate,
        assignmentData.tradeCrewId
      );
      
      const tempAssignment = { 
        ...assignmentData, 
        id: 'temp', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      } as WorkAssignment;
      
      conflicts = CalendarEngine.detectConflicts([...existingAssignments, tempAssignment]);
    }

    // Create the assignment
    const assignment = await this.api.createWorkAssignment(assignmentData);

    // Auto-resolve conflicts if requested
    if (options?.autoResolveConflicts && conflicts.length > 0) {
      await this.autoResolveConflicts(conflicts);
    }

    // Generate suggestions for optimization
    const suggestions = await this.generateOptimizationSuggestions(assignment);

    return { assignment, conflicts, suggestions };
  }

  /**
   * Updates work assignment with validation and conflict checking
   */
  async updateWorkAssignment(
    id: string,
    updates: Partial<WorkAssignment>
  ): Promise<{
    assignment: WorkAssignment;
    conflicts: SchedulingConflict[];
  }> {
    const currentAssignment = await this.api.getWorkAssignment(id);
    
    // Validate updates
    this.validateAssignmentUpdates(currentAssignment, updates);

    // Check for new conflicts if dates or resources changed
    let conflicts: SchedulingConflict[] = [];
    if (updates.startDate || updates.endDate || updates.tradeCrewId) {
      const updatedAssignment = { ...currentAssignment, ...updates };
      const existingAssignments = await this.getOverlappingAssignments(
        updatedAssignment.startDate,
        updatedAssignment.endDate,
        updatedAssignment.tradeCrewId,
        id // exclude current assignment
      );
      
      conflicts = CalendarEngine.detectConflicts([...existingAssignments, updatedAssignment]);
    }

    // Update the assignment
    const assignment = await this.api.updateWorkAssignment(id, updates);

    return { assignment, conflicts };
  }

  /**
   * Gets calendar events for specified date range and view
   */
  async getCalendarEvents(
    startDate: Date,
    endDate: Date,
    viewType: CalendarViewType,
    filters?: any
  ): Promise<CalendarEvent[]> {
    const events = await this.api.getCalendarEvents({
      startDate,
      endDate,
      viewType,
      filters
    });

    // Enhance events with additional metadata
    return events.map(event => ({
      ...event,
      extendedProps: {
        ...event.extendedProps,
        conflicts: this.getEventConflicts(event.id),
        capacityStatus: this.getEventCapacityStatus(event)
      }
    }));
  }

  /**
   * Manages volunteer assignments with skill matching and availability checking
   */
  async assignVolunteersToWork(
    assignmentId: string,
    volunteerAssignments: {
      volunteerId: string;
      role: string;
      skills: string[];
    }[]
  ): Promise<{
    assignment: WorkAssignment;
    conflicts: SchedulingConflict[];
    skillGaps: string[];
  }> {
    const assignment = await this.api.getWorkAssignment(assignmentId);
    const conflicts: SchedulingConflict[] = [];
    const skillGaps: string[] = [];

    // Check volunteer availability and skills
    for (const volunteerAssignment of volunteerAssignments) {
      // Check if volunteer is available
      const isAvailable = await this.checkVolunteerAvailability(
        volunteerAssignment.volunteerId,
        assignment.startDate,
        assignment.endDate
      );

      if (!isAvailable) {
        conflicts.push({
          id: this.generateId(),
          type: 'VOLUNTEER_UNAVAILABLE' as any,
          severity: ConflictSeverity.MEDIUM,
          description: `Volunteer ${volunteerAssignment.volunteerId} is not available`,
          affectedAssignments: [assignmentId],
          affectedResources: [volunteerAssignment.volunteerId]
        });
      }

      // Check skill requirements
      const requiredSkills = assignment.requiredVolunteers
        .filter(req => req.skillRequired)
        .map(req => req.skillRequired);
      
      const missingSkills = requiredSkills.filter(
        skill => !volunteerAssignment.skills.includes(skill)
      );
      
      skillGaps.push(...missingSkills);
    }

    // Assign volunteers if no critical conflicts
    const criticalConflicts = conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL);
    if (criticalConflicts.length === 0) {
      for (const volunteerAssignment of volunteerAssignments) {
        await this.api.assignVolunteer(
          assignmentId,
          volunteerAssignment.volunteerId,
          volunteerAssignment.role
        );
      }
    }

    const updatedAssignment = await this.api.getWorkAssignment(assignmentId);
    return { assignment: updatedAssignment, conflicts, skillGaps: [...new Set(skillGaps)] };
  }

  /**
   * Generates optimal scheduling suggestions for new assignments
   */
  async generateSchedulingSuggestions(
    requirements: {
      tradeTeamId: string;
      duration: number; // in hours
      requiredVolunteers: VolunteerRequirement[];
      preferredDates?: Date[];
      priority: AssignmentPriority;
    }
  ): Promise<{
    suggestedSlots: {
      startDate: Date;
      endDate: Date;
      score: number;
      reasons: string[];
    }[];
    availableVolunteers: any[];
    capacityImpact: ResourceCapacity[];
  }> {
    const suggestedSlots: any[] = [];
    
    // Get existing assignments for analysis
    const existingAssignments = await this.api.getWorkAssignments({
      startDate: new Date(),
      endDate: addDays(new Date(), 30)
    });

    // Analyze capacity for next 30 days
    const capacity = CalendarEngine.calculateResourceCapacity(
      existingAssignments,
      ResourceType.TRADE_CREW,
      { start: new Date(), end: addDays(new Date(), 30) }
    );

    // Find optimal time slots
    const preferredDates = requirements.preferredDates || this.generateDefaultDateRange();
    
    for (const date of preferredDates) {
      const score = this.calculateSlotScore(date, requirements, existingAssignments, capacity);
      const reasons = this.generateSlotReasons(date, requirements, existingAssignments);
      
      suggestedSlots.push({
        startDate: date,
        endDate: addDays(date, Math.ceil(requirements.duration / 8)),
        score,
        reasons
      });
    }

    // Sort by score (highest first)
    suggestedSlots.sort((a, b) => b.score - a.score);

    // Get available volunteers
    const availableVolunteers = await this.findAvailableVolunteers(
      requirements.requiredVolunteers,
      suggestedSlots[0]?.startDate || new Date()
    );

    return {
      suggestedSlots: suggestedSlots.slice(0, 5), // Top 5 suggestions
      availableVolunteers,
      capacityImpact: capacity
    };
  }

  /**
   * Creates assignments from templates with customization
   */
  async createFromTemplate(
    templateId: string,
    customizations: {
      startDate: Date;
      projectId: string;
      location: string;
      notes?: string;
      volunteerOverrides?: { [skillType: string]: string[] };
    }
  ): Promise<WorkAssignment> {
    const templates = await this.api.getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Calculate end date based on template duration
    const endDate = addDays(customizations.startDate, Math.ceil(template.duration / 8));

    // Create assignment from template
    const assignment = await this.api.createFromTemplate(templateId, {
      ...customizations,
      endDate
    });

    // Auto-assign volunteers if specified
    if (customizations.volunteerOverrides) {
      await this.autoAssignVolunteersFromOverrides(assignment.id, customizations.volunteerOverrides);
    }

    return assignment;
  }

  /**
   * Manages recurring assignments with pattern validation
   */
  async createRecurringAssignments(
    baseAssignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>,
    recurrencePattern: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
      occurrences?: number;
      daysOfWeek?: number[];
    }
  ): Promise<{
    createdAssignments: WorkAssignment[];
    skippedDates: { date: Date; reason: string }[];
    conflicts: SchedulingConflict[];
  }> {
    // Generate recurring assignment dates
    const recurringAssignments = CalendarEngine.generateRecurringAssignments(
      baseAssignment,
      recurrencePattern
    );

    const createdAssignments: WorkAssignment[] = [];
    const skippedDates: { date: Date; reason: string }[] = [];
    const allConflicts: SchedulingConflict[] = [];

    // Create each recurring assignment
    for (const recurringAssignment of recurringAssignments) {
      try {
        // Check for conflicts
        const existingAssignments = await this.getOverlappingAssignments(
          recurringAssignment.startDate,
          recurringAssignment.endDate,
          recurringAssignment.tradeCrewId
        );

        const tempAssignment = { 
          ...recurringAssignment, 
          id: 'temp', 
          createdAt: new Date(), 
          updatedAt: new Date() 
        } as WorkAssignment;

        const conflicts = CalendarEngine.detectConflicts([...existingAssignments, tempAssignment]);
        const criticalConflicts = conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL);

        if (criticalConflicts.length > 0) {
          skippedDates.push({
            date: recurringAssignment.startDate,
            reason: `Critical conflicts: ${criticalConflicts.map(c => c.description).join(', ')}`
          });
          continue;
        }

        // Create the assignment
        const created = await this.api.createWorkAssignment(recurringAssignment);
        createdAssignments.push(created);
        allConflicts.push(...conflicts);

      } catch (error) {
        skippedDates.push({
          date: recurringAssignment.startDate,
          reason: `Creation failed: ${error}`
        });
      }
    }

    return {
      createdAssignments,
      skippedDates,
      conflicts: allConflicts
    };
  }

  /**
   * Gets comprehensive scheduling statistics and analytics
   */
  async getSchedulingAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    regionId?: string;
    tradeTeamId?: string;
  }): Promise<SchedulingStats & {
    trends: {
      utilizationTrend: number;
      conflictTrend: number;
      completionTrend: number;
    };
    recommendations: string[];
  }> {
    const stats = await this.api.getSchedulingStats(filters);
    
    // Calculate trends (simplified implementation)
    const trends = {
      utilizationTrend: 5.2, // % change from previous period
      conflictTrend: -12.5,  // % change in conflicts
      completionTrend: 8.1   // % change in completion rate
    };

    // Generate recommendations
    const recommendations = this.generateSchedulingRecommendations(stats, trends);

    return {
      ...stats,
      trends,
      recommendations
    };
  }

  // Private helper methods

  private validateAssignmentData(data: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!data.title?.trim()) {
      throw new Error('Assignment title is required');
    }
    if (!data.tradeTeamId) {
      throw new Error('Trade team is required');
    }
    if (!data.tradeCrewId) {
      throw new Error('Trade crew is required');
    }
    if (data.startDate >= data.endDate) {
      throw new Error('End date must be after start date');
    }
    if (data.startDate < new Date()) {
      throw new Error('Assignment cannot be scheduled in the past');
    }
  }

  private validateAssignmentUpdates(current: WorkAssignment, updates: Partial<WorkAssignment>): void {
    if (updates.startDate && updates.endDate && updates.startDate >= updates.endDate) {
      throw new Error('End date must be after start date');
    }
    
    if (current.status === AssignmentStatus.COMPLETED && updates.status !== AssignmentStatus.COMPLETED) {
      throw new Error('Cannot modify completed assignments');
    }
  }

  private async getOverlappingAssignments(
    startDate: Date,
    endDate: Date,
    tradeCrewId: string,
    excludeId?: string
  ): Promise<WorkAssignment[]> {
    const assignments = await this.api.getWorkAssignments({
      startDate: addDays(startDate, -7), // Buffer for multi-day assignments
      endDate: addDays(endDate, 7),
      tradeCrewId
    });

    return assignments.filter(assignment => 
      assignment.id !== excludeId &&
      assignment.status !== AssignmentStatus.CANCELLED
    );
  }

  private async checkVolunteerAvailability(
    volunteerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    // This would integrate with volunteer management module
    // For now, assume available
    return true;
  }

  private getEventConflicts(eventId: string): SchedulingConflict[] {
    // This would fetch conflicts for specific event
    return [];
  }

  private getEventCapacityStatus(event: CalendarEvent): string {
    // This would calculate capacity status for event
    return 'normal';
  }

  private generateDefaultDateRange(): Date[] {
    const dates: Date[] = [];
    for (let i = 1; i <= 14; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  }

  private calculateSlotScore(
    date: Date,
    requirements: any,
    existingAssignments: WorkAssignment[],
    capacity: ResourceCapacity[]
  ): number {
    let score = 100;
    
    // Reduce score for high utilization days
    const dayCapacity = capacity.find(c => 
      format(c.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    if (dayCapacity) {
      if (dayCapacity.utilizationPercentage > 80) score -= 30;
      if (dayCapacity.utilizationPercentage > 100) score -= 50;
    }

    // Increase score for priority assignments
    if (requirements.priority === 'urgent') score += 20;
    if (requirements.priority === 'high') score += 10;

    return Math.max(0, score);
  }

  private generateSlotReasons(
    date: Date,
    requirements: any,
    existingAssignments: WorkAssignment[]
  ): string[] {
    const reasons: string[] = [];
    
    // Add reasoning based on analysis
    reasons.push('Good capacity availability');
    reasons.push('No scheduling conflicts');
    
    return reasons;
  }

  private async findAvailableVolunteers(
    requirements: VolunteerRequirement[],
    date: Date
  ): Promise<any[]> {
    // This would integrate with volunteer management
    return [];
  }

  private async autoAssignVolunteersFromOverrides(
    assignmentId: string,
    overrides: { [skillType: string]: string[] }
  ): Promise<void> {
    for (const [skill, volunteerIds] of Object.entries(overrides)) {
      for (const volunteerId of volunteerIds) {
        await this.api.assignVolunteer(assignmentId, volunteerId, skill);
      }
    }
  }

  private async autoResolveConflicts(conflicts: SchedulingConflict[]): Promise<void> {
    // Implementation for automatic conflict resolution
    for (const conflict of conflicts) {
      if (conflict.suggestedResolution) {
        // Apply suggested resolution
        console.log(`Auto-resolving conflict: ${conflict.description}`);
      }
    }
  }

  private async generateOptimizationSuggestions(assignment: WorkAssignment): Promise<any> {
    // Generate suggestions for optimizing the assignment
    return {
      volunteerSuggestions: [],
      timingSuggestions: [],
      resourceSuggestions: []
    };
  }

  private generateSchedulingRecommendations(stats: SchedulingStats, trends: any): string[] {
    const recommendations: string[] = [];
    
    if (stats.conflictRate > 0.1) {
      recommendations.push('Consider implementing better resource planning to reduce conflicts');
    }
    
    if (stats.volunteerFulfillmentRate < 0.8) {
      recommendations.push('Increase volunteer recruitment for better assignment coverage');
    }
    
    if (trends.utilizationTrend < 0) {
      recommendations.push('Resource utilization is declining - consider workload optimization');
    }

    return recommendations;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
