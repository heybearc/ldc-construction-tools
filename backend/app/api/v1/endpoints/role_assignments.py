from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.trade_teams import RoleAssignment, TradeTeam, TradeCrew
from app.schemas.role_assignments import (
    RoleAssignmentCreate,
    RoleAssignmentUpdate,
    RoleAssignmentResponse,
    RoleAssignmentWithRelations
)

router = APIRouter()

@router.get("/", response_model=List[RoleAssignmentWithRelations])
def get_role_assignments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    trade_team_id: Optional[int] = Query(None),
    trade_crew_id: Optional[int] = Query(None),
    assignment_category: Optional[str] = Query(None),
    is_vacant: Optional[bool] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get role assignments with optional filtering"""
    query = db.query(RoleAssignment).options(
        joinedload(RoleAssignment.trade_team),
        joinedload(RoleAssignment.trade_crew)
    )
    
    if trade_team_id:
        query = query.filter(RoleAssignment.trade_team_id == trade_team_id)
    if trade_crew_id:
        query = query.filter(RoleAssignment.trade_crew_id == trade_crew_id)
    if assignment_category:
        query = query.filter(RoleAssignment.assignment_category == assignment_category)
    if is_vacant is not None:
        query = query.filter(RoleAssignment.is_vacant == is_vacant)
    if status:
        query = query.filter(RoleAssignment.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{role_id}", response_model=RoleAssignmentWithRelations)
def get_role_assignment(role_id: int, db: Session = Depends(get_db)):
    """Get a specific role assignment by ID"""
    role = db.query(RoleAssignment).options(
        joinedload(RoleAssignment.trade_team),
        joinedload(RoleAssignment.trade_crew)
    ).filter(RoleAssignment.id == role_id).first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    return role

@router.post("/", response_model=RoleAssignmentResponse)
def create_role_assignment(
    role_data: RoleAssignmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new role assignment"""
    # Validate trade team exists if provided
    if role_data.trade_team_id:
        trade_team = db.query(TradeTeam).filter(TradeTeam.id == role_data.trade_team_id).first()
        if not trade_team:
            raise HTTPException(status_code=400, detail="Trade team not found")
    
    # Validate trade crew exists if provided
    if role_data.trade_crew_id:
        trade_crew = db.query(TradeCrew).filter(TradeCrew.id == role_data.trade_crew_id).first()
        if not trade_crew:
            raise HTTPException(status_code=400, detail="Trade crew not found")
    
    # Create role assignment
    db_role = RoleAssignment(**role_data.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.patch("/{role_id}", response_model=RoleAssignmentResponse)
def update_role_assignment(
    role_id: int,
    role_update: RoleAssignmentUpdate,
    db: Session = Depends(get_db)
):
    """Update a role assignment (USLDC-2829-E compliance)"""
    role = db.query(RoleAssignment).filter(RoleAssignment.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    
    # Track changes for audit trail
    update_data = role_update.dict(exclude_unset=True)
    
    # Update fields
    for field, value in update_data.items():
        setattr(role, field, value)
    
    # Update timestamp
    role.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(role)
    return role

@router.delete("/{role_id}")
def delete_role_assignment(role_id: int, db: Session = Depends(get_db)):
    """Delete a role assignment"""
    role = db.query(RoleAssignment).filter(RoleAssignment.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    
    db.delete(role)
    db.commit()
    return {"message": "Role assignment deleted successfully"}

@router.get("/vacant/", response_model=List[RoleAssignmentWithRelations])
def get_vacant_positions(db: Session = Depends(get_db)):
    """Get all vacant role positions"""
    return db.query(RoleAssignment).options(
        joinedload(RoleAssignment.trade_team),
        joinedload(RoleAssignment.trade_crew)
    ).filter(RoleAssignment.is_vacant == True).all()

@router.get("/need-attention/", response_model=List[RoleAssignmentWithRelations])
def get_roles_needing_attention(db: Session = Depends(get_db)):
    """Get roles that need attention (not 'no_adjustment_needed' or 'change_implemented')"""
    return db.query(RoleAssignment).options(
        joinedload(RoleAssignment.trade_team),
        joinedload(RoleAssignment.trade_crew)
    ).filter(
        ~RoleAssignment.status.in_(['no_adjustment_needed', 'change_implemented'])
    ).all()

@router.get("/by-team/{team_id}", response_model=List[RoleAssignmentWithRelations])
def get_team_roles(team_id: int, db: Session = Depends(get_db)):
    """Get all role assignments for a specific trade team"""
    return db.query(RoleAssignment).options(
        joinedload(RoleAssignment.trade_team),
        joinedload(RoleAssignment.trade_crew)
    ).filter(
        RoleAssignment.trade_team_id == team_id,
        RoleAssignment.assignment_category == 'trade_team_leadership'
    ).all()

@router.get("/by-crew/{crew_id}", response_model=List[RoleAssignmentWithRelations])
def get_crew_roles(crew_id: int, db: Session = Depends(get_db)):
    """Get all role assignments for a specific trade crew"""
    return db.query(RoleAssignment).options(
        joinedload(RoleAssignment.trade_team),
        joinedload(RoleAssignment.trade_crew)
    ).filter(
        RoleAssignment.trade_crew_id == crew_id,
        RoleAssignment.assignment_category == 'trade_crew_leadership'
    ).all()

@router.post("/{role_id}/consultation", response_model=RoleAssignmentResponse)
def mark_consultation_completed(role_id: int, db: Session = Depends(get_db)):
    """Mark consultation as completed for USLDC-2829-E compliance"""
    role = db.query(RoleAssignment).filter(RoleAssignment.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    
    role.consultation_completed = True
    role.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(role)
    return role

@router.get("/stats/summary")
def get_role_assignment_stats(db: Session = Depends(get_db)):
    """Get summary statistics for role assignments"""
    total_roles = db.query(RoleAssignment).count()
    vacant_roles = db.query(RoleAssignment).filter(RoleAssignment.is_vacant == True).count()
    assigned_roles = total_roles - vacant_roles
    
    need_attention = db.query(RoleAssignment).filter(
        ~RoleAssignment.status.in_(['no_adjustment_needed', 'change_implemented'])
    ).count()
    
    no_adjustment_needed = db.query(RoleAssignment).filter(
        RoleAssignment.status == 'no_adjustment_needed'
    ).count()
    
    team_leadership = db.query(RoleAssignment).filter(
        RoleAssignment.assignment_category == 'trade_team_leadership'
    ).count()
    
    crew_leadership = db.query(RoleAssignment).filter(
        RoleAssignment.assignment_category == 'trade_crew_leadership'
    ).count()
    
    return {
        "total_roles": total_roles,
        "assigned_roles": assigned_roles,
        "vacant_roles": vacant_roles,
        "need_attention": need_attention,
        "no_adjustment_needed": no_adjustment_needed,
        "team_leadership_roles": team_leadership,
        "crew_leadership_roles": crew_leadership
    }
