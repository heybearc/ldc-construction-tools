// Assignment Workflow Engine - USLDC-2829-E Compliance Logic
import {
  Assignment,
  AssignmentWorkflow,
  WorkflowStep,
  WorkflowApprover,
  AssignmentCategory,
  AssignmentStatus,
  ApprovalLevel,
  StepStatus,
  ApprovalStatus,
  ImpactAssessment,
  PreConsultation,
  ImpactLevel
} from './types';

export class WorkflowEngine {
  
  /**
   * Creates a workflow based on assignment category and USLDC-2829-E requirements
   */
  static createWorkflow(assignment: Assignment): AssignmentWorkflow {
    const steps = this.generateWorkflowSteps(assignment);
    const approvers = this.generateApprovers(assignment);
    
    return {
      id: this.generateId(),
      assignmentId: assignment.id,
      currentStep: steps[0],
      steps,
      approvers,
      consultations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generates workflow steps based on assignment category
   */
  private static generateWorkflowSteps(assignment: Assignment): WorkflowStep[] {
    const baseSteps: Omit<WorkflowStep, 'id'>[] = [
      {
        name: 'Initial Review',
        description: 'Review assignment details and requirements',
        status: StepStatus.PENDING,
        requiredDocuments: [],
        order: 1
      }
    ];

    // Add pre-consultation step for branch-appointed assignments
    if (assignment.category === AssignmentCategory.BRANCH_APPOINTED) {
      baseSteps.push({
        name: 'Pre-Consultation',
        description: 'Consult with affected parties before assignment',
        status: StepStatus.PENDING,
        requiredDocuments: ['consultation_notes'],
        order: 2
      });
    }

    // Add impact assessment for high-priority assignments
    if (assignment.priority === 'high' || assignment.priority === 'urgent') {
      baseSteps.push({
        name: 'Impact Assessment',
        description: 'Assess impact on other roles and projects',
        status: StepStatus.PENDING,
        requiredDocuments: ['impact_assessment'],
        order: baseSteps.length + 1
      });
    }

    // Add approval steps based on category
    const approvalSteps = this.getApprovalSteps(assignment);
    baseSteps.push(...approvalSteps);

    // Add final confirmation step
    baseSteps.push({
      name: 'Final Confirmation',
      description: 'Confirm assignment details and send written confirmation',
      status: StepStatus.PENDING,
      requiredDocuments: ['written_confirmation'],
      order: baseSteps.length + 1
    });

    // Convert to full WorkflowStep objects
    return baseSteps.map(step => ({
      ...step,
      id: this.generateId()
    }));
  }

  /**
   * Generates approval steps based on assignment category
   */
  private static getApprovalSteps(assignment: Assignment): Omit<WorkflowStep, 'id'>[] {
    const steps: Omit<WorkflowStep, 'id'>[] = [];

    switch (assignment.category) {
      case AssignmentCategory.BRANCH_APPOINTED:
        steps.push({
          name: 'Branch Approval',
          description: 'Branch committee approval required for branch-appointed assignments',
          status: StepStatus.PENDING,
          requiredDocuments: ['branch_approval_form'],
          order: 0 // Will be updated
        });
        break;

      case AssignmentCategory.FIELD_ASSIGNED:
        steps.push({
          name: 'Overseer Approval',
          description: 'Field overseer approval for field assignments',
          status: StepStatus.PENDING,
          requiredDocuments: ['overseer_approval'],
          order: 0 // Will be updated
        });
        break;

      case AssignmentCategory.EMERGENCY:
        steps.push({
          name: 'Emergency Approval',
          description: 'Expedited approval for emergency assignments',
          status: StepStatus.PENDING,
          requiredDocuments: ['emergency_justification'],
          order: 0 // Will be updated
        });
        break;

      case AssignmentCategory.SPECIAL_PROJECT:
        steps.push({
          name: 'Zone Approval',
          description: 'Zone oversight approval for special projects',
          status: StepStatus.PENDING,
          requiredDocuments: ['zone_approval_form'],
          order: 0 // Will be updated
        });
        break;
    }

    return steps;
  }

  /**
   * Generates approvers based on assignment requirements
   */
  private static generateApprovers(assignment: Assignment): WorkflowApprover[] {
    const approvers: Omit<WorkflowApprover, 'id'>[] = [];

    switch (assignment.category) {
      case AssignmentCategory.BRANCH_APPOINTED:
        approvers.push({
          userId: '', // To be filled by system
          role: 'Branch Committee',
          level: ApprovalLevel.BRANCH,
          status: ApprovalStatus.PENDING,
          order: 1
        });
        break;

      case AssignmentCategory.FIELD_ASSIGNED:
        approvers.push({
          userId: '', // To be filled by system
          role: 'Field Overseer',
          level: ApprovalLevel.OVERSEER,
          status: ApprovalStatus.PENDING,
          order: 1
        });
        break;

      case AssignmentCategory.SPECIAL_PROJECT:
        approvers.push({
          userId: '', // To be filled by system
          role: 'Zone Overseer',
          level: ApprovalLevel.ZONE,
          status: ApprovalStatus.PENDING,
          order: 1
        });
        break;
    }

    return approvers.map(approver => ({
      ...approver,
      id: this.generateId()
    }));
  }

  /**
   * Advances workflow to next step
   */
  static advanceWorkflow(
    workflow: AssignmentWorkflow, 
    stepId: string, 
    completedBy: string,
    data?: any
  ): AssignmentWorkflow {
    const stepIndex = workflow.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) {
      throw new Error('Step not found');
    }

    // Mark current step as completed
    workflow.steps[stepIndex] = {
      ...workflow.steps[stepIndex],
      status: StepStatus.COMPLETED,
      completedBy,
      completedAt: new Date(),
      notes: data?.notes
    };

    // Move to next step if available
    const nextStep = workflow.steps[stepIndex + 1];
    if (nextStep) {
      workflow.currentStep = nextStep;
      workflow.steps[stepIndex + 1] = {
        ...nextStep,
        status: StepStatus.IN_PROGRESS
      };
    }

    workflow.updatedAt = new Date();
    return workflow;
  }

  /**
   * Processes approval for assignment
   */
  static processApproval(
    workflow: AssignmentWorkflow,
    approverId: string,
    approved: boolean,
    comments?: string
  ): AssignmentWorkflow {
    const approverIndex = workflow.approvers.findIndex(
      approver => approver.userId === approverId && approver.status === ApprovalStatus.PENDING
    );

    if (approverIndex === -1) {
      throw new Error('Approver not found or already processed');
    }

    // Update approver status
    workflow.approvers[approverIndex] = {
      ...workflow.approvers[approverIndex],
      status: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
      comments,
      approvedAt: new Date()
    };

    // Check if all required approvals are complete
    const pendingApprovals = workflow.approvers.filter(
      approver => approver.status === ApprovalStatus.PENDING
    );

    if (pendingApprovals.length === 0) {
      // All approvals processed - check if all approved
      const allApproved = workflow.approvers.every(
        approver => approver.status === ApprovalStatus.APPROVED
      );

      if (allApproved) {
        // Advance to next step in workflow
        const currentStepIndex = workflow.steps.findIndex(
          step => step.id === workflow.currentStep.id
        );
        if (currentStepIndex < workflow.steps.length - 1) {
          workflow.currentStep = workflow.steps[currentStepIndex + 1];
        }
      }
    }

    workflow.updatedAt = new Date();
    return workflow;
  }

  /**
   * Validates if pre-consultation is required
   */
  static requiresPreConsultation(assignment: Assignment): boolean {
    return assignment.category === AssignmentCategory.BRANCH_APPOINTED ||
           assignment.impactedRoles.length > 0 ||
           assignment.priority === 'high' ||
           assignment.priority === 'urgent';
  }

  /**
   * Validates if impact assessment is required
   */
  static requiresImpactAssessment(assignment: Assignment): boolean {
    return assignment.impactedRoles.length > 2 ||
           assignment.priority === 'high' ||
           assignment.priority === 'urgent' ||
           assignment.category === AssignmentCategory.BRANCH_APPOINTED;
  }

  /**
   * Calculates workflow completion percentage
   */
  static calculateProgress(workflow: AssignmentWorkflow): number {
    const completedSteps = workflow.steps.filter(
      step => step.status === StepStatus.COMPLETED
    ).length;
    
    return Math.round((completedSteps / workflow.steps.length) * 100);
  }

  /**
   * Gets next required action for workflow
   */
  static getNextAction(workflow: AssignmentWorkflow): {
    action: string;
    assignedTo?: string;
    description: string;
    urgent: boolean;
  } {
    const currentStep = workflow.currentStep;
    
    if (currentStep.status === StepStatus.PENDING) {
      return {
        action: currentStep.name,
        assignedTo: currentStep.assignedTo,
        description: currentStep.description,
        urgent: currentStep.name.includes('Emergency') || currentStep.name.includes('Urgent')
      };
    }

    const pendingApprovals = workflow.approvers.filter(
      approver => approver.status === ApprovalStatus.PENDING
    );

    if (pendingApprovals.length > 0) {
      const nextApprover = pendingApprovals[0];
      return {
        action: 'Approval Required',
        assignedTo: nextApprover.userId,
        description: `${nextApprover.role} approval needed`,
        urgent: false
      };
    }

    return {
      action: 'Complete',
      description: 'Workflow completed',
      urgent: false
    };
  }

  /**
   * Validates workflow state
   */
  static validateWorkflow(workflow: AssignmentWorkflow): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if steps are in correct order
    const orderedSteps = workflow.steps.sort((a, b) => a.order - b.order);
    if (JSON.stringify(orderedSteps) !== JSON.stringify(workflow.steps)) {
      errors.push('Workflow steps are not in correct order');
    }

    // Check for required documents
    const incompleteSteps = workflow.steps.filter(
      step => step.status === StepStatus.COMPLETED && 
              step.requiredDocuments.length > 0 &&
              !step.notes?.includes('documents_verified')
    );

    if (incompleteSteps.length > 0) {
      errors.push('Some completed steps are missing required documents');
    }

    // Check approver consistency
    const duplicateApprovers = workflow.approvers.filter(
      (approver, index) => workflow.approvers.findIndex(a => a.userId === approver.userId) !== index
    );

    if (duplicateApprovers.length > 0) {
      errors.push('Duplicate approvers found');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
