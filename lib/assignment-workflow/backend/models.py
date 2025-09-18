"""
Assignment Workflow Models
USLDC-2829-E Compliant Assignment Processing System
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class AssignmentType(enum.Enum):
    EMERGENCY = "emergency"
    STANDARD = "standard"
    SCHEDULED = "scheduled"

class AssignmentStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class ApprovalStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class AssignmentRequest(Base):
    __tablename__ = "assignment_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)
    assignment_type = Column(Enum(AssignmentType), nullable=False)
    priority_level = Column(Integer, nullable=False, default=3)  # 1-5 scale
    requested_role = Column(String(100), nullable=False)
    
    # Project and team associations
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    trade_team_id = Column(Integer, ForeignKey("trade_teams.id"), nullable=True)
    trade_crew_id = Column(Integer, ForeignKey("trade_crews.id"), nullable=True)
    
    # Assignment details
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, nullable=True)  # Flexible requirements storage
    
    # Status and tracking
    status = Column(Enum(AssignmentStatus), nullable=False, default=AssignmentStatus.PENDING)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requester = relationship("AppUser", foreign_keys=[requester_id])
    project = relationship("Project", back_populates="assignment_requests")
    trade_team = relationship("TradeTeam", back_populates="assignment_requests")
    trade_crew = relationship("TradeCrew", back_populates="assignment_requests")
    approvals = relationship("AssignmentApproval", back_populates="assignment_request")
    workflow_states = relationship("WorkflowState", back_populates="assignment_request")

class AssignmentApproval(Base):
    __tablename__ = "assignment_approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_request_id = Column(Integer, ForeignKey("assignment_requests.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("app_users.id"), nullable=False)
    
    # Approval hierarchy
    approval_level = Column(Integer, nullable=False)  # 1=supervisor, 2=coordinator, 3=manager
    status = Column(Enum(ApprovalStatus), nullable=False, default=ApprovalStatus.PENDING)
    comments = Column(Text, nullable=True)
    
    # Timestamps
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    assignment_request = relationship("AssignmentRequest", back_populates="approvals")
    approver = relationship("AppUser", foreign_keys=[approver_id])

class WorkflowState(Base):
    __tablename__ = "workflow_states"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_request_id = Column(Integer, ForeignKey("assignment_requests.id"), nullable=False)
    
    # State management
    current_state = Column(String(50), nullable=False)
    next_state = Column(String(50), nullable=True)
    state_data = Column(JSON, nullable=True)  # Flexible state data storage
    
    # Audit trail
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("app_users.id"), nullable=True)
    
    # Relationships
    assignment_request = relationship("AssignmentRequest", back_populates="workflow_states")
    creator = relationship("AppUser", foreign_keys=[created_by])

class CapacityAllocation(Base):
    __tablename__ = "capacity_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_request_id = Column(Integer, ForeignKey("assignment_requests.id"), nullable=False)
    
    # Resource allocation
    trade_crew_id = Column(Integer, ForeignKey("trade_crews.id"), nullable=False)
    allocated_capacity = Column(Integer, nullable=False)  # Number of people allocated
    allocation_percentage = Column(Integer, nullable=False)  # Percentage of crew capacity
    
    # Time allocation
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Status
    is_confirmed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assignment_request = relationship("AssignmentRequest")
    trade_crew = relationship("TradeCrew")

class AssignmentHistory(Base):
    __tablename__ = "assignment_history"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_request_id = Column(Integer, ForeignKey("assignment_requests.id"), nullable=False)
    
    # Change tracking
    field_name = Column(String(50), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    change_reason = Column(Text, nullable=True)
    
    # Audit information
    changed_by = Column(Integer, ForeignKey("app_users.id"), nullable=False)
    changed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    assignment_request = relationship("AssignmentRequest")
    changed_by_user = relationship("AppUser", foreign_keys=[changed_by])

# Workflow State Machine Configuration
WORKFLOW_STATES = {
    "EMERGENCY": {
        "initial": "pending_supervisor_approval",
        "states": {
            "pending_supervisor_approval": ["approved", "rejected"],
            "approved": ["in_progress", "cancelled"],
            "rejected": ["cancelled"],
            "in_progress": ["completed", "cancelled"],
            "completed": [],
            "cancelled": []
        }
    },
    "STANDARD": {
        "initial": "pending_supervisor_approval",
        "states": {
            "pending_supervisor_approval": ["pending_coordinator_approval", "rejected"],
            "pending_coordinator_approval": ["approved", "rejected"],
            "approved": ["in_progress", "cancelled"],
            "rejected": ["cancelled"],
            "in_progress": ["completed", "cancelled"],
            "completed": [],
            "cancelled": []
        }
    },
    "SCHEDULED": {
        "initial": "pending_supervisor_approval",
        "states": {
            "pending_supervisor_approval": ["pending_coordinator_approval", "rejected"],
            "pending_coordinator_approval": ["pending_manager_approval", "rejected"],
            "pending_manager_approval": ["approved", "rejected"],
            "approved": ["scheduled", "cancelled"],
            "scheduled": ["in_progress", "cancelled"],
            "rejected": ["cancelled"],
            "in_progress": ["completed", "cancelled"],
            "completed": [],
            "cancelled": []
        }
    }
}

# Capacity Planning Constants
CAPACITY_LIMITS = {
    "crew_max_assignments": 5,  # Maximum concurrent assignments per crew
    "crew_max_utilization": 80,  # Maximum utilization percentage
    "advance_booking_days": 30,  # Days in advance for capacity planning
    "emergency_override": True   # Allow emergency assignments to exceed limits
}
