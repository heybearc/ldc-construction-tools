"""
Trade Team and Crew models for LDC Construction Tools
"""

from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from .base import Base, TimestampMixin, AuditMixin


class AssignmentCategory(enum.Enum):
    """Assignment categories per USLDC-2829-E"""
    BRANCH_APPOINTED = "branch_appointed"
    FIELD_ASSIGNED_CONTINUOUS = "field_assigned_continuous"
    FIELD_ASSIGNED_TEMPORARY = "field_assigned_temporary"


class RoleLevel(enum.Enum):
    """Role hierarchy levels"""
    TRADE_TEAM_OVERSEER = "trade_team_overseer"
    TRADE_TEAM_ASSISTANT_OVERSEER = "trade_team_assistant_overseer"
    TRADE_TEAM_SUPPORT = "trade_team_support"
    TRADE_CREW_OVERSEER = "trade_crew_overseer"
    TRADE_CREW_ASSISTANT_OVERSEER = "trade_crew_assistant_overseer"
    TRADE_CREW_SUPPORT = "trade_crew_support"
    TRADE_CREW_VOLUNTEER = "trade_crew_volunteer"


class TradeTeam(Base, TimestampMixin, AuditMixin):
    """Trade Team model - represents major trade categories"""
    
    __tablename__ = "trade_teams"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Builder Assistant integration
    ba_group_prefix: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g., "ELECTRICAL"
    
    # Relationships
    trade_crews: Mapped[List["TradeCrew"]] = relationship(
        "TradeCrew", back_populates="trade_team", cascade="all, delete-orphan"
    )
    role_assignments: Mapped[List["RoleAssignment"]] = relationship(
        "RoleAssignment", back_populates="trade_team", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<TradeTeam(id={self.id}, name='{self.name}')>"


class TradeCrew(Base, TimestampMixin, AuditMixin):
    """Trade Crew model - represents specific crews within trade teams"""
    
    __tablename__ = "trade_crews"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    trade_team_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trade_teams.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Crew details
    specialization: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Builder Assistant integration
    ba_group_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g., "ELECTRICAL – AUDIO & VIDEO"
    
    # Relationships
    trade_team: Mapped["TradeTeam"] = relationship("TradeTeam", back_populates="trade_crews")
    crew_members: Mapped[List["CrewMember"]] = relationship(
        "CrewMember", back_populates="trade_crew", cascade="all, delete-orphan"
    )
    role_assignments: Mapped[List["RoleAssignment"]] = relationship(
        "RoleAssignment", back_populates="trade_crew", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<TradeCrew(id={self.id}, name='{self.name}', team='{self.trade_team.name if self.trade_team else 'N/A'}')>"


class CrewMember(Base, TimestampMixin, AuditMixin):
    """Crew Member model - represents individuals in trade crews"""
    
    __tablename__ = "crew_members"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trade_crew_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("trade_crews.id"), nullable=True
    )
    
    # Personal information
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    ba_id: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # Builder Assistant Volunteer ID Number
    
    # Contact information
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email_personal: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email_jw: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Role information
    role: Mapped[str] = mapped_column(String(100), nullable=False)  # Trade Crew Overseer, Assistant, etc.
    is_overseer: Mapped[bool] = mapped_column(Boolean, default=False)
    is_assistant: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Congregation information
    congregation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Serving as (stored as JSON string for multiple selections)
    serving_as: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array of roles
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    availability_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    trade_crew: Mapped["TradeCrew"] = relationship("TradeCrew", back_populates="crew_members")
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self) -> str:
        return f"<CrewMember(id={self.id}, name='{self.full_name}', role='{self.role}')>"


class RoleAssignment(Base, TimestampMixin, AuditMixin):
    """Role Assignment model - tracks all organizational positions"""
    
    __tablename__ = "role_assignments"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    # Role definition
    role_level: Mapped[RoleLevel] = mapped_column(Enum(RoleLevel), nullable=False)
    assignment_category: Mapped[AssignmentCategory] = mapped_column(Enum(AssignmentCategory), nullable=False)
    
    # Assignment location
    trade_team_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("trade_teams.id"), nullable=True
    )
    trade_crew_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("trade_crews.id"), nullable=True
    )
    
    # Assignment details
    assigned_member_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crew_members.id"), nullable=True
    )
    is_vacant: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Status tracking per USLDC-2829-E
    status: Mapped[str] = mapped_column(String(50), default="no_adjustment_needed")  # remove_role, adjustment_needed, no_adjustment_needed
    consultation_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    impact_assessment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Change tracking
    change_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    effective_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # ISO date string
    
    # Relationships
    trade_team: Mapped[Optional["TradeTeam"]] = relationship("TradeTeam", back_populates="role_assignments")
    trade_crew: Mapped[Optional["TradeCrew"]] = relationship("TradeCrew", back_populates="role_assignments")
    assigned_member: Mapped[Optional["CrewMember"]] = relationship("CrewMember")
    change_history: Mapped[List["RoleChangeHistory"]] = relationship(
        "RoleChangeHistory", back_populates="role_assignment", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        location = f"Team:{self.trade_team.name}" if self.trade_team else f"Crew:{self.trade_crew.name}" if self.trade_crew else "Unknown"
        return f"<RoleAssignment(id={self.id}, role='{self.role_level.value}', location='{location}')>"


class RoleChangeHistory(Base, TimestampMixin):
    """Role Change History model - audit trail for all role changes"""
    
    __tablename__ = "role_change_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role_assignment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("role_assignments.id"), nullable=False
    )
    
    # Change details
    change_type: Mapped[str] = mapped_column(String(50), nullable=False)  # assignment, removal, status_change
    previous_member_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    new_member_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    previous_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    new_status: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Documentation
    change_reason: Mapped[str] = mapped_column(Text, nullable=False)
    changed_by: Mapped[str] = mapped_column(String(100), nullable=False)  # Personnel Contact name
    consultation_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    role_assignment: Mapped["RoleAssignment"] = relationship("RoleAssignment", back_populates="change_history")
    
    def __repr__(self) -> str:
        return f"<RoleChangeHistory(id={self.id}, type='{self.change_type}', date='{self.created_at}')>"
