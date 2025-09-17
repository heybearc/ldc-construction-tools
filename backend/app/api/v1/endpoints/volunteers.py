"""
Volunteers API endpoints for LDC Construction Tools
"""

from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from app.core.database import get_db
from app.models.trade_teams import CrewMember as CrewMemberModel, TradeTeam as TradeTeamModel, TradeCrew as TradeCrewModel
from app.schemas.trade_teams import CrewMember, CrewMemberCreate
from pydantic import BaseModel

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None

class RoleResponse(BaseModel):
    name: str
    count: int
    description: Optional[str] = None

router = APIRouter()


@router.get("/available-roles")
async def get_all_roles(db: Session = Depends(get_db)):
    """Get all available volunteer roles with counts"""
    # Define all standard Construction Group roles
    standard_roles = [
        "Trade Team Overseer",
        "Trade Team Overseer Assistant", 
        "Trade Team Support",
        "Trade Crew Overseer",
        "Trade Crew Overseer Assistant",
        "Trade Crew Support",
        "Trade Crew Volunteer"
    ]
    
    # Get current role counts from database
    role_counts = dict(db.query(
        CrewMemberModel.role,
        func.count(CrewMemberModel.id).label('count')
    ).filter(
        CrewMemberModel.is_active == True
    ).group_by(CrewMemberModel.role).all())
    
    # Return all standard roles with their counts (0 if not in use)
    return [
        {"name": role, "count": role_counts.get(role, 0), "description": None}
        for role in standard_roles
    ]


@router.get("/stats/summary")
async def get_volunteer_stats(db: Session = Depends(get_db)):
    """Get volunteer statistics summary"""
    total_volunteers = db.query(CrewMemberModel).filter(CrewMemberModel.is_active == True).count()
    
    # Get role breakdown
    roles = db.query(
        CrewMemberModel.role,
        func.count(CrewMemberModel.id).label('count')
    ).filter(
        CrewMemberModel.is_active == True
    ).group_by(CrewMemberModel.role).all()
    
    role_breakdown = []
    for role, count in roles:
        role_breakdown.append({"name": role, "count": count})
    
    # Get congregation breakdown
    congregations = db.query(CrewMemberModel.congregation).filter(
        CrewMemberModel.is_active == True,
        CrewMemberModel.congregation.isnot(None)
    ).distinct().all()
    
    congregation_stats = []
    for (congregation,) in congregations:
        count = db.query(CrewMemberModel).filter(
            CrewMemberModel.is_active == True,
            CrewMemberModel.congregation == congregation
        ).count()
        congregation_stats.append({"name": congregation, "count": count})
    
    return {
        "total_volunteers": total_volunteers,
        "role_breakdown": role_breakdown,
        "congregation_breakdown": congregation_stats
    }


@router.get("/")
async def get_volunteers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    role: Optional[str] = None,
    congregation: Optional[str] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """Get all volunteers with optional filtering and search"""
    query = db.query(CrewMemberModel)
    
    if not include_inactive:
        query = query.filter(CrewMemberModel.is_active == True)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CrewMemberModel.first_name.ilike(search_term),
                CrewMemberModel.last_name.ilike(search_term),
                CrewMemberModel.role.ilike(search_term),
                CrewMemberModel.congregation.ilike(search_term)
            )
        )
    
    # Apply role filter
    if role:
        query = query.filter(CrewMemberModel.role == role)
    
    # Apply congregation filter
    if congregation:
        query = query.filter(CrewMemberModel.congregation == congregation)
    
    volunteers = query.offset(skip).limit(limit).all()
    
    # Add trade team and crew information and parse serving_as
    for volunteer in volunteers:
        if volunteer.trade_crew_id:
            crew = db.query(TradeCrewModel).filter(TradeCrewModel.id == volunteer.trade_crew_id).first()
            if crew:
                # Add attributes dynamically for response
                setattr(volunteer, 'trade_crew_name', crew.name)
                team = db.query(TradeTeamModel).filter(TradeTeamModel.id == crew.trade_team_id).first()
                if team:
                    setattr(volunteer, 'trade_team_name', team.name)
        
        # Parse serving_as JSON string to list
        if volunteer.serving_as:
            try:
                setattr(volunteer, 'serving_as', json.loads(volunteer.serving_as))
            except (json.JSONDecodeError, TypeError):
                setattr(volunteer, 'serving_as', [])
        else:
            setattr(volunteer, 'serving_as', [])
    
    return volunteers


@router.get("/{volunteer_id}", response_model=CrewMember)
async def get_volunteer(volunteer_id: int, db: Session = Depends(get_db)):
    """Get a specific volunteer by ID"""
    volunteer = db.query(CrewMemberModel).filter(CrewMemberModel.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer not found"
        )
    
    # Add trade team and crew information and parse serving_as
    if volunteer.trade_crew_id:
        crew = db.query(TradeCrewModel).filter(TradeCrewModel.id == volunteer.trade_crew_id).first()
        if crew:
            # Add attributes dynamically for response
            setattr(volunteer, 'trade_crew_name', crew.name)
            team = db.query(TradeTeamModel).filter(TradeTeamModel.id == crew.trade_team_id).first()
            if team:
                setattr(volunteer, 'trade_team_name', team.name)
    
    # Parse serving_as JSON string to list
    if volunteer.serving_as:
        try:
            setattr(volunteer, 'serving_as', json.loads(volunteer.serving_as))
        except (json.JSONDecodeError, TypeError):
            setattr(volunteer, 'serving_as', [])
    else:
        setattr(volunteer, 'serving_as', [])
    
    return volunteer


@router.put("/{volunteer_id}")
async def update_volunteer(
    volunteer_id: int,
    volunteer_update: dict,
    db: Session = Depends(get_db)
):
    """Update a volunteer's information"""
    db_volunteer = db.query(CrewMemberModel).filter(CrewMemberModel.id == volunteer_id).first()
    if not db_volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer not found"
        )
    
    update_data = volunteer_update.dict(exclude_unset=True)
    
    # Handle serving_as conversion from list to JSON string
    if 'serving_as' in update_data and update_data['serving_as'] is not None:
        update_data['serving_as'] = json.dumps(update_data['serving_as'])
    
    for field, value in update_data.items():
        setattr(db_volunteer, field, value)
    
    db.commit()
    db.refresh(db_volunteer)
    
    # Add trade team and crew information and parse serving_as
    if db_volunteer.trade_crew_id:
        crew = db.query(TradeCrewModel).filter(TradeCrewModel.id == db_volunteer.trade_crew_id).first()
        if crew:
            setattr(db_volunteer, 'trade_crew_name', crew.name)
            team = db.query(TradeTeamModel).filter(TradeTeamModel.id == crew.trade_team_id).first()
            if team:
                setattr(db_volunteer, 'trade_team_name', team.name)
    
    # Parse serving_as JSON string to list
    if db_volunteer.serving_as:
        try:
            setattr(db_volunteer, 'serving_as', json.loads(db_volunteer.serving_as))
        except (json.JSONDecodeError, TypeError):
            setattr(db_volunteer, 'serving_as', [])
    else:
        setattr(db_volunteer, 'serving_as', [])
    
    return db_volunteer


@router.post("/", response_model=CrewMember)
async def create_volunteer(volunteer_data: CrewMemberCreate, db: Session = Depends(get_db)):
    """Create a new volunteer"""
    # Convert serving_as list to JSON string for storage
    serving_as_json = None
    if volunteer_data.serving_as:
        serving_as_json = json.dumps(volunteer_data.serving_as)
    
    # Create new volunteer record
    db_volunteer = CrewMemberModel(
        first_name=volunteer_data.first_name,
        last_name=volunteer_data.last_name,
        email_personal=volunteer_data.email_personal,
        email_jw=volunteer_data.email_jw,
        phone=volunteer_data.phone,
        role=volunteer_data.role,
        congregation=volunteer_data.congregation,
        trade_crew_id=volunteer_data.trade_crew_id if volunteer_data.trade_crew_id else None,
        serving_as=serving_as_json,
        is_overseer=volunteer_data.is_overseer if volunteer_data.is_overseer else False,
        is_assistant=volunteer_data.is_assistant if volunteer_data.is_assistant else False,
        ba_id=volunteer_data.ba_id,
        availability_notes=volunteer_data.availability_notes,
        is_active=True
    )
    
    db.add(db_volunteer)
    db.commit()
    db.refresh(db_volunteer)
    
    # Add trade team and crew information and parse serving_as for response
    if db_volunteer.trade_crew_id:
        try:
            crew = db.query(TradeCrewModel).filter(TradeCrewModel.id == db_volunteer.trade_crew_id).first()
            if crew:
                setattr(db_volunteer, 'trade_crew_name', crew.name)
                team = db.query(TradeTeamModel).filter(TradeTeamModel.id == crew.trade_team_id).first()
                if team:
                    setattr(db_volunteer, 'trade_team_name', team.name)
        except Exception:
            # Skip crew/team lookup if there are schema issues
            setattr(db_volunteer, 'trade_crew_name', None)
            setattr(db_volunteer, 'trade_team_name', None)
    
    # Parse serving_as JSON string to list for response
    if db_volunteer.serving_as:
        try:
            setattr(db_volunteer, 'serving_as', json.loads(db_volunteer.serving_as))
        except (json.JSONDecodeError, TypeError):
            setattr(db_volunteer, 'serving_as', [])
    else:
        setattr(db_volunteer, 'serving_as', [])
    
    return db_volunteer


@router.get("/stats/summary")
async def get_volunteer_stats(db: Session = Depends(get_db)):
    """Get volunteer statistics summary"""
    total_volunteers = db.query(CrewMemberModel).filter(CrewMemberModel.is_active == True).count()
    
    # Get role breakdown based on actual role field
    roles = db.query(CrewMemberModel.role).filter(
        CrewMemberModel.is_active == True,
        CrewMemberModel.role.isnot(None)
    ).distinct().all()
    
    role_stats = []
    for (role,) in roles:
        count = db.query(CrewMemberModel).filter(
            CrewMemberModel.is_active == True,
            CrewMemberModel.role == role
        ).count()
        role_stats.append({"name": role, "count": count})
    
    # Get congregation breakdown
    congregations = db.query(CrewMemberModel.congregation).filter(
        CrewMemberModel.is_active == True,
        CrewMemberModel.congregation.isnot(None)
    ).distinct().all()
    
    congregation_stats = []
    for (congregation,) in congregations:
        count = db.query(CrewMemberModel).filter(
            CrewMemberModel.is_active == True,
            CrewMemberModel.congregation == congregation
        ).count()
        congregation_stats.append({"name": congregation, "count": count})
    
    return {
        "total_volunteers": total_volunteers,
        "role_breakdown": role_stats,
        "congregation_breakdown": congregation_stats
    }


@router.post("/roles", response_model=RoleResponse)
async def create_role(role_data: RoleCreate, db: Session = Depends(get_db)):
    """Create a new volunteer role"""
    # Check if role already exists
    existing_role = db.query(CrewMemberModel.role).filter(
        CrewMemberModel.role == role_data.name
    ).first()
    
    if existing_role:
        raise HTTPException(status_code=400, detail="Role already exists")
    
    # For now, we'll just return the role as created
    # In a full implementation, you might want a separate roles table
    return RoleResponse(
        name=role_data.name,
        count=0,
        description=role_data.description
    )
