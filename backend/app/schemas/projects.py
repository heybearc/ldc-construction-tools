"""
Pydantic schemas for Project and Assignment operations
"""

from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field


# Base schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    project_number: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=200)
    project_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = Field(default="Planning", max_length=50)
    current_phase: Optional[str] = Field(None, max_length=100)
    jw_sharepoint_url: Optional[str] = Field(None, max_length=500)
    builder_assistant_url: Optional[str] = Field(None, max_length=500)
    is_active: bool = True


class ProjectAssignmentBase(BaseModel):
    role_description: Optional[str] = Field(None, max_length=200)
    phase: Optional[str] = Field(None, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = Field(default="Assigned", max_length=50)
    requirements: Optional[str] = None
    assignment_notes: Optional[str] = None
    is_active: bool = True


class ConstructionPhaseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    sequence_order: int = Field(..., ge=1)
    is_active: bool = True


# Create schemas
class ProjectCreate(ProjectBase):
    pass


class ProjectAssignmentCreate(ProjectAssignmentBase):
    project_id: int
    trade_crew_id: int


class ConstructionPhaseCreate(ConstructionPhaseBase):
    pass


# Update schemas
class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    project_number: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=200)
    project_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = Field(None, max_length=50)
    current_phase: Optional[str] = Field(None, max_length=100)
    jw_sharepoint_url: Optional[str] = Field(None, max_length=500)
    builder_assistant_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class ProjectAssignmentUpdate(BaseModel):
    role_description: Optional[str] = Field(None, max_length=200)
    phase: Optional[str] = Field(None, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = Field(None, max_length=50)
    requirements: Optional[str] = None
    assignment_notes: Optional[str] = None
    is_active: Optional[bool] = None


# Response schemas
class ConstructionPhase(ConstructionPhaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectAssignment(ProjectAssignmentBase):
    id: int
    project_id: int
    trade_crew_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectBase):
    id: int
    assignments: List[ProjectAssignment] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Summary schemas for exports and lists
class ProjectAssignmentSummary(BaseModel):
    id: int
    trade_crew_name: str
    trade_team_name: str
    role_description: Optional[str]
    phase: Optional[str]
    status: str
    start_date: Optional[date]
    end_date: Optional[date]
    overseer_name: Optional[str]
    overseer_phone: Optional[str]
    overseer_email: Optional[str]

    class Config:
        from_attributes = True


class ProjectSummary(BaseModel):
    id: int
    name: str
    project_number: Optional[str]
    location: Optional[str]
    project_type: Optional[str]
    status: str
    current_phase: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    assignment_count: int
    active_assignments: int
    jw_sharepoint_url: Optional[str]
    builder_assistant_url: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# Export schemas
class ProjectExportData(BaseModel):
    """Schema for exporting project data to Excel"""
    project_info: ProjectSummary
    assignments: List[ProjectAssignmentSummary]
    construction_phases: List[ConstructionPhase]
