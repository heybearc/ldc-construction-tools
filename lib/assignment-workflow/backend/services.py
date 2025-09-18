"""
Assignment Workflow Business Logic Services
USLDC-2829-E Compliant Assignment Processing Engine
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import json
import logging

from .models import (
    AssignmentRequest, AssignmentApproval, WorkflowState, 
    CapacityAllocation, AssignmentHistory,
    AssignmentType, AssignmentStatus, ApprovalStatus,
    WORKFLOW_STATES, CAPACITY_LIMITS
)
from .schemas import (
    AssignmentRequestCreate, CapacityCheckResponse,
    AssignmentStatistics, CrewUtilizationStats
)

logger = logging.getLogger(__name__)

class AssignmentWorkflowService:
    """Core service for assignment workflow processing."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_assignment_request(
        self, 
        request_data: AssignmentRequestCreate, 
        requester_id: int
    ) -> AssignmentRequest:
        """Create a new assignment request with full validation."""
        
        # Validate business rules
        await self._validate_assignment_request(request_data, requester_id)
        
        # Check capacity availability
        if request_data.trade_crew_id:
            capacity_check = await self.check_capacity_availability(
                request_data.trade_crew_id,
                request_data.start_date,
                request_data.end_date
            )
            
            if not capacity_check.available and request_data.assignment_type != AssignmentType.EMERGENCY:
                raise ValueError(f"Insufficient capacity. Available: {capacity_check.available_capacity}%")
        
        # Create the assignment request
        assignment = AssignmentRequest(
            requester_id=requester_id,
            assignment_type=AssignmentType(request_data.assignment_type),
            priority_level=request_data.priority_level,
            requested_role=request_data.requested_role,
            project_id=request_data.project_id,
            trade_team_id=request_data.trade_team_id,
            trade_crew_id=request_data.trade_crew_id,
            start_date=request_data.start_date,
            end_date=request_data.end_date,
            description=request_data.description,
            requirements=request_data.requirements,
            status=AssignmentStatus.PENDING
        )
        
        self.db.add(assignment)
        self.db.flush()  # Get the ID
        
        # Initialize workflow
        await self._initialize_workflow(assignment)
        
        # Reserve capacity if crew specified
        if request_data.trade_crew_id:
            await self._reserve_capacity(assignment)
        
        # Log the creation
        await self._log_assignment_history(
            assignment.id,
            "status",
            None,
            "pending",
            "Assignment request created",
            requester_id
        )
        
        self.db.commit()
        logger.info(f"Assignment request {assignment.id} created by user {requester_id}")
        
        return assignment
    
    async def process_approval(
        self, 
        assignment_id: int, 
        approver_id: int, 
        decision: ApprovalStatus, 
        comments: Optional[str] = None
    ) -> AssignmentApproval:
        """Process an approval decision and update workflow state."""
        
        # Get pending approval
        approval = self.db.query(AssignmentApproval).filter(
            AssignmentApproval.assignment_request_id == assignment_id,
            AssignmentApproval.approver_id == approver_id,
            AssignmentApproval.status == ApprovalStatus.PENDING
        ).first()
        
        if not approval:
            raise ValueError("No pending approval found for this user")
        
        # Update approval
        approval.status = decision
        approval.comments = comments
        approval.approved_at = datetime.utcnow()
        
        # Get assignment request
        assignment = self.db.query(AssignmentRequest).filter(
            AssignmentRequest.id == assignment_id
        ).first()
        
        # Update workflow state
        await self._update_workflow_state(assignment, approval)
        
        # Log the approval
        await self._log_assignment_history(
            assignment_id,
            "approval_status",
            "pending",
            decision.value,
            f"Approval decision: {decision.value}. Comments: {comments or 'None'}",
            approver_id
        )
        
        self.db.commit()
        logger.info(f"Approval processed for assignment {assignment_id} by user {approver_id}: {decision.value}")
        
        return approval
    
    async def check_capacity_availability(
        self, 
        trade_crew_id: int, 
        start_date: datetime, 
        end_date: Optional[datetime] = None
    ) -> CapacityCheckResponse:
        """Check capacity availability for a trade crew."""
        
        if not end_date:
            end_date = start_date + timedelta(hours=8)  # Default 8-hour assignment
        
        # Get existing confirmed allocations
        existing_allocations = self.db.query(CapacityAllocation).filter(
            CapacityAllocation.trade_crew_id == trade_crew_id,
            CapacityAllocation.start_date < end_date,
            CapacityAllocation.end_date > start_date,
            CapacityAllocation.is_confirmed == True
        ).all()
        
        # Calculate utilization
        total_utilization = sum(a.allocation_percentage for a in existing_allocations)
        available_capacity = max(0, 100 - total_utilization)
        
        return CapacityCheckResponse(
            trade_crew_id=trade_crew_id,
            start_date=start_date,
            end_date=end_date,
            available=available_capacity > 0,
            available_capacity=available_capacity,
            current_utilization=total_utilization,
            conflicting_assignments=len(existing_allocations)
        )
    
    async def get_assignment_statistics(
        self, 
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> AssignmentStatistics:
        """Get assignment statistics for reporting."""
        
        query = self.db.query(AssignmentRequest)
        
        if start_date:
            query = query.filter(AssignmentRequest.created_at >= start_date)
        if end_date:
            query = query.filter(AssignmentRequest.created_at <= end_date)
        
        all_requests = query.all()
        
        # Calculate statistics
        total_requests = len(all_requests)
        pending_requests = len([r for r in all_requests if r.status == AssignmentStatus.PENDING])
        approved_requests = len([r for r in all_requests if r.status == AssignmentStatus.APPROVED])
        rejected_requests = len([r for r in all_requests if r.status == AssignmentStatus.REJECTED])
        completed_requests = len([r for r in all_requests if r.status == AssignmentStatus.COMPLETED])
        
        emergency_requests = len([r for r in all_requests if r.assignment_type == AssignmentType.EMERGENCY])
        standard_requests = len([r for r in all_requests if r.assignment_type == AssignmentType.STANDARD])
        scheduled_requests = len([r for r in all_requests if r.assignment_type == AssignmentType.SCHEDULED])
        
        # Calculate average approval time
        approved_with_times = [
            r for r in all_requests 
            if r.status in [AssignmentStatus.APPROVED, AssignmentStatus.COMPLETED]
        ]
        
        if approved_with_times:
            approval_times = []
            for request in approved_with_times:
                approvals = self.db.query(AssignmentApproval).filter(
                    AssignmentApproval.assignment_request_id == request.id,
                    AssignmentApproval.status == ApprovalStatus.APPROVED
                ).order_by(AssignmentApproval.approved_at.desc()).all()
                
                if approvals:
                    time_diff = approvals[0].approved_at - request.created_at
                    approval_times.append(time_diff.total_seconds() / 3600)  # Convert to hours
            
            average_approval_time = sum(approval_times) / len(approval_times) if approval_times else 0
        else:
            average_approval_time = 0
        
        return AssignmentStatistics(
            total_requests=total_requests,
            pending_requests=pending_requests,
            approved_requests=approved_requests,
            rejected_requests=rejected_requests,
            completed_requests=completed_requests,
            average_approval_time_hours=round(average_approval_time, 2),
            emergency_requests=emergency_requests,
            standard_requests=standard_requests,
            scheduled_requests=scheduled_requests
        )
    
    async def get_crew_utilization_stats(
        self, 
        trade_crew_ids: Optional[List[int]] = None
    ) -> List[CrewUtilizationStats]:
        """Get utilization statistics for trade crews."""
        
        # Get all crews or specified crews
        from app.models import TradeCrew  # Import here to avoid circular imports
        
        query = self.db.query(TradeCrew)
        if trade_crew_ids:
            query = query.filter(TradeCrew.id.in_(trade_crew_ids))
        
        crews = query.all()
        stats = []
        
        for crew in crews:
            # Get current allocations
            current_allocations = self.db.query(CapacityAllocation).filter(
                CapacityAllocation.trade_crew_id == crew.id,
                CapacityAllocation.start_date <= datetime.utcnow(),
                CapacityAllocation.end_date >= datetime.utcnow(),
                CapacityAllocation.is_confirmed == True
            ).all()
            
            current_utilization = sum(a.allocation_percentage for a in current_allocations)
            
            # Get historical allocations for averages
            historical_allocations = self.db.query(CapacityAllocation).filter(
                CapacityAllocation.trade_crew_id == crew.id,
                CapacityAllocation.is_confirmed == True
            ).all()
            
            if historical_allocations:
                average_utilization = sum(a.allocation_percentage for a in historical_allocations) / len(historical_allocations)
                peak_utilization = max(a.allocation_percentage for a in historical_allocations)
            else:
                average_utilization = 0
                peak_utilization = 0
            
            # Get assignment counts
            total_assignments = self.db.query(AssignmentRequest).filter(
                AssignmentRequest.trade_crew_id == crew.id
            ).count()
            
            completed_assignments = self.db.query(AssignmentRequest).filter(
                AssignmentRequest.trade_crew_id == crew.id,
                AssignmentRequest.status == AssignmentStatus.COMPLETED
            ).count()
            
            stats.append(CrewUtilizationStats(
                trade_crew_id=crew.id,
                crew_name=crew.name,
                current_utilization=min(current_utilization, 100),
                average_utilization=round(average_utilization, 2),
                peak_utilization=min(peak_utilization, 100),
                total_assignments=total_assignments,
                completed_assignments=completed_assignments
            ))
        
        return stats
    
    # Private helper methods
    
    async def _validate_assignment_request(
        self, 
        request_data: AssignmentRequestCreate, 
        requester_id: int
    ):
        """Validate assignment request against business rules."""
        
        # Check if requester has permission to create assignments
        # TODO: Integrate with role management system
        
        # Validate assignment type specific rules
        if request_data.assignment_type == AssignmentType.EMERGENCY:
            if request_data.priority_level > 2:
                raise ValueError("Emergency assignments must have priority level 1 or 2")
        
        # Validate time constraints
        if request_data.start_date < datetime.utcnow():
            if request_data.assignment_type != AssignmentType.EMERGENCY:
                raise ValueError("Cannot create assignments in the past (except emergency)")
        
        # Validate crew and team relationships
        if request_data.trade_crew_id and request_data.trade_team_id:
            # TODO: Validate that crew belongs to team
            pass
    
    async def _initialize_workflow(self, assignment: AssignmentRequest):
        """Initialize the workflow state for a new assignment."""
        
        workflow_config = WORKFLOW_STATES[assignment.assignment_type.value.upper()]
        initial_state = workflow_config["initial"]
        
        # Create initial workflow state
        workflow_state = WorkflowState(
            assignment_request_id=assignment.id,
            current_state=initial_state,
            state_data={"created_by": assignment.requester_id},
            created_by=assignment.requester_id
        )
        
        self.db.add(workflow_state)
        
        # Create initial approval record
        next_approver_id = await self._get_next_approver(assignment)
        if next_approver_id:
            approval = AssignmentApproval(
                assignment_request_id=assignment.id,
                approver_id=next_approver_id,
                approval_level=1,
                status=ApprovalStatus.PENDING
            )
            self.db.add(approval)
    
    async def _reserve_capacity(self, assignment: AssignmentRequest):
        """Reserve capacity for the assignment."""
        
        if not assignment.trade_crew_id:
            return
        
        # Calculate required capacity (default to 25% for standard assignments)
        required_percentage = 25
        if assignment.assignment_type == AssignmentType.EMERGENCY:
            required_percentage = 50
        elif assignment.assignment_type == AssignmentType.SCHEDULED:
            required_percentage = 20
        
        # Create capacity allocation
        allocation = CapacityAllocation(
            assignment_request_id=assignment.id,
            trade_crew_id=assignment.trade_crew_id,
            allocated_capacity=1,  # Number of people
            allocation_percentage=required_percentage,
            start_date=assignment.start_date,
            end_date=assignment.end_date or assignment.start_date + timedelta(hours=8),
            is_confirmed=False  # Will be confirmed when approved
        )
        
        self.db.add(allocation)
    
    async def _update_workflow_state(
        self, 
        assignment: AssignmentRequest, 
        approval: AssignmentApproval
    ):
        """Update workflow state based on approval decision."""
        
        workflow_config = WORKFLOW_STATES[assignment.assignment_type.value.upper()]
        
        # Get current state
        current_states = self.db.query(WorkflowState).filter(
            WorkflowState.assignment_request_id == assignment.id
        ).order_by(WorkflowState.created_at.desc()).all()
        
        current_state = current_states[0].current_state if current_states else workflow_config["initial"]
        
        if approval.status == ApprovalStatus.APPROVED:
            # Move to next state
            possible_states = workflow_config["states"][current_state]
            next_state = possible_states[0] if possible_states else current_state
            
            if next_state == "approved":
                assignment.status = AssignmentStatus.APPROVED
                # Confirm capacity allocation
                await self._confirm_capacity_allocation(assignment.id)
            elif next_state.startswith("pending_"):
                # Create next approval record
                next_approver_id = await self._get_next_approver(assignment)
                if next_approver_id:
                    next_approval = AssignmentApproval(
                        assignment_request_id=assignment.id,
                        approver_id=next_approver_id,
                        approval_level=approval.approval_level + 1,
                        status=ApprovalStatus.PENDING
                    )
                    self.db.add(next_approval)
        
        elif approval.status == ApprovalStatus.REJECTED:
            assignment.status = AssignmentStatus.REJECTED
            next_state = "rejected"
            # Release capacity allocation
            await self._release_capacity_allocation(assignment.id)
        
        # Create new workflow state record
        new_workflow_state = WorkflowState(
            assignment_request_id=assignment.id,
            current_state=next_state,
            state_data={
                "approval_id": approval.id,
                "approver_id": approval.approver_id,
                "decision": approval.status.value
            },
            created_by=approval.approver_id
        )
        
        self.db.add(new_workflow_state)
    
    async def _get_next_approver(self, assignment: AssignmentRequest) -> Optional[int]:
        """Get the next approver based on assignment type and organizational hierarchy."""
        
        # TODO: Integrate with role management system to get proper approver
        # For now, return a placeholder based on assignment type
        
        if assignment.assignment_type == AssignmentType.EMERGENCY:
            # Emergency assignments need supervisor approval only
            return 1  # Placeholder supervisor ID
        elif assignment.assignment_type == AssignmentType.STANDARD:
            # Standard assignments need supervisor then coordinator
            existing_approvals = self.db.query(AssignmentApproval).filter(
                AssignmentApproval.assignment_request_id == assignment.id
            ).count()
            
            if existing_approvals == 0:
                return 1  # Supervisor
            else:
                return 2  # Coordinator
        elif assignment.assignment_type == AssignmentType.SCHEDULED:
            # Scheduled assignments need supervisor, coordinator, then manager
            existing_approvals = self.db.query(AssignmentApproval).filter(
                AssignmentApproval.assignment_request_id == assignment.id
            ).count()
            
            if existing_approvals == 0:
                return 1  # Supervisor
            elif existing_approvals == 1:
                return 2  # Coordinator
            else:
                return 3  # Manager
        
        return None
    
    async def _confirm_capacity_allocation(self, assignment_id: int):
        """Confirm capacity allocation when assignment is approved."""
        
        allocations = self.db.query(CapacityAllocation).filter(
            CapacityAllocation.assignment_request_id == assignment_id
        ).all()
        
        for allocation in allocations:
            allocation.is_confirmed = True
            allocation.updated_at = datetime.utcnow()
    
    async def _release_capacity_allocation(self, assignment_id: int):
        """Release capacity allocation when assignment is rejected or cancelled."""
        
        allocations = self.db.query(CapacityAllocation).filter(
            CapacityAllocation.assignment_request_id == assignment_id
        ).all()
        
        for allocation in allocations:
            self.db.delete(allocation)
    
    async def _log_assignment_history(
        self, 
        assignment_id: int, 
        field_name: str, 
        old_value: Optional[str], 
        new_value: Optional[str], 
        change_reason: Optional[str], 
        changed_by: int
    ):
        """Log changes to assignment history for audit trail."""
        
        history = AssignmentHistory(
            assignment_request_id=assignment_id,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            change_reason=change_reason,
            changed_by=changed_by
        )
        
        self.db.add(history)
