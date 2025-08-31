from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class RoleLevel(str, Enum):
    overseer = "overseer"
    assistant_overseer = "assistant_overseer"
    group_overseer = "group_overseer"
    assistant_group_overseer = "assistant_group_overseer"
    servant = "servant"
    ministerial_servant = "ministerial_servant"
    brother = "brother"

class AssignmentCategory(str, Enum):
    trade_team_leadership = "trade_team_leadership"
    trade_crew_leadership = "trade_crew_leadership"

class RoleStatus(str, Enum):
    no_adjustment_needed = "no_adjustment_needed"
    adjustment_needed = "adjustment_needed"
    pending_consultation = "pending_consultation"
    consultation_scheduled = "consultation_scheduled"
    change_approved = "change_approved"
    change_implemented = "change_implemented"

class RoleAssignmentBase(BaseModel):
    role_level: RoleLevel
    assignment_category: AssignmentCategory
    trade_team_id: Optional[int] = None
    trade_crew_id: Optional[int] = None
    assigned_member_id: Optional[int] = None
    is_vacant: bool = True
    status: RoleStatus = RoleStatus.no_adjustment_needed
    consultation_completed: bool = False
    impact_assessment: Optional[str] = None
    change_reason: Optional[str] = None
    effective_date: Optional[str] = None

class RoleAssignmentCreate(RoleAssignmentBase):
    pass

class RoleAssignmentUpdate(BaseModel):
    role_level: Optional[RoleLevel] = None
    assignment_category: Optional[AssignmentCategory] = None
    trade_team_id: Optional[int] = None
    trade_crew_id: Optional[int] = None
    assigned_member_id: Optional[int] = None
    is_vacant: Optional[bool] = None
    status: Optional[RoleStatus] = None
    consultation_completed: Optional[bool] = None
    impact_assessment: Optional[str] = None
    change_reason: Optional[str] = None
    effective_date: Optional[str] = None

class RoleAssignmentResponse(RoleAssignmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TradeTeamSummary(BaseModel):
    id: int
    name: str
    ba_group_prefix: Optional[str] = None

    class Config:
        from_attributes = True

class TradeCrewSummary(BaseModel):
    id: int
    name: str
    ba_group_name: Optional[str] = None
    trade_team_id: int

    class Config:
        from_attributes = True

class RoleAssignmentWithRelations(RoleAssignmentResponse):
    trade_team: Optional[TradeTeamSummary] = None
    trade_crew: Optional[TradeCrewSummary] = None

    class Config:
        from_attributes = True
