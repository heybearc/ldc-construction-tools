"""
Project and Assignment models for LDC Construction Tools
"""

from typing import Optional, List
from datetime import date
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, AuditMixin


class Project(Base, TimestampMixin, AuditMixin):
    """Project model - represents construction projects"""
    
    __tablename__ = "projects"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    project_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, unique=True)
    
    # Project details
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    project_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Kingdom Hall, Assembly Hall, etc.
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timeline
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # Status
    status: Mapped[str] = mapped_column(String(50), default="Planning")  # Planning, Active, Completed, On Hold
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Construction phases
    current_phase: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # URLs for volunteer access
    jw_sharepoint_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    builder_assistant_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Relationships
    assignments: Mapped[List["ProjectAssignment"]] = relationship(
        "ProjectAssignment", back_populates="project", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', status='{self.status}')>"


class ProjectAssignment(Base, TimestampMixin, AuditMixin):
    """Project Assignment model - links trade crews to projects"""
    
    __tablename__ = "project_assignments"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id"), nullable=False
    )
    trade_crew_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trade_crews.id"), nullable=False
    )
    
    # Assignment details
    role_description: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    phase: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Site Work, Structural, etc.
    
    # Timeline
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # Status
    status: Mapped[str] = mapped_column(String(50), default="Assigned")  # Assigned, Active, Completed, Cancelled
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Assignment notes
    requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assignment_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="assignments")
    trade_crew: Mapped["TradeCrew"] = relationship("TradeCrew")
    
    def __repr__(self) -> str:
        return f"<ProjectAssignment(id={self.id}, project='{self.project.name if self.project else 'N/A'}', crew='{self.trade_crew.name if self.trade_crew else 'N/A'}')>"


class ConstructionPhase(Base, TimestampMixin):
    """Construction Phase model - defines standard construction phases"""
    
    __tablename__ = "construction_phases"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    def __repr__(self) -> str:
        return f"<ConstructionPhase(id={self.id}, name='{self.name}', order={self.sequence_order})>"
