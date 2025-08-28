"""
Trade Teams API endpoints for LDC Construction Tools
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.trade_teams import (
    TradeTeam, TradeTeamCreate, TradeTeamUpdate, TradeTeamSummary,
    TradeCrew, TradeCrewCreate, TradeCrewUpdate, TradeCrewSummary,
    CrewMember, CrewMemberCreate, CrewMemberUpdate, CrewMemberSummary
)
from app.models.trade_teams import TradeTeam as TradeTeamModel, TradeCrew as TradeCrewModel, CrewMember as CrewMemberModel
from app.core.database import get_db

router = APIRouter()


# Trade Teams endpoints
@router.get("/", response_model=List[TradeTeamSummary])
async def get_trade_teams(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """Get all trade teams with summary information"""
    query = db.query(TradeTeamModel)
    if not include_inactive:
        query = query.filter(TradeTeamModel.is_active == True)
    
    teams = query.offset(skip).limit(limit).all()
    
    # Convert to summary format
    team_summaries = []
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
    
    return team_summaries


@router.get("/{team_id}", response_model=TradeTeam)
async def get_trade_team(team_id: int, db: Session = Depends(get_db)):
    """Get a specific trade team with all details"""
    team = db.query(TradeTeamModel).filter(TradeTeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade team not found"
        )
    return team


@router.post("/", response_model=TradeTeam, status_code=status.HTTP_201_CREATED)
async def create_trade_team(team: TradeTeamCreate, db: Session = Depends(get_db)):
    """Create a new trade team"""
    db_team = TradeTeamModel(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


@router.put("/{team_id}", response_model=TradeTeam)
async def update_trade_team(
    team_id: int,
    team_update: TradeTeamUpdate,
    db: Session = Depends(get_db)
):
    """Update a trade team"""
    db_team = db.query(TradeTeamModel).filter(TradeTeamModel.id == team_id).first()
    if not db_team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade team not found"
        )
    
    update_data = team_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_team, field, value)
    
    db.commit()
    db.refresh(db_team)
    return db_team


# Trade Crews endpoints
@router.get("/{team_id}/crews", response_model=List[TradeCrewSummary])
async def get_trade_crews(
    team_id: int,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """Get all crews for a specific trade team"""
    query = db.query(TradeCrewModel).filter(TradeCrewModel.trade_team_id == team_id)
    if not include_inactive:
        query = query.filter(TradeCrewModel.is_active == True)
    
    crews = query.all()
    
    # Convert to summary format
    crew_summaries = []
    for crew in crews:
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
    
    return crew_summaries


@router.post("/{team_id}/crews", response_model=TradeCrew, status_code=status.HTTP_201_CREATED)
async def create_trade_crew(
    team_id: int,
    crew: TradeCrewCreate,
    db: Session = Depends(get_db)
):
    """Create a new trade crew"""
    # Verify trade team exists
    team = db.query(TradeTeamModel).filter(TradeTeamModel.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade team not found"
        )
    
    crew_data = crew.dict()
    crew_data["trade_team_id"] = team_id
    db_crew = TradeCrewModel(**crew_data)
    db.add(db_crew)
    db.commit()
    db.refresh(db_crew)
    return db_crew


@router.get("/crews/{crew_id}", response_model=TradeCrew)
async def get_trade_crew(crew_id: int, db: Session = Depends(get_db)):
    """Get a specific trade crew with all details"""
    crew = db.query(TradeCrewModel).filter(TradeCrewModel.id == crew_id).first()
    if not crew:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade crew not found"
        )
    return crew


@router.put("/crews/{crew_id}", response_model=TradeCrew)
async def update_trade_crew(
    crew_id: int,
    crew_update: TradeCrewUpdate,
    db: Session = Depends(get_db)
):
    """Update a trade crew"""
    db_crew = db.query(TradeCrewModel).filter(TradeCrewModel.id == crew_id).first()
    if not db_crew:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade crew not found"
        )
    
    update_data = crew_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_crew, field, value)
    
    db.commit()
    db.refresh(db_crew)
    return db_crew


# Crew Members endpoints
@router.get("/crews/{crew_id}/members", response_model=List[CrewMemberSummary])
async def get_crew_members(
    crew_id: int,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """Get all members for a specific trade crew"""
    query = db.query(CrewMemberModel).filter(CrewMemberModel.trade_crew_id == crew_id)
    if not include_inactive:
        query = query.filter(CrewMemberModel.is_active == True)
    
    members = query.all()
    return [CrewMemberSummary(
        id=member.id,
        full_name=member.full_name,
        role=member.role,
        phone=member.phone,
        email_jw=member.email_jw,
        congregation=member.congregation,
        is_overseer=member.is_overseer,
        is_assistant=member.is_assistant,
        is_active=member.is_active
    ) for member in members]


@router.post("/crews/{crew_id}/members", response_model=CrewMember, status_code=status.HTTP_201_CREATED)
async def create_crew_member(
    crew_id: int,
    member: CrewMemberCreate,
    db: Session = Depends(get_db)
):
    """Create a new crew member"""
    # Verify trade crew exists
    crew = db.query(TradeCrewModel).filter(TradeCrewModel.id == crew_id).first()
    if not crew:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade crew not found"
        )
    
    member_data = member.dict()
    member_data["trade_crew_id"] = crew_id
    db_member = CrewMemberModel(**member_data)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.get("/members/{member_id}", response_model=CrewMember)
async def get_crew_member(member_id: int, db: Session = Depends(get_db)):
    """Get a specific crew member"""
    member = db.query(CrewMemberModel).filter(CrewMemberModel.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crew member not found"
        )
    return member


@router.put("/members/{member_id}", response_model=CrewMember)
async def update_crew_member(
    member_id: int,
    member_update: CrewMemberUpdate,
    db: Session = Depends(get_db)
):
    """Update a crew member"""
    db_member = db.query(CrewMemberModel).filter(CrewMemberModel.id == member_id).first()
    if not db_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crew member not found"
        )
    
    update_data = member_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member
