"""
Projects API endpoints for LDC Construction Tools
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.projects import (
    Project, ProjectCreate, ProjectUpdate, ProjectSummary,
    ProjectAssignment, ProjectAssignmentCreate, ProjectAssignmentUpdate, ProjectAssignmentSummary,
    ConstructionPhase, ConstructionPhaseCreate, ProjectExportData
)
from app.models.projects import Project as ProjectModel, ProjectAssignment as ProjectAssignmentModel, ConstructionPhase as ConstructionPhaseModel
from app.models.trade_teams import TradeCrew as TradeCrewModel, CrewMember as CrewMemberModel
from app.core.database import get_db

router = APIRouter()


# Projects endpoints
@router.get("/", response_model=List[ProjectSummary])
async def get_projects(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """Get all projects with summary information"""
    query = db.query(ProjectModel)
    
    if not include_inactive:
        query = query.filter(ProjectModel.is_active == True)
    
    if status_filter:
        query = query.filter(ProjectModel.status == status_filter)
    
    projects = query.offset(skip).limit(limit).all()
    
    # Convert to summary format
    project_summaries = []
    for project in projects:
        active_assignments = [assignment for assignment in project.assignments if assignment.is_active]
        
        project_summaries.append(ProjectSummary(
            id=project.id,
            name=project.name,
            project_number=project.project_number,
            location=project.location,
            project_type=project.project_type,
            status=project.status,
            current_phase=project.current_phase,
            start_date=project.start_date,
            end_date=project.end_date,
            assignment_count=len(project.assignments),
            active_assignments=len(active_assignments),
            jw_sharepoint_url=project.jw_sharepoint_url,
            builder_assistant_url=project.builder_assistant_url,
            is_active=project.is_active
        ))
    
    return project_summaries


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project with all details"""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    db_project = ProjectModel(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """Update a project"""
    db_project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project"""
    db_project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(db_project)
    db.commit()


# Project Assignments endpoints
@router.get("/{project_id}/assignments", response_model=List[ProjectAssignmentSummary])
async def get_project_assignments(
    project_id: int,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """Get all assignments for a specific project"""
    query = db.query(ProjectAssignmentModel).filter(ProjectAssignmentModel.project_id == project_id)
    if not include_inactive:
        query = query.filter(ProjectAssignmentModel.is_active == True)
    
    assignments = query.all()
    
    # Convert to summary format with crew and overseer details
    assignment_summaries = []
    for assignment in assignments:
        crew = assignment.trade_crew
        team = crew.trade_team if crew else None
        overseer = next((member for member in crew.crew_members if member.is_overseer and member.is_active), None) if crew else None
        
        assignment_summaries.append(ProjectAssignmentSummary(
            id=assignment.id,
            trade_crew_name=crew.name if crew else "Unknown",
            trade_team_name=team.name if team else "Unknown",
            role_description=assignment.role_description,
            phase=assignment.phase,
            status=assignment.status,
            start_date=assignment.start_date,
            end_date=assignment.end_date,
            overseer_name=overseer.full_name if overseer else None,
            overseer_phone=overseer.phone if overseer else None,
            overseer_email=overseer.email_jw if overseer else None
        ))
    
    return assignment_summaries


@router.post("/{project_id}/assignments", response_model=ProjectAssignment, status_code=status.HTTP_201_CREATED)
async def create_project_assignment(
    project_id: int,
    assignment: ProjectAssignmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new project assignment"""
    # Verify project exists
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify trade crew exists
    crew = db.query(TradeCrewModel).filter(TradeCrewModel.id == assignment.trade_crew_id).first()
    if not crew:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade crew not found"
        )
    
    assignment_data = assignment.dict()
    assignment_data["project_id"] = project_id
    db_assignment = ProjectAssignmentModel(**assignment_data)
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.put("/assignments/{assignment_id}", response_model=ProjectAssignment)
async def update_project_assignment(
    assignment_id: int,
    assignment_update: ProjectAssignmentUpdate,
    db: Session = Depends(get_db)
):
    """Update a project assignment"""
    db_assignment = db.query(ProjectAssignmentModel).filter(ProjectAssignmentModel.id == assignment_id).first()
    if not db_assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project assignment not found"
        )
    
    update_data = assignment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_assignment, field, value)
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_assignment(assignment_id: int, db: Session = Depends(get_db)):
    """Delete a project assignment"""
    db_assignment = db.query(ProjectAssignmentModel).filter(ProjectAssignmentModel.id == assignment_id).first()
    if not db_assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project assignment not found"
        )
    
    db.delete(db_assignment)
    db.commit()


# Construction Phases endpoints
@router.get("/phases", response_model=List[ConstructionPhase])
async def get_construction_phases(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """Get all construction phases"""
    query = db.query(ConstructionPhaseModel)
    if not include_inactive:
        query = query.filter(ConstructionPhaseModel.is_active == True)
    
    phases = query.order_by(ConstructionPhaseModel.sequence_order).all()
    return phases


@router.post("/phases", response_model=ConstructionPhase, status_code=status.HTTP_201_CREATED)
async def create_construction_phase(phase: ConstructionPhaseCreate, db: Session = Depends(get_db)):
    """Create a new construction phase"""
    db_phase = ConstructionPhaseModel(**phase.dict())
    db.add(db_phase)
    db.commit()
    db.refresh(db_phase)
    return db_phase


# Export endpoints
@router.get("/{project_id}/export", response_model=ProjectExportData)
async def get_project_export_data(project_id: int, db: Session = Depends(get_db)):
    """Get project data formatted for Excel export"""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get project summary
    active_assignments = [assignment for assignment in project.assignments if assignment.is_active]
    project_summary = ProjectSummary(
        id=project.id,
        name=project.name,
        project_number=project.project_number,
        location=project.location,
        project_type=project.project_type,
        status=project.status,
        current_phase=project.current_phase,
        start_date=project.start_date,
        end_date=project.end_date,
        assignment_count=len(project.assignments),
        active_assignments=len(active_assignments),
        jw_sharepoint_url=project.jw_sharepoint_url,
        builder_assistant_url=project.builder_assistant_url,
        is_active=project.is_active
    )
    
    # Get assignment summaries
    assignment_summaries = []
    for assignment in active_assignments:
        crew = assignment.trade_crew
        team = crew.trade_team if crew else None
        overseer = next((member for member in crew.crew_members if member.is_overseer and member.is_active), None) if crew else None
        
        assignment_summaries.append(ProjectAssignmentSummary(
            id=assignment.id,
            trade_crew_name=crew.name if crew else "Unknown",
            trade_team_name=team.name if team else "Unknown",
            role_description=assignment.role_description,
            phase=assignment.phase,
            status=assignment.status,
            start_date=assignment.start_date,
            end_date=assignment.end_date,
            overseer_name=overseer.full_name if overseer else None,
            overseer_phone=overseer.phone if overseer else None,
            overseer_email=overseer.email_jw if overseer else None
        ))
    
    # Get construction phases
    phases = db.query(ConstructionPhaseModel).filter(ConstructionPhaseModel.is_active == True).order_by(ConstructionPhaseModel.sequence_order).all()
    
    return ProjectExportData(
        project_info=project_summary,
        assignments=assignment_summaries,
        construction_phases=phases
    )
