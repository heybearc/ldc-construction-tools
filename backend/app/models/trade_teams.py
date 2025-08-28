"""
Trade Team and Crew models for LDC Construction Tools
"""

from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, AuditMixin


class TradeTeam(Base, TimestampMixin, AuditMixin):
    """Trade Team model - represents major trade categories"""
    
    __tablename__ = "trade_teams"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    trade_crews: Mapped[List["TradeCrew"]] = relationship(
        "TradeCrew", back_populates="trade_team", cascade="all, delete-orphan"
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
    
    # Relationships
    trade_team: Mapped["TradeTeam"] = relationship("TradeTeam", back_populates="trade_crews")
    crew_members: Mapped[List["CrewMember"]] = relationship(
        "CrewMember", back_populates="trade_crew", cascade="all, delete-orphan"
    )
    project_assignments: Mapped[List["ProjectAssignment"]] = relationship(
        "ProjectAssignment", back_populates="trade_crew"
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
