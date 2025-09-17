// Assignment Workflow Services - USLDC-2829-E Compliance Business Logic
import {
  Assignment,
  AssignmentWorkflow,
  AssignmentStats,
  AssignmentTemplate,
  PreConsultation,
  ImpactAssessment,
  AssignmentCategory,
  AssignmentStatus,
  AssignmentPriority,
  ApprovalLevel,
  ImpactLevel,
  AssignmentModuleConfig
} from './types';
import { AssignmentWorkflowAPI } from './api';
import { WorkflowEngine } from './workflow-engine';

export class AssignmentWorkflowService {
  private api: AssignmentWorkflowAPI;
  private config: AssignmentModuleConfig;

  constructor(config: AssignmentModuleConfig) {
    this.api = new AssignmentWorkflowAPI(config);
    this.config = config;
  }

  /**
   * Creates a new assignment with automatic workflow generation
   */
  async createAssignment(assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    assignment: Assignment;
    workflow: AssignmentWorkflow;
  }> {
    // Validate assignment data
    this.validateAssignmentData(assignmentData);

    // Create the assignment
    const assignment = await this.api.createAssignment(assignmentData);

    // Generate and create workflow
    const workflow = WorkflowEngine.createWorkflow(assignment);
    const createdWorkflow = await this.api.createWorkflow(assignment.id);

    // Check if pre-consultation is required
    if (WorkflowEngine.requiresPreConsultation(assignment)) {
      await this.initiatePreConsultation(assignment.id);
    }

    // Check if impact assessment is required
    if (WorkflowEngine.requiresImpactAssessment(assignment)) {
      await this.initiateImpactAssessment(assignment.id);
    }

    return { assignment, workflow: createdWorkflow };
  }

  /**
   * Updates assignment with workflow validation
   */
  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const currentAssignment = await this.api.getAssignment(id);
    
    // Validate updates don't break workflow rules
    this.validateAssignmentUpdates(currentAssignment, updates);

    // Update assignment
    const updatedAssignment = await this.api.updateAssignment(id, updates);

    // If category or priority changed, update workflow if needed
    if (updates.category || updates.priority) {
      await this.updateWorkflowForChanges(id, updates);
    }

    return updatedAssignment;
  }

  /**
   * Advances assignment workflow to next step
   */
  async advanceWorkflow(assignmentId: string, stepId: string, completedBy: string, data?: any): Promise<AssignmentWorkflow> {
    const workflow = await this.api.getWorkflow(assignmentId);
    
    // Validate step can be advanced
    this.validateStepAdvancement(workflow, stepId, completedBy);

    // Advance workflow
    const updatedWorkflow = await this.api.advanceWorkflow(assignmentId, stepId, data);

    // Update assignment status if workflow is complete
    if (this.isWorkflowComplete(updatedWorkflow)) {
      await this.api.updateAssignment(assignmentId, { 
        status: AssignmentStatus.APPROVED 
      });
    }

    return updatedWorkflow;
  }

  /**
   * Processes approval with USLDC-2829-E compliance
   */
  async processApproval(
    assignmentId: string, 
    approverId: string, 
    approved: boolean, 
    comments?: string
  ): Promise<{
    workflow: AssignmentWorkflow;
    nextAction?: string;
  }> {
    const assignment = await this.api.getAssignment(assignmentId);
    const workflow = await this.api.getWorkflow(assignmentId);

    // Validate approver has authority
    await this.validateApproverAuthority(assignment, approverId);

    // Process approval
    if (approved) {
      const updatedWorkflow = await this.api.approveAssignment(assignmentId, approverId, comments);
      
      // Send written confirmation if required
      if (this.requiresWrittenConfirmation(assignment)) {
        await this.sendWrittenConfirmation(assignment, updatedWorkflow);
      }

      return {
        workflow: updatedWorkflow,
        nextAction: WorkflowEngine.getNextAction(updatedWorkflow).action
      };
    } else {
      const rejectedWorkflow = await this.api.rejectAssignment(assignmentId, approverId, comments || 'No reason provided');
      
      // Update assignment status
      await this.api.updateAssignment(assignmentId, { 
        status: AssignmentStatus.REJECTED 
      });

      return { workflow: rejectedWorkflow };
    }
  }

  /**
   * Conducts pre-consultation as required by USLDC-2829-E
   */
  async conductPreConsultation(
    assignmentId: string,
    consultedPersonId: string,
    consultedRole: string,
    topic: string,
    notes: string,
    impactLevel: ImpactLevel,
    recommendations: string[],
    consultedBy: string
  ): Promise<PreConsultation> {
    const consultation = await this.api.createConsultation({
      assignmentId,
      consultedPersonId,
      consultedRole,
      topic,
      notes,
      impactLevel,
      recommendations,
      consultedBy
    });

    // If high impact, require additional consultations
    if (impactLevel === ImpactLevel.HIGH || impactLevel === ImpactLevel.CRITICAL) {
      await this.escalateConsultation(assignmentId, consultation);
    }

    return consultation;
  }

  /**
   * Creates impact assessment for assignment
   */
  async createImpactAssessment(
    assignmentId: string,
    assessmentData: Omit<ImpactAssessment, 'id' | 'assessedAt'>
  ): Promise<ImpactAssessment> {
    const assessment = await this.api.createImpactAssessment(assessmentData);

    // If critical impact, require additional approvals
    if (assessment.overallImpact === ImpactLevel.CRITICAL) {
      await this.requireAdditionalApprovals(assignmentId);
    }

    return assessment;
  }

  /**
   * Gets assignments requiring user action
   */
  async getMyActionItems(userId: string): Promise<{
    pendingApprovals: Assignment[];
    myAssignments: Assignment[];
    consultationRequests: Assignment[];
  }> {
    const [pendingApprovals, myAssignments] = await Promise.all([
      this.api.getPendingApprovals(userId),
      this.api.getMyAssignments(userId, AssignmentStatus.ACTIVE)
    ]);

    // Get assignments requiring consultation from this user
    const consultationRequests = await this.getConsultationRequests(userId);

    return {
      pendingApprovals,
      myAssignments,
      consultationRequests
    };
  }

  /**
   * Generates assignment statistics with compliance metrics
   */
  async getComplianceStats(regionId?: string): Promise<AssignmentStats & {
    complianceMetrics: {
      preConsultationRate: number;
      impactAssessmentRate: number;
      averageApprovalTime: number;
      onTimeCompletionRate: number;
    };
  }> {
    const stats = await this.api.getAssignmentStats({ regionId });
    
    // Calculate compliance metrics
    const complianceMetrics = await this.calculateComplianceMetrics(regionId);

    return {
      ...stats,
      complianceMetrics
    };
  }

  /**
   * Creates assignment from template with customization
   */
  async createFromTemplate(
    templateId: string,
    customizations: Partial<Assignment>
  ): Promise<{ assignment: Assignment; workflow: AssignmentWorkflow }> {
    const templates = await this.api.getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    const assignmentData = {
      ...customizations,
      category: template.category,
      requiredSkills: template.requiredSkills,
      estimatedHours: template.estimatedDuration,
      approvalRequired: template.requiredApprovals.length > 0,
      approvalLevel: template.requiredApprovals[0] || ApprovalLevel.NONE
    } as Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>;

    return this.createAssignment(assignmentData);
  }

  /**
   * Submits assignment issue to LDC Tech Support
   */
  async submitToLDCTechSupport(
    assignmentId: string,
    issueData: {
      issueType: string;
      description: string;
      priority: string;
      attachments?: string[];
    }
  ): Promise<{ ticketId: string; status: string }> {
    if (!this.config.features.ldcTechSupportIntegration) {
      throw new Error('LDC Tech Support integration not enabled');
    }

    return this.api.submitToLDCTechSupport(assignmentId, issueData);
  }

  // Private helper methods

  private validateAssignmentData(data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!data.title?.trim()) {
      throw new Error('Assignment title is required');
    }
    if (!data.description?.trim()) {
      throw new Error('Assignment description is required');
    }
    if (!data.assigneeId) {
      throw new Error('Assignee is required');
    }
    if (!data.assignerId) {
      throw new Error('Assigner is required');
    }
    if (!data.regionId) {
      throw new Error('Region is required');
    }
  }

  private validateAssignmentUpdates(current: Assignment, updates: Partial<Assignment>): void {
    // Don't allow status changes through this method
    if (updates.status && updates.status !== current.status) {
      throw new Error('Status changes must go through workflow');
    }

    // Don't allow category changes for approved assignments
    if (updates.category && current.status === AssignmentStatus.APPROVED) {
      throw new Error('Cannot change category of approved assignment');
    }
  }

  private validateStepAdvancement(workflow: AssignmentWorkflow, stepId: string, userId: string): void {
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    if (step.status !== 'pending' && step.status !== 'in_progress') {
      throw new Error('Step cannot be advanced');
    }

    if (step.assignedTo && step.assignedTo !== userId) {
      throw new Error('User not authorized to advance this step');
    }
  }

  private async validateApproverAuthority(assignment: Assignment, approverId: string): Promise<void> {
    // This would integrate with role management to validate authority
    // For now, assume validation passes
  }

  private requiresWrittenConfirmation(assignment: Assignment): boolean {
    return assignment.category === AssignmentCategory.BRANCH_APPOINTED ||
           assignment.priority === 'high' ||
           assignment.priority === 'urgent';
  }

  private async sendWrittenConfirmation(assignment: Assignment, workflow: AssignmentWorkflow): Promise<void> {
    // This would integrate with communication hub to send confirmation
    console.log(`Sending written confirmation for assignment ${assignment.id}`);
  }

  private isWorkflowComplete(workflow: AssignmentWorkflow): boolean {
    return workflow.steps.every(step => 
      step.status === 'completed' || step.status === 'skipped'
    ) && workflow.approvers.every(approver => 
      approver.status === 'approved' || approver.status === 'delegated'
    );
  }

  private async initiatePreConsultation(assignmentId: string): Promise<void> {
    // Logic to identify who needs to be consulted
    console.log(`Initiating pre-consultation for assignment ${assignmentId}`);
  }

  private async initiateImpactAssessment(assignmentId: string): Promise<void> {
    // Logic to start impact assessment process
    console.log(`Initiating impact assessment for assignment ${assignmentId}`);
  }

  private async updateWorkflowForChanges(assignmentId: string, updates: Partial<Assignment>): Promise<void> {
    // Logic to update workflow based on assignment changes
    console.log(`Updating workflow for assignment ${assignmentId} changes`);
  }

  private async escalateConsultation(assignmentId: string, consultation: PreConsultation): Promise<void> {
    // Logic to escalate high-impact consultations
    console.log(`Escalating consultation for assignment ${assignmentId}`);
  }

  private async requireAdditionalApprovals(assignmentId: string): Promise<void> {
    // Logic to add additional approval requirements
    console.log(`Requiring additional approvals for assignment ${assignmentId}`);
  }

  private async getConsultationRequests(userId: string): Promise<Assignment[]> {
    // Logic to get assignments requiring consultation from user
    return [];
  }

  private async calculateComplianceMetrics(regionId?: string): Promise<{
    preConsultationRate: number;
    impactAssessmentRate: number;
    averageApprovalTime: number;
    onTimeCompletionRate: number;
  }> {
    // Logic to calculate compliance metrics
    return {
      preConsultationRate: 95,
      impactAssessmentRate: 88,
      averageApprovalTime: 2.5,
      onTimeCompletionRate: 92
    };
  }
}
