"""
Pydantic schemas for Trade Team and Crew operations
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


# Base schemas
class TradeTeamBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = True


class TradeCrewBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    specialization: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1)
    is_active: bool = True


class CrewMemberBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    email_personal: Optional[EmailStr] = None
    email_jw: Optional[EmailStr] = None
    role: str = Field(..., min_length=1, max_length=100)
    is_overseer: bool = False
    is_assistant: bool = False
    congregation: Optional[str] = Field(None, max_length=100)
    serving_as: Optional[List[str]] = Field(None, description="List of roles: Elder, Ministerial Servant, Regular Pioneer, Publisher")
    ba_id: Optional[str] = Field(None, max_length=20, description="Builder Assistant ID Number")
    is_active: bool = True
    availability_notes: Optional[str] = None


# Create schemas
class TradeTeamCreate(TradeTeamBase):
    pass


class TradeCrewCreate(TradeCrewBase):
    trade_team_id: int


class CrewMemberCreate(CrewMemberBase):
    trade_crew_id: Optional[int] = None


# Update schemas
class TradeTeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TradeCrewUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    specialization: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None


class CrewMemberUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    email_personal: Optional[EmailStr] = None
    email_jw: Optional[EmailStr] = None
    role: Optional[str] = Field(None, min_length=1, max_length=100)
    is_overseer: Optional[bool] = None
    is_assistant: Optional[bool] = None
    congregation: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    availability_notes: Optional[str] = None


# Response schemas
class CrewMember(CrewMemberBase):
    id: int
    trade_crew_id: Optional[int] = None
    full_name: str
    trade_crew_name: Optional[str] = None
    trade_team_name: Optional[str] = None
    ba_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TradeCrew(TradeCrewBase):
    id: int
    trade_team_id: int
    crew_members: List[CrewMember] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TradeTeam(TradeTeamBase):
    id: int
    trade_crews: List[TradeCrew] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Summary schemas for exports and lists
class CrewMemberSummary(BaseModel):
    id: int
    full_name: str
    role: str
    phone: Optional[str]
    email_jw: Optional[str]
    congregation: Optional[str]
    is_overseer: bool
    is_assistant: bool
    is_active: bool

    class Config:
        from_attributes = True


class TradeCrewSummary(BaseModel):
    id: int
    name: str
    specialization: Optional[str]
    capacity: Optional[int]
    member_count: int
    overseer_name: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class TradeTeamSummary(BaseModel):
    id: int
    name: str
    crew_count: int
    total_members: int
    active_crews: int
    is_active: bool

    class Config:
        from_attributes = True
