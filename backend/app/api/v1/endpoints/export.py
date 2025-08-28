"""
Export API endpoints for LDC Construction Tools
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from app.models.trade_teams import TradeTeam as TradeTeamModel, TradeCrew as TradeCrewModel, CrewMember as CrewMemberModel
from app.models.projects import Project as ProjectModel
from app.schemas.trade_teams import TradeTeamSummary, TradeCrewSummary, CrewMemberSummary
from app.schemas.projects import ProjectExportData
from app.services.export_service import ExportService
from app.core.database import get_db

router = APIRouter()


@router.get("/trade-teams")
async def export_trade_teams(db: Session = Depends(get_db)):
    """Export all trade teams data to Excel"""
    
    # Get all active trade teams
    teams = db.query(TradeTeamModel).filter(TradeTeamModel.is_active == True).all()
    team_summaries = []
    crew_summaries = []
    member_summaries = []
    
    for team in teams:
        active_crews = [crew for crew in team.trade_crews if crew.is_active]
        total_members = sum(len([member for member in crew.crew_members if member.is_active]) for crew in active_crews)
        
        team_summaries.append(TradeTeamSummary(
            id=team.id,
            name=team.name,
            crew_count=len(team.trade_crews),
            total_members=total_members,
            active_crews=len(active_crews),
            is_active=team.is_active
        ))
        
        # Add crew summaries for this team
        for crew in active_crews:
            active_members = [member for member in crew.crew_members if member.is_active]
            overseer = next((member for member in active_members if member.is_overseer), None)
            
            crew_summaries.append(TradeCrewSummary(
                id=crew.id,
                name=crew.name,
                specialization=crew.specialization,
                capacity=crew.capacity,
                member_count=len(active_members),
                overseer_name=overseer.full_name if overseer else None,
                is_active=crew.is_active
            ))
            
            # Add member summaries for this crew
            for member in active_members:
                member_summaries.append(CrewMemberSummary(
                    id=member.id,
                    full_name=member.full_name,
                    role=member.role,
                    phone=member.phone,
                    email_jw=member.email_jw,
                    congregation=member.congregation,
                    is_overseer=member.is_overseer,
                    is_assistant=member.is_assistant,
                    is_active=member.is_active
                ))
    
    # Generate Excel file
    excel_file = ExportService.export_trade_teams_to_excel(team_summaries, crew_summaries, member_summaries)
    filename = ExportService.get_export_filename("trade_teams")
    
    return StreamingResponse(
        BytesIO(excel_file.getvalue()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/projects/{project_id}")
async def export_project(project_id: int, db: Session = Depends(get_db)):
    """Export specific project data to Excel"""
    
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get project export data (reuse logic from projects endpoint)
    from app.api.v1.endpoints.projects import get_project_export_data
    project_data = await get_project_export_data(project_id, db)
    
    # Generate Excel file
    excel_file = ExportService.export_project_to_excel(project_data)
    filename = ExportService.get_export_filename("project", project.name)
    
    return StreamingResponse(
        BytesIO(excel_file.getvalue()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/contacts")
async def export_contact_list(db: Session = Depends(get_db)):
    """Export contact list for Construction Group reference"""
    
    # Get all active crew members
    members = db.query(CrewMemberModel).filter(CrewMemberModel.is_active == True).all()
    
    member_summaries = []
    for member in members:
        member_summaries.append(CrewMemberSummary(
            id=member.id,
            full_name=member.full_name,
            role=member.role,
            phone=member.phone,
            email_jw=member.email_jw,
            congregation=member.congregation,
            is_overseer=member.is_overseer,
            is_assistant=member.is_assistant,
            is_active=member.is_active
        ))
    
    # Generate Excel file
    excel_file = ExportService.export_contact_list_to_excel(member_summaries)
    filename = ExportService.get_export_filename("contacts")
    
    return StreamingResponse(
        BytesIO(excel_file.getvalue()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
