// Calendar Scheduling Engine - Work Assignment Logic
import {
  WorkAssignment,
  ResourceCapacity,
  SchedulingConflict,
  ConflictType,
  ConflictSeverity,
  ResourceType,
  AssignmentStatus,
  VolunteerRequirement,
  AssignedVolunteer,
  ExperienceLevel,
  ConfirmationStatus
} from './types';
import { addDays, isSameDay, isWithinInterval, differenceInHours, format } from 'date-fns';

export class CalendarEngine {
  
  /**
   * Detects scheduling conflicts for assignments
   */
  static detectConflicts(assignments: WorkAssignment[]): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];
    
    // Check for resource double-booking
    conflicts.push(...this.detectResourceConflicts(assignments));
    
    // Check for volunteer availability conflicts
    conflicts.push(...this.detectVolunteerConflicts(assignments));
    
    // Check for capacity overruns
    conflicts.push(...this.detectCapacityConflicts(assignments));
    
    // Check for skill mismatches
    conflicts.push(...this.detectSkillMismatches(assignments));
    
    return conflicts;
  }

  /**
   * Calculates resource capacity utilization
   */
  static calculateResourceCapacity(
    assignments: WorkAssignment[],
    resourceType: ResourceType,
    dateRange: { start: Date; end: Date }
  ): ResourceCapacity[] {
    const capacityMap = new Map<string, ResourceCapacity>();
    
    // Initialize capacity for each day in range
    let currentDate = dateRange.start;
    while (currentDate <= dateRange.end) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      
      // Get unique resources for this date
      const resourcesForDate = this.getResourcesForDate(assignments, currentDate, resourceType);
      
      resourcesForDate.forEach(resource => {
        const key = `${resource.id}-${dateKey}`;
        if (!capacityMap.has(key)) {
          capacityMap.set(key, {
            resourceId: resource.id,
            resourceName: resource.name,
            resourceType,
            date: new Date(currentDate),
            totalCapacity: resource.capacity || 8, // Default 8 hours
            allocatedCapacity: 0,
            availableCapacity: resource.capacity || 8,
            overallocation: 0,
            utilizationPercentage: 0
          });
        }
      });
      
      currentDate = addDays(currentDate, 1);
    }

    // Calculate allocated capacity from assignments
    assignments.forEach(assignment => {
      if (assignment.status === AssignmentStatus.CANCELLED) return;
      
      const assignmentDays = this.getAssignmentDays(assignment);
      assignmentDays.forEach(day => {
        const resources = this.getAssignmentResources(assignment, resourceType);
        
        resources.forEach(resourceId => {
          const key = `${resourceId}-${format(day, 'yyyy-MM-dd')}`;
          const capacity = capacityMap.get(key);
          
          if (capacity) {
            const hours = this.calculateAssignmentHours(assignment, day);
            capacity.allocatedCapacity += hours;
            capacity.availableCapacity = Math.max(0, capacity.totalCapacity - capacity.allocatedCapacity);
            capacity.overallocation = Math.max(0, capacity.allocatedCapacity - capacity.totalCapacity);
            capacity.utilizationPercentage = Math.round((capacity.allocatedCapacity / capacity.totalCapacity) * 100);
          }
        });
      });
    });

    return Array.from(capacityMap.values());
  }

  /**
   * Suggests optimal scheduling for new assignment
   */
  static suggestOptimalScheduling(
    newAssignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>,
    existingAssignments: WorkAssignment[],
    availableVolunteers: any[]
  ): {
    suggestedDates: Date[];
    suggestedVolunteers: AssignedVolunteer[];
    potentialConflicts: SchedulingConflict[];
    capacityImpact: ResourceCapacity[];
  } {
    const suggestedDates: Date[] = [];
    const suggestedVolunteers: AssignedVolunteer[] = [];
    const potentialConflicts: SchedulingConflict[] = [];
    
    // Find optimal dates based on capacity and conflicts
    const optimalDates = this.findOptimalDates(newAssignment, existingAssignments);
    suggestedDates.push(...optimalDates);
    
    // Match volunteers to requirements
    const matchedVolunteers = this.matchVolunteersToRequirements(
      newAssignment.requiredVolunteers,
      availableVolunteers,
      newAssignment.startDate
    );
    suggestedVolunteers.push(...matchedVolunteers);
    
    // Check for potential conflicts
    const tempAssignment = { ...newAssignment, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as WorkAssignment;
    potentialConflicts.push(...this.detectConflicts([...existingAssignments, tempAssignment]));
    
    // Calculate capacity impact
    const capacityImpact = this.calculateResourceCapacity(
      [...existingAssignments, tempAssignment],
      ResourceType.TRADE_CREW,
      { start: newAssignment.startDate, end: newAssignment.endDate }
    );

    return {
      suggestedDates,
      suggestedVolunteers,
      potentialConflicts,
      capacityImpact
    };
  }

  /**
   * Validates assignment scheduling rules
   */
  static validateAssignment(assignment: WorkAssignment, existingAssignments: WorkAssignment[]): {
    isValid: boolean;
    violations: string[];
    warnings: string[];
  } {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Check basic date validation
    if (assignment.startDate >= assignment.endDate) {
      violations.push('End date must be after start date');
    }

    // Check if assignment is in the past
    if (assignment.startDate < new Date()) {
      warnings.push('Assignment is scheduled in the past');
    }

    // Check volunteer requirements vs assignments
    const requiredCount = assignment.requiredVolunteers.reduce((sum, req) => sum + req.quantity, 0);
    const assignedCount = assignment.assignedVolunteers.length;
    
    if (assignedCount < requiredCount) {
      warnings.push(`Insufficient volunteers assigned: ${assignedCount}/${requiredCount}`);
    }

    // Check for skill coverage
    const requiredSkills = assignment.requiredVolunteers.map(req => req.skillRequired);
    const assignedSkills = assignment.assignedVolunteers.flatMap(vol => vol.skills);
    const missingSkills = requiredSkills.filter(skill => !assignedSkills.includes(skill));
    
    if (missingSkills.length > 0) {
      warnings.push(`Missing required skills: ${missingSkills.join(', ')}`);
    }

    // Check for conflicts with existing assignments
    const conflicts = this.detectConflicts([...existingAssignments, assignment]);
    const criticalConflicts = conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL);
    
    if (criticalConflicts.length > 0) {
      violations.push(`Critical scheduling conflicts detected: ${criticalConflicts.length}`);
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings
    };
  }

  /**
   * Generates recurring assignments from pattern
   */
  static generateRecurringAssignments(
    baseAssignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>,
    pattern: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
      occurrences?: number;
      daysOfWeek?: number[];
    }
  ): Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>[] {
    const assignments: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    let currentDate = new Date(baseAssignment.startDate);
    let occurrenceCount = 0;
    const maxOccurrences = pattern.occurrences || 52; // Default to 1 year

    while (
      occurrenceCount < maxOccurrences &&
      (!pattern.endDate || currentDate <= pattern.endDate)
    ) {
      // Check if this date matches the pattern
      if (this.matchesRecurrencePattern(currentDate, pattern)) {
        const duration = differenceInHours(baseAssignment.endDate, baseAssignment.startDate);
        const endDate = addDays(currentDate, Math.floor(duration / 24));
        
        assignments.push({
          ...baseAssignment,
          startDate: new Date(currentDate),
          endDate,
          title: `${baseAssignment.title} (${format(currentDate, 'MMM dd, yyyy')})`
        });
        
        occurrenceCount++;
      }

      // Advance to next potential date
      currentDate = this.getNextRecurrenceDate(currentDate, pattern);
    }

    return assignments;
  }

  // Private helper methods

  private static detectResourceConflicts(assignments: WorkAssignment[]): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];
    const resourceBookings = new Map<string, WorkAssignment[]>();

    // Group assignments by resource (trade crew)
    assignments.forEach(assignment => {
      if (assignment.status === AssignmentStatus.CANCELLED) return;
      
      const key = `${assignment.tradeCrewId}`;
      if (!resourceBookings.has(key)) {
        resourceBookings.set(key, []);
      }
      resourceBookings.get(key)!.push(assignment);
    });

    // Check for overlapping assignments
    resourceBookings.forEach((resourceAssignments, resourceId) => {
      for (let i = 0; i < resourceAssignments.length; i++) {
        for (let j = i + 1; j < resourceAssignments.length; j++) {
          const assignment1 = resourceAssignments[i];
          const assignment2 = resourceAssignments[j];

          if (this.assignmentsOverlap(assignment1, assignment2)) {
            conflicts.push({
              id: this.generateId(),
              type: ConflictType.RESOURCE_DOUBLE_BOOKING,
              severity: ConflictSeverity.HIGH,
              description: `Trade crew ${resourceId} double-booked`,
              affectedAssignments: [assignment1.id, assignment2.id],
              affectedResources: [resourceId],
              suggestedResolution: 'Reschedule one of the conflicting assignments'
            });
          }
        }
      }
    });

    return conflicts;
  }

  private static detectVolunteerConflicts(assignments: WorkAssignment[]): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];
    const volunteerBookings = new Map<string, WorkAssignment[]>();

    // Group assignments by volunteer
    assignments.forEach(assignment => {
      if (assignment.status === AssignmentStatus.CANCELLED) return;
      
      assignment.assignedVolunteers.forEach(volunteer => {
        if (!volunteerBookings.has(volunteer.volunteerId)) {
          volunteerBookings.set(volunteer.volunteerId, []);
        }
        volunteerBookings.get(volunteer.volunteerId)!.push(assignment);
      });
    });

    // Check for volunteer conflicts
    volunteerBookings.forEach((volunteerAssignments, volunteerId) => {
      for (let i = 0; i < volunteerAssignments.length; i++) {
        for (let j = i + 1; j < volunteerAssignments.length; j++) {
          const assignment1 = volunteerAssignments[i];
          const assignment2 = volunteerAssignments[j];

          if (this.assignmentsOverlap(assignment1, assignment2)) {
            conflicts.push({
              id: this.generateId(),
              type: ConflictType.VOLUNTEER_UNAVAILABLE,
              severity: ConflictSeverity.MEDIUM,
              description: `Volunteer ${volunteerId} assigned to overlapping assignments`,
              affectedAssignments: [assignment1.id, assignment2.id],
              affectedResources: [volunteerId],
              suggestedResolution: 'Remove volunteer from one assignment or reschedule'
            });
          }
        }
      }
    });

    return conflicts;
  }

  private static detectCapacityConflicts(assignments: WorkAssignment[]): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];
    // Implementation would check capacity limits
    return conflicts;
  }

  private static detectSkillMismatches(assignments: WorkAssignment[]): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];
    
    assignments.forEach(assignment => {
      assignment.requiredVolunteers.forEach(requirement => {
        const matchingVolunteers = assignment.assignedVolunteers.filter(volunteer =>
          volunteer.skills.includes(requirement.skillRequired)
        );

        if (matchingVolunteers.length < requirement.quantity && !requirement.isOptional) {
          conflicts.push({
            id: this.generateId(),
            type: ConflictType.SKILL_MISMATCH,
            severity: ConflictSeverity.MEDIUM,
            description: `Insufficient volunteers with ${requirement.skillRequired} skill`,
            affectedAssignments: [assignment.id],
            affectedResources: [],
            suggestedResolution: `Assign ${requirement.quantity - matchingVolunteers.length} more volunteers with ${requirement.skillRequired} skill`
          });
        }
      });
    });

    return conflicts;
  }

  private static assignmentsOverlap(assignment1: WorkAssignment, assignment2: WorkAssignment): boolean {
    return isWithinInterval(assignment1.startDate, { start: assignment2.startDate, end: assignment2.endDate }) ||
           isWithinInterval(assignment2.startDate, { start: assignment1.startDate, end: assignment1.endDate }) ||
           (assignment1.startDate <= assignment2.startDate && assignment1.endDate >= assignment2.endDate);
  }

  private static getAssignmentDays(assignment: WorkAssignment): Date[] {
    const days: Date[] = [];
    let currentDate = new Date(assignment.startDate);
    
    while (currentDate <= assignment.endDate) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  }

  private static getAssignmentResources(assignment: WorkAssignment, resourceType: ResourceType): string[] {
    switch (resourceType) {
      case ResourceType.TRADE_CREW:
        return [assignment.tradeCrewId];
      case ResourceType.VOLUNTEER:
        return assignment.assignedVolunteers.map(v => v.volunteerId);
      default:
        return [];
    }
  }

  private static calculateAssignmentHours(assignment: WorkAssignment, day: Date): number {
    // Simplified calculation - would be more complex in real implementation
    if (isSameDay(assignment.startDate, assignment.endDate)) {
      return differenceInHours(assignment.endDate, assignment.startDate);
    }
    return 8; // Default day hours
  }

  private static getResourcesForDate(assignments: WorkAssignment[], date: Date, resourceType: ResourceType): any[] {
    // Simplified - would return actual resource objects
    return [];
  }

  private static findOptimalDates(
    newAssignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>,
    existingAssignments: WorkAssignment[]
  ): Date[] {
    // Simplified implementation
    return [newAssignment.startDate];
  }

  private static matchVolunteersToRequirements(
    requirements: VolunteerRequirement[],
    availableVolunteers: any[],
    assignmentDate: Date
  ): AssignedVolunteer[] {
    // Simplified implementation
    return [];
  }

  private static matchesRecurrencePattern(date: Date, pattern: any): boolean {
    // Simplified implementation
    return true;
  }

  private static getNextRecurrenceDate(currentDate: Date, pattern: any): Date {
    // Simplified implementation
    return addDays(currentDate, 1);
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
