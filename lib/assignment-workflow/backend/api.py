"""
Assignment Workflow API Endpoints
USLDC-2829-E Compliant Assignment Processing System
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from .models import (
    AssignmentRequest, AssignmentApproval, WorkflowState, 
    CapacityAllocation, AssignmentHistory,
    AssignmentType, AssignmentStatus, ApprovalStatus,
    WORKFLOW_STATES, CAPACITY_LIMITS
)
from .schemas import (
    AssignmentRequestCreate, AssignmentRequestResponse,
    AssignmentApprovalCreate, AssignmentApprovalResponse,
    CapacityCheckRequest, CapacityCheckResponse,
    WorkflowStatusResponse
)
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/assignments", tags=["assignments"])

# Assignment Request Endpoints

@router.post("/requests", response_model=AssignmentRequestResponse)
async def create_assignment_request(
    request: AssignmentRequestCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new assignment request with USLDC-2829-E compliance validation."""
    
    # Validate assignment type and priority
    if request.assignment_type not in [t.value for t in AssignmentType]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assignment type"
        )
    
    # Check capacity availability
    capacity_check = await check_capacity_availability(
        trade_crew_id=request.trade_crew_id,
        start_date=request.start_date,
        end_date=request.end_date,
        db=db
    )
    
    if not capacity_check.available and request.assignment_type != AssignmentType.EMERGENCY:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient capacity. Available: {capacity_check.available_capacity}"
        )
    
    # Create assignment request
    db_request = AssignmentRequest(
        requester_id=current_user.id,
        assignment_type=AssignmentType(request.assignment_type),
        priority_level=request.priority_level,
        requested_role=request.requested_role,
        project_id=request.project_id,
        trade_team_id=request.trade_team_id,
        trade_crew_id=request.trade_crew_id,
        start_date=request.start_date,
        end_date=request.end_date,
        description=request.description,
        requirements=request.requirements,
        status=AssignmentStatus.PENDING
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    # Initialize workflow state
    initial_state = WORKFLOW_STATES[request.assignment_type.upper()]["initial"]
    workflow_state = WorkflowState(
        assignment_request_id=db_request.id,
        current_state=initial_state,
        state_data={"created_by": current_user.id},
        created_by=current_user.id
    )
    
    db.add(workflow_state)
    
    # Create initial approval record
    approval = AssignmentApproval(
        assignment_request_id=db_request.id,
        approver_id=await get_next_approver(db_request, db),
        approval_level=1,
        status=ApprovalStatus.PENDING
    )
    
    db.add(approval)
    db.commit()
    
    return db_request

@router.get("/requests", response_model=List[AssignmentRequestResponse])
async def list_assignment_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    status: Optional[str] = Query(None),
    assignment_type: Optional[str] = Query(None),
    requester_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List assignment requests with filtering and pagination."""
    
    query = db.query(AssignmentRequest)
    
    # Apply filters
    if status:
        query = query.filter(AssignmentRequest.status == status)
    if assignment_type:
        query = query.filter(AssignmentRequest.assignment_type == assignment_type)
    if requester_id:
        query = query.filter(AssignmentRequest.requester_id == requester_id)
    
    # Role-based filtering
    if not await has_admin_role(current_user):
        # Non-admin users can only see their own requests or requests they can approve
        query = query.filter(
            (AssignmentRequest.requester_id == current_user.id) |
            (AssignmentRequest.id.in_(await get_approvable_requests(current_user, db)))
        )
    
    requests = query.offset(skip).limit(limit).all()
    return requests

@router.get("/requests/{request_id}", response_model=AssignmentRequestResponse)
async def get_assignment_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific assignment request with full details."""
    
    request = db.query(AssignmentRequest).filter(AssignmentRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment request not found"
        )
    
    # Check access permissions
    if not await can_access_request(request, current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to access this request"
        )
    
    return request

@router.put("/requests/{request_id}", response_model=AssignmentRequestResponse)
async def update_assignment_request(
    request_id: int,
    updates: AssignmentRequestCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update an assignment request (only if in pending status)."""
    
    request = db.query(AssignmentRequest).filter(AssignmentRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment request not found"
        )
    
    # Only requester or admin can update
    if request.requester_id != current_user.id and not await has_admin_role(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the requester can update this request"
        )
    
    # Can only update pending requests
    if request.status != AssignmentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update pending requests"
        )
    
    # Update fields
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(request, field, value)
    
    request.updated_at = datetime.utcnow()
    db.commit()
    
    return request

# Approval Workflow Endpoints

@router.post("/approvals", response_model=AssignmentApprovalResponse)
async def submit_approval_decision(
    approval: AssignmentApprovalCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Submit an approval decision for an assignment request."""
    
    # Get the pending approval
    db_approval = db.query(AssignmentApproval).filter(
        AssignmentApproval.assignment_request_id == approval.assignment_request_id,
        AssignmentApproval.approver_id == current_user.id,
        AssignmentApproval.status == ApprovalStatus.PENDING
    ).first()
    
    if not db_approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending approval found for this user"
        )
    
    # Update approval
    db_approval.status = ApprovalStatus(approval.status)
    db_approval.comments = approval.comments
    db_approval.approved_at = datetime.utcnow()
    
    # Get the assignment request
    assignment_request = db.query(AssignmentRequest).filter(
        AssignmentRequest.id == approval.assignment_request_id
    ).first()
    
    # Update workflow state
    await update_workflow_state(assignment_request, db_approval, db)
    
    db.commit()
    return db_approval

@router.get("/approvals/pending", response_model=List[AssignmentApprovalResponse])
async def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all pending approvals for the current user."""
    
    approvals = db.query(AssignmentApproval).filter(
        AssignmentApproval.approver_id == current_user.id,
        AssignmentApproval.status == ApprovalStatus.PENDING
    ).all()
    
    return approvals

@router.get("/workflow/{request_id}", response_model=WorkflowStatusResponse)
async def get_workflow_status(
    request_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get the current workflow status for an assignment request."""
    
    request = db.query(AssignmentRequest).filter(AssignmentRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment request not found"
        )
    
    # Get workflow states
    workflow_states = db.query(WorkflowState).filter(
        WorkflowState.assignment_request_id == request_id
    ).order_by(WorkflowState.created_at).all()
    
    # Get approvals
    approvals = db.query(AssignmentApproval).filter(
        AssignmentApproval.assignment_request_id == request_id
    ).order_by(AssignmentApproval.created_at).all()
    
    return {
        "assignment_request": request,
        "current_state": workflow_states[-1].current_state if workflow_states else "unknown",
        "workflow_history": workflow_states,
        "approvals": approvals,
        "next_approver": await get_next_approver(request, db) if request.status == AssignmentStatus.PENDING else None
    }

# Capacity Planning Endpoints

@router.get("/capacity/check", response_model=CapacityCheckResponse)
async def check_capacity(
    trade_crew_id: int,
    start_date: datetime,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Check capacity availability for a trade crew."""
    
    return await check_capacity_availability(trade_crew_id, start_date, end_date, db)

@router.get("/capacity/forecast")
async def get_capacity_forecast(
    trade_crew_id: Optional[int] = Query(None),
    days_ahead: int = Query(30, le=90),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get capacity forecast for planning purposes."""
    
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=days_ahead)
    
    query = db.query(CapacityAllocation).filter(
        CapacityAllocation.start_date >= start_date,
        CapacityAllocation.end_date <= end_date
    )
    
    if trade_crew_id:
        query = query.filter(CapacityAllocation.trade_crew_id == trade_crew_id)
    
    allocations = query.all()
    
    # Calculate daily capacity utilization
    forecast = {}
    current_date = start_date.date()
    
    while current_date <= end_date.date():
        daily_allocations = [
            a for a in allocations 
            if a.start_date.date() <= current_date <= a.end_date.date()
        ]
        
        total_utilization = sum(a.allocation_percentage for a in daily_allocations)
        
        forecast[current_date.isoformat()] = {
            "date": current_date,
            "utilization_percentage": min(total_utilization, 100),
            "available_capacity": max(0, 100 - total_utilization),
            "assignments_count": len(daily_allocations),
            "is_overbooked": total_utilization > 100
        }
        
        current_date += timedelta(days=1)
    
    return {
        "forecast_period": {
            "start_date": start_date,
            "end_date": end_date,
            "days": days_ahead
        },
        "daily_forecast": forecast,
        "summary": {
            "average_utilization": sum(d["utilization_percentage"] for d in forecast.values()) / len(forecast),
            "peak_utilization": max(d["utilization_percentage"] for d in forecast.values()),
            "overbooked_days": len([d for d in forecast.values() if d["is_overbooked"]])
        }
    }

# Helper Functions

async def check_capacity_availability(
    trade_crew_id: int, 
    start_date: datetime, 
    end_date: Optional[datetime], 
    db: Session
) -> CapacityCheckResponse:
    """Check if capacity is available for the specified time period."""
    
    if not end_date:
        end_date = start_date + timedelta(hours=8)  # Default 8-hour assignment
    
    # Get existing allocations for the time period
    existing_allocations = db.query(CapacityAllocation).filter(
        CapacityAllocation.trade_crew_id == trade_crew_id,
        CapacityAllocation.start_date < end_date,
        CapacityAllocation.end_date > start_date,
        CapacityAllocation.is_confirmed == True
    ).all()
    
    # Calculate current utilization
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

async def get_next_approver(assignment_request: AssignmentRequest, db: Session) -> Optional[int]:
    """Get the next approver for an assignment request based on workflow rules."""
    
    # This would integrate with the role management system
    # For now, return a placeholder supervisor ID
    return 1  # TODO: Implement proper approver lookup

async def update_workflow_state(
    assignment_request: AssignmentRequest, 
    approval: AssignmentApproval, 
    db: Session
):
    """Update the workflow state based on approval decision."""
    
    workflow_config = WORKFLOW_STATES[assignment_request.assignment_type.value.upper()]
    current_states = db.query(WorkflowState).filter(
        WorkflowState.assignment_request_id == assignment_request.id
    ).order_by(WorkflowState.created_at.desc()).all()
    
    current_state = current_states[0].current_state if current_states else workflow_config["initial"]
    
    if approval.status == ApprovalStatus.APPROVED:
        # Move to next state in workflow
        possible_states = workflow_config["states"][current_state]
        next_state = possible_states[0] if possible_states else current_state
        
        if next_state == "approved":
            assignment_request.status = AssignmentStatus.APPROVED
        elif next_state.startswith("pending_"):
            # Create next approval record
            next_approval = AssignmentApproval(
                assignment_request_id=assignment_request.id,
                approver_id=await get_next_approver(assignment_request, db),
                approval_level=approval.approval_level + 1,
                status=ApprovalStatus.PENDING
            )
            db.add(next_approval)
    
    elif approval.status == ApprovalStatus.REJECTED:
        assignment_request.status = AssignmentStatus.REJECTED
        next_state = "rejected"
    
    # Create workflow state record
    new_state = WorkflowState(
        assignment_request_id=assignment_request.id,
        current_state=next_state,
        state_data={"approval_id": approval.id, "approver_id": approval.approver_id},
        created_by=approval.approver_id
    )
    
    db.add(new_state)

async def has_admin_role(user) -> bool:
    """Check if user has admin role."""
    # TODO: Integrate with role management system
    return True  # Placeholder

async def can_access_request(request: AssignmentRequest, user, db: Session) -> bool:
    """Check if user can access the assignment request."""
    # TODO: Implement proper access control
    return True  # Placeholder

async def get_approvable_requests(user, db: Session) -> List[int]:
    """Get list of request IDs that the user can approve."""
    # TODO: Implement based on user roles and approval hierarchy
    return []  # Placeholder
