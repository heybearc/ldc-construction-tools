"""
Admin endpoints for user and contact management
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.trade_teams import TradeTeam, TradeCrew, CrewMember
from app.schemas.admin import ContactImportSchema, ContactImportResponse
import csv
import io

router = APIRouter()


@router.post("/import-contacts", response_model=ContactImportResponse)
async def import_contacts(
    contacts_data: Dict[str, List[Dict[str, Any]]],
    db: Session = Depends(get_db)
):
    """
    Bulk import contacts from spreadsheet data
    """
    contacts = contacts_data.get("contacts", [])
    
    imported_count = 0
    updated_count = 0
    errors = []
    
    try:
        for contact_data in contacts:
            try:
                # Find or create trade team
                trade_team = None
                if contact_data.get("tradeTeam"):
                    trade_team = db.query(TradeTeam).filter(
                        TradeTeam.name == contact_data["tradeTeam"]
                    ).first()
                    
                    if not trade_team:
                        trade_team = TradeTeam(
                            name=contact_data["tradeTeam"],
                            description=f"{contact_data['tradeTeam']} trade team"
                        )
                        db.add(trade_team)
                        db.flush()
                
                # Find or create trade crew
                trade_crew = None
                if trade_team and contact_data.get("tradeCrew"):
                    trade_crew = db.query(TradeCrew).filter(
                        TradeCrew.name == contact_data["tradeCrew"],
                        TradeCrew.trade_team_id == trade_team.id
                    ).first()
                    
                    if not trade_crew:
                        trade_crew = TradeCrew(
                            name=contact_data["tradeCrew"],
                            trade_team_id=trade_team.id,
                            specialization=contact_data.get("tradeCrew", ""),
                            capacity=10  # Default capacity
                        )
                        db.add(trade_crew)
                        db.flush()
                
                # Check if crew member already exists
                existing_member = None
                if trade_crew:
                    existing_member = db.query(CrewMember).filter(
                        CrewMember.first_name == contact_data["firstName"],
                        CrewMember.last_name == contact_data["lastName"],
                        CrewMember.trade_crew_id == trade_crew.id
                    ).first()
                
                if existing_member:
                    # Update existing member
                    existing_member.role = contact_data.get("role", "Support")
                    existing_member.ba_id = contact_data.get("baId")
                    existing_member.phone = contact_data.get("phone")
                    existing_member.email_personal = contact_data.get("emailPersonal")
                    existing_member.email_jw = contact_data.get("emailJW")
                    existing_member.congregation = contact_data.get("congregation")
                    existing_member.is_overseer = contact_data.get("isOverseer", False)
                    existing_member.is_assistant = contact_data.get("isAssistant", False)
                    updated_count += 1
                else:
                    # Determine crew assignment based on role level
                    crew_id = None
                    role = contact_data.get("role", "Support")
                    
                    # Trade Team level roles (TTO, TTOA, TTS) don't get assigned to specific crews
                    trade_team_roles = ["Trade Team Overseer", "Trade Team Overseer Assistant", "Trade Team Support", "TTO", "TTOA", "TTS"]
                    is_trade_team_role = any(tt_role.lower() in role.lower() for tt_role in trade_team_roles)
                    
                    if is_trade_team_role:
                        # Trade Team level roles are not assigned to any crew - they oversee all crews in their trade team
                        crew_id = None
                    elif trade_crew:
                        # Trade Crew level roles get assigned to specific crews
                        crew_id = trade_crew.id
                    else:
                        # No specific assignment - create default crew for unassigned personnel
                        default_team = db.query(TradeTeam).filter(TradeTeam.name == "Unassigned").first()
                        if not default_team:
                            default_team = TradeTeam(name="Unassigned", description="Personnel not yet assigned to specific teams")
                            db.add(default_team)
                            db.flush()
                        
                        default_crew = db.query(TradeCrew).filter(
                            TradeCrew.name == "Support",
                            TradeCrew.trade_team_id == default_team.id
                        ).first()
                        if not default_crew:
                            default_crew = TradeCrew(
                                name="Support",
                                trade_team_id=default_team.id,
                                specialization="General Support",
                                capacity=50
                            )
                            db.add(default_crew)
                            db.flush()
                        crew_id = default_crew.id
                    
                    new_member = CrewMember(
                        first_name=contact_data["firstName"],
                        last_name=contact_data["lastName"],
                        ba_id=contact_data.get("baId"),
                        role=contact_data.get("role", "Support"),
                        phone=contact_data.get("phone"),
                        email_personal=contact_data.get("emailPersonal"),
                        email_jw=contact_data.get("emailJW"),
                        congregation=contact_data.get("congregation"),
                        is_overseer=contact_data.get("isOverseer", False),
                        is_assistant=contact_data.get("isAssistant", False),
                        trade_crew_id=crew_id
                    )
                    db.add(new_member)
                    imported_count += 1
                    
            except Exception as e:
                errors.append(f"Error processing {contact_data.get('firstName', '')} {contact_data.get('lastName', '')}: {str(e)}")
        
        db.commit()
        
        return ContactImportResponse(
            success=True,
            imported_count=imported_count,
            updated_count=updated_count,
            error_count=len(errors),
            errors=errors
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and parse CSV file for contact import
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        contents = await file.read()
        csv_data = contents.decode('utf-8')
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_data))
        contacts = []
        
        for row in csv_reader:
            contact = {
                "firstName": row.get("First Name", "").strip(),
                "lastName": row.get("Last Name", "").strip(),
                "role": row.get("Role", "Support").strip(),
                "phone": row.get("Phone", "").strip(),
                "emailPersonal": row.get("Personal Email", "").strip(),
                "emailJW": row.get("JW Email", "").strip(),
                "congregation": row.get("Congregation", "").strip(),
                "tradeTeam": row.get("Trade Team", "").strip(),
                "tradeCrew": row.get("Trade Crew", "").strip(),
                "isOverseer": "overseer" in row.get("Role", "").lower(),
                "isAssistant": "assistant" in row.get("Role", "").lower(),
            }
            
            if contact["firstName"] and contact["lastName"]:
                contacts.append(contact)
        
        return {"contacts": contacts, "count": len(contacts)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")


@router.get("/export-contacts")
async def export_contacts(db: Session = Depends(get_db)):
    """
    Export all contacts as CSV data
    """
    try:
        # Query all crew members with their team/crew info
        members = db.query(CrewMember).join(TradeCrew).join(TradeTeam).all()
        
        csv_data = []
        csv_data.append([
            "First Name", "Last Name", "BA ID#", "Role", "Phone", "Personal Email", 
            "JW Email", "Congregation", "Trade Team", "Trade Crew"
        ])
        
        for member in members:
            csv_data.append([
                member.first_name,
                member.last_name,
                member.ba_id or "",
                member.role,
                member.phone or "",
                member.email_personal or "",
                member.email_jw or "",
                member.congregation or "",
                member.trade_crew.trade_team.name,
                member.trade_crew.name
            ])
        
        # Convert to CSV string
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(csv_data)
        csv_string = output.getvalue()
        
        return {"csv_data": csv_string, "filename": "ldc_contacts_export.csv"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.post("/reset")
async def reset_database(db: Session = Depends(get_db)):
    """
    Reset all personnel data (use with caution)
    """
    try:
        # Delete all crew members
        db.query(CrewMember).delete()
        
        # Delete all trade crews
        db.query(TradeCrew).delete()
        
        # Delete all trade teams
        db.query(TradeTeam).delete()
        
        db.commit()
        
        return {"success": True, "message": "Database reset successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")


@router.get("/statistics")
async def get_statistics(db: Session = Depends(get_db)):
    """
    Get database statistics
    """
    try:
        total_teams = db.query(TradeTeam).count()
        total_crews = db.query(TradeCrew).count()
        total_members = db.query(CrewMember).count()
        total_overseers = db.query(CrewMember).filter(CrewMember.is_overseer == True).count()
        total_assistants = db.query(CrewMember).filter(CrewMember.is_assistant == True).count()
        
        return {
            "total_teams": total_teams,
            "total_crews": total_crews,
            "total_members": total_members,
            "total_overseers": total_overseers,
            "total_assistants": total_assistants
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics failed: {str(e)}")


@router.get("/debug/connectivity")
async def debug_connectivity(db: Session = Depends(get_db)):
    """
    Debug endpoint to test backend connectivity and database access
    """
    try:
        # Test database connection
        total_teams = db.query(TradeTeam).count()
        total_crews = db.query(TradeCrew).count()
        total_members = db.query(CrewMember).count()
        
        return {
            "status": "healthy",
            "message": "Backend and database are accessible",
            "database_stats": {
                "teams": total_teams,
                "crews": total_crews,
                "members": total_members
            },
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug connectivity failed: {str(e)}")
