from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class RoleLevel(str, Enum):
    TRADE_TEAM_OVERSEER = "trade_team_overseer"
    TRADE_TEAM_ASSISTANT_OVERSEER = "trade_team_assistant_overseer"
    TRADE_TEAM_SUPPORT = "trade_team_support"
    TRADE_CREW_OVERSEER = "trade_crew_overseer"
    TRADE_CREW_ASSISTANT_OVERSEER = "trade_crew_assistant_overseer"
    TRADE_CREW_SUPPORT = "trade_crew_support"
    TRADE_CREW_VOLUNTEER = "trade_crew_volunteer"

class AssignmentCategory(str, Enum):
    BRANCH_APPOINTED = "branch_appointed"
    FIELD_ASSIGNED_CONTINUOUS = "field_assigned_continuous"
    FIELD_ASSIGNED_TEMPORARY = "field_assigned_temporary"

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
