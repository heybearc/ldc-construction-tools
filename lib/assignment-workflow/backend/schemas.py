"""
Assignment Workflow Pydantic Schemas
Data validation and serialization for USLDC-2829-E compliance
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class AssignmentTypeEnum(str, Enum):
    EMERGENCY = "emergency"
    STANDARD = "standard"
    SCHEDULED = "scheduled"

class AssignmentStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class ApprovalStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Assignment Request Schemas

class AssignmentRequestBase(BaseModel):
    assignment_type: AssignmentTypeEnum
    priority_level: int = Field(ge=1, le=5, description="Priority level from 1 (highest) to 5 (lowest)")
    requested_role: str = Field(min_length=1, max_length=100)
    project_id: Optional[int] = None
    trade_team_id: Optional[int] = None
    trade_crew_id: Optional[int] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    description: str = Field(min_length=10, max_length=2000)
    requirements: Optional[Dict[str, Any]] = None

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

    @validator('priority_level')
    def validate_priority_for_emergency(cls, v, values):
        if 'assignment_type' in values and values['assignment_type'] == AssignmentTypeEnum.EMERGENCY:
            if v > 2:
                raise ValueError('Emergency assignments must have priority level 1 or 2')
        return v

class AssignmentRequestCreate(AssignmentRequestBase):
    pass

class AssignmentRequestUpdate(BaseModel):
    assignment_type: Optional[AssignmentTypeEnum] = None
    priority_level: Optional[int] = Field(None, ge=1, le=5)
    requested_role: Optional[str] = Field(None, min_length=1, max_length=100)
    project_id: Optional[int] = None
    trade_team_id: Optional[int] = None
    trade_crew_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    requirements: Optional[Dict[str, Any]] = None

class AssignmentRequestResponse(AssignmentRequestBase):
    id: int
    requester_id: int
    status: AssignmentStatusEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Assignment Approval Schemas

class AssignmentApprovalBase(BaseModel):
    assignment_request_id: int
    status: ApprovalStatusEnum
    comments: Optional[str] = Field(None, max_length=1000)

class AssignmentApprovalCreate(AssignmentApprovalBase):
    pass

class AssignmentApprovalResponse(AssignmentApprovalBase):
    id: int
    approver_id: int
    approval_level: int
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Workflow State Schemas

class WorkflowStateResponse(BaseModel):
    id: int
    assignment_request_id: int
    current_state: str
    next_state: Optional[str] = None
    state_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True

class WorkflowStatusResponse(BaseModel):
    assignment_request: AssignmentRequestResponse
    current_state: str
    workflow_history: List[WorkflowStateResponse]
    approvals: List[AssignmentApprovalResponse]
    next_approver: Optional[int] = None

# Capacity Planning Schemas

class CapacityCheckRequest(BaseModel):
    trade_crew_id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    required_capacity: int = Field(ge=1, le=100, description="Required capacity percentage")

class CapacityCheckResponse(BaseModel):
    trade_crew_id: int
    start_date: datetime
    end_date: datetime
    available: bool
    available_capacity: int = Field(description="Available capacity percentage")
    current_utilization: int = Field(description="Current utilization percentage")
    conflicting_assignments: int = Field(description="Number of conflicting assignments")

class CapacityAllocationResponse(BaseModel):
    id: int
    assignment_request_id: int
    trade_crew_id: int
    allocated_capacity: int
    allocation_percentage: int
    start_date: datetime
    end_date: datetime
    is_confirmed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DailyCapacityForecast(BaseModel):
    date: datetime
    utilization_percentage: int
    available_capacity: int
    assignments_count: int
    is_overbooked: bool

class CapacityForecastSummary(BaseModel):
    average_utilization: float
    peak_utilization: int
    overbooked_days: int

class CapacityForecastResponse(BaseModel):
    forecast_period: Dict[str, Any]
    daily_forecast: Dict[str, DailyCapacityForecast]
    summary: CapacityForecastSummary

# Assignment History Schemas

class AssignmentHistoryResponse(BaseModel):
    id: int
    assignment_request_id: int
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    change_reason: Optional[str] = None
    changed_by: int
    changed_at: datetime

    class Config:
        from_attributes = True

# Bulk Operations Schemas

class BulkAssignmentRequest(BaseModel):
    requests: List[AssignmentRequestCreate] = Field(max_items=50)
    batch_notes: Optional[str] = None

class BulkAssignmentResponse(BaseModel):
    successful_requests: List[AssignmentRequestResponse]
    failed_requests: List[Dict[str, Any]]
    total_processed: int
    success_count: int
    failure_count: int

# Search and Filter Schemas

class AssignmentSearchFilters(BaseModel):
    status: Optional[List[AssignmentStatusEnum]] = None
    assignment_type: Optional[List[AssignmentTypeEnum]] = None
    priority_level: Optional[List[int]] = Field(None, description="Priority levels to filter by")
    requester_id: Optional[int] = None
    project_id: Optional[int] = None
    trade_team_id: Optional[int] = None
    trade_crew_id: Optional[int] = None
    start_date_from: Optional[datetime] = None
    start_date_to: Optional[datetime] = None
    created_from: Optional[datetime] = None
    created_to: Optional[datetime] = None

class AssignmentSearchRequest(BaseModel):
    filters: AssignmentSearchFilters
    sort_by: Optional[str] = Field("created_at", description="Field to sort by")
    sort_order: Optional[str] = Field("desc", regex="^(asc|desc)$")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

class AssignmentSearchResponse(BaseModel):
    requests: List[AssignmentRequestResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int

# Statistics and Analytics Schemas

class AssignmentStatistics(BaseModel):
    total_requests: int
    pending_requests: int
    approved_requests: int
    rejected_requests: int
    completed_requests: int
    average_approval_time_hours: float
    emergency_requests: int
    standard_requests: int
    scheduled_requests: int

class CrewUtilizationStats(BaseModel):
    trade_crew_id: int
    crew_name: str
    current_utilization: int
    average_utilization: float
    peak_utilization: int
    total_assignments: int
    completed_assignments: int

class ApprovalMetrics(BaseModel):
    approver_id: int
    approver_name: str
    pending_approvals: int
    total_approvals: int
    average_approval_time_hours: float
    approval_rate: float  # Percentage of approved vs rejected

class SystemMetricsResponse(BaseModel):
    assignment_statistics: AssignmentStatistics
    crew_utilization: List[CrewUtilizationStats]
    approval_metrics: List[ApprovalMetrics]
    generated_at: datetime

# Notification Schemas

class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    sms_notifications: bool = False
    in_app_notifications: bool = True
    notification_types: List[str] = Field(
        default=["assignment_created", "approval_required", "status_changed"],
        description="Types of notifications to receive"
    )

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    notification_type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    assignment_request_id: Optional[int] = None

    class Config:
        from_attributes = True
