#!/usr/bin/env python3
"""
Populate LDC Construction Tools database with complete trade team and crew structure
Based on user-provided organizational chart with 8 trade teams and 42 trade crews
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.core.database import SessionLocal
from app.models.trade_teams import TradeTeam, TradeCrew, RoleAssignment, RoleLevel, AssignmentCategory
from sqlalchemy.orm import Session

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Complete trade team and crew structure from user input
TRADE_TEAMS_DATA = {
    "ELECTRICAL": [
        "AUDIO & VIDEO",
        "ELECTRICAL COMMISSIONING", 
        "ELECTRICAL FINISH",
        "ELECTRICAL LOW VOLTAGE",
        "ELECTRICAL ROUGH-IN",
        "ELECTRICAL UTILITIES"
    ],
    "EXTERIORS": [
        "EXTERIOR SPECIALTIES",
        "MASONRY",
        "ROOFING", 
        "SCAFFOLDING",
        "SIDING",
        "WINDOWS"
    ],
    "INTERIORS": [
        "CARPET",
        "DOORS",
        "DRYWALL",
        "FINISH CARPENTRY",
        "INTERIOR SPECIALTIES",
        "PAINT",
        "SUSPENDED CEILING",
        "TILE",
        "TOILET PARTITIONS"
    ],
    "MECHANICAL": [
        "HVAC COMMISSIONING",
        "HVAC FINISH",
        "HVAC ROUGH-IN"
    ],
    "PLUMBING": [
        "PLUMBING FINISH",
        "PLUMBING ROUGH-IN", 
        "PLUMBING UTILITIES"
    ],
    "SITE SUPPORT": [
        "EQUIPMENT & VEHICLE MAINTENANCE",
        "PROJECT SUPPORT",
        "TRUCKING"
    ],
    "SITEWORK": [
        "ASPHALT COATING",
        "CONCRETE",
        "EARTHWORK",
        "LANDSCAPING",
        "PAVEMENT STRIPING",
        "TREE CLEARING"
    ],
    "STRUCTURAL": [
        "DEMOLITION",
        "FRAMING",
        "INSULATION",
        "REMEDIATION"
    ]
}

def create_role_assignments_for_team(db: Session, trade_team: TradeTeam):
    """Create the 3 team-level role assignments for a trade team"""
    team_roles = [
        (RoleLevel.TRADE_TEAM_OVERSEER, AssignmentCategory.BRANCH_APPOINTED),
        (RoleLevel.TRADE_TEAM_ASSISTANT_OVERSEER, AssignmentCategory.FIELD_ASSIGNED_CONTINUOUS),
        (RoleLevel.TRADE_TEAM_SUPPORT, AssignmentCategory.FIELD_ASSIGNED_TEMPORARY)
    ]
    
    for role_level, assignment_category in team_roles:
        role_assignment = RoleAssignment(
            role_level=role_level,
            assignment_category=assignment_category,
            trade_team_id=trade_team.id,
            is_vacant=True,
            status="no_adjustment_needed"
        )
        db.add(role_assignment)
        print(f"  ✅ Created {role_level.value} role for {trade_team.name}")

def create_role_assignments_for_crew(db: Session, trade_crew: TradeCrew):
    """Create the 4 crew-level role assignments for a trade crew"""
    crew_roles = [
        (RoleLevel.TRADE_CREW_OVERSEER, AssignmentCategory.FIELD_ASSIGNED_CONTINUOUS),
        (RoleLevel.TRADE_CREW_ASSISTANT_OVERSEER, AssignmentCategory.FIELD_ASSIGNED_CONTINUOUS),
        (RoleLevel.TRADE_CREW_SUPPORT, AssignmentCategory.FIELD_ASSIGNED_TEMPORARY),
        (RoleLevel.TRADE_CREW_VOLUNTEER, AssignmentCategory.FIELD_ASSIGNED_TEMPORARY)
    ]
    
    for role_level, assignment_category in crew_roles:
        role_assignment = RoleAssignment(
            role_level=role_level,
            assignment_category=assignment_category,
            trade_crew_id=trade_crew.id,
            is_vacant=True,
            status="no_adjustment_needed"
        )
        db.add(role_assignment)
        print(f"    ✅ Created {role_level.value} role for {trade_crew.name}")

def populate_database():
    """Populate database with complete trade team and crew structure"""
    db = SessionLocal()
    
    try:
        print("🏗️ Populating LDC Construction Tools database...")
        print(f"📊 Creating 8 trade teams, 42 trade crews, and 192 role positions")
        
        total_crews = 0
        total_roles = 0
        
        for team_name, crew_names in TRADE_TEAMS_DATA.items():
            print(f"\n🔧 Processing Trade Team: {team_name}")
            
            # Create or get trade team
            trade_team = db.query(TradeTeam).filter(TradeTeam.name == team_name).first()
            if not trade_team:
                trade_team = TradeTeam(
                    name=team_name,
                    ba_group_prefix=team_name,
                    description=f"{team_name} trade team for LDC Construction Group 01.12",
                    is_active=True
                )
                db.add(trade_team)
                db.flush()  # Get the ID
                print(f"  ✅ Created trade team: {team_name}")
            
            # Create team-level role assignments (3 roles per team)
            create_role_assignments_for_team(db, trade_team)
            total_roles += 3
            
            # Create trade crews
            for crew_name in crew_names:
                full_crew_name = crew_name
                ba_group_name = f"{team_name} – {crew_name}"
                
                trade_crew = db.query(TradeCrew).filter(
                    TradeCrew.name == full_crew_name,
                    TradeCrew.trade_team_id == trade_team.id
                ).first()
                
                if not trade_crew:
                    trade_crew = TradeCrew(
                        name=full_crew_name,
                        trade_team_id=trade_team.id,
                        ba_group_name=ba_group_name,
                        specialization=crew_name.lower().replace(" ", "_"),
                        is_active=True
                    )
                    db.add(trade_crew)
                    db.flush()  # Get the ID
                    print(f"    ✅ Created trade crew: {full_crew_name}")
                    total_crews += 1
                
                # Create crew-level role assignments (4 roles per crew)
                create_role_assignments_for_crew(db, trade_crew)
                total_roles += 4
        
        # Commit all changes
        db.commit()
        
        print(f"\n🎯 Database population completed successfully!")
        print(f"📊 Summary:")
        print(f"   • Trade Teams: 8")
        print(f"   • Trade Crews: {total_crews}")
        print(f"   • Role Positions: {total_roles}")
        print(f"   • Builder Assistant Groups: {total_crews}")
        
        # Verify the data
        team_count = db.query(TradeTeam).count()
        crew_count = db.query(TradeCrew).count()
        role_count = db.query(RoleAssignment).count()
        
        print(f"\n✅ Verification:")
        print(f"   • Teams in database: {team_count}")
        print(f"   • Crews in database: {crew_count}")
        print(f"   • Roles in database: {role_count}")
        
        if role_count == 192:
            print(f"🎉 Perfect! All 192 organizational positions created successfully!")
        else:
            print(f"⚠️  Expected 192 roles, found {role_count}")
            
    except Exception as e:
        print(f"❌ Error populating database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()
