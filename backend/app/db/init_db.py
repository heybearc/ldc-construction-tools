"""
Database initialization and seed data for LDC Construction Tools
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_tables
from app.models.trade_teams import TradeTeam, TradeCrew, CrewMember
from app.models.projects import ConstructionPhase


def init_db() -> None:
    """Initialize database with tables and seed data"""
    # Create all tables
    create_tables()
    
    # Create seed data
    db = SessionLocal()
    try:
        create_seed_data(db)
    finally:
        db.close()


def create_seed_data(db: Session) -> None:
    """Create initial seed data for the application"""
    
    # Check if data already exists
    if db.query(TradeTeam).first():
        print("Seed data already exists, skipping...")
        return
    
    print("Creating seed data...")
    
    # Create Construction Phases
    phases = [
        ConstructionPhase(name="Site Preparation/Clearing", description="Initial site work and preparation", sequence_order=1),
        ConstructionPhase(name="Construction Mobilization/Temp Services", description="Setup and temporary utilities", sequence_order=2),
        ConstructionPhase(name="Site Work", description="Foundation and site infrastructure", sequence_order=3),
        ConstructionPhase(name="Structural", description="Building framework and structural elements", sequence_order=4),
        ConstructionPhase(name="Rough-in", description="Mechanical, electrical, plumbing rough installations", sequence_order=5),
        ConstructionPhase(name="Finishes", description="Interior and exterior finishing work", sequence_order=6),
        ConstructionPhase(name="Construction Final Prep", description="Final inspections and project completion", sequence_order=7),
    ]
    
    for phase in phases:
        db.add(phase)
    
    # Create Trade Teams based on Construction Group 01.12 actual personnel data
    trade_teams_data = [
        {
            "name": "Site/Civil",
            "description": "Site preparation, excavation, and civil engineering work",
            "crews": [
                {
                    "name": "Site Prep Crew A",
                    "specialization": "Excavation and grading",
                    "members": [
                        {"name": "Bro. Ackerman", "role": "Trade Crew Overseer", "phone": "555-0101", "email": "ackerman@example.com", "congregation": "Central"},
                        {"name": "Bro. Alvarado", "role": "Assistant", "phone": "555-0102", "email": "alvarado@example.com", "congregation": "North"},
                        {"name": "Bro. Andersen", "role": "Support", "phone": "555-0103", "email": "andersen@example.com", "congregation": "South"},
                    ]
                },
                {
                    "name": "Site Prep Crew B", 
                    "specialization": "Utilities and infrastructure",
                    "members": [
                        {"name": "Bro. Anderson", "role": "Trade Crew Overseer", "phone": "555-0104", "email": "anderson@example.com", "congregation": "East"},
                        {"name": "Bro. Arellano", "role": "Assistant", "phone": "555-0105", "email": "arellano@example.com", "congregation": "West"},
                    ]
                }
            ]
        },
        {
            "name": "Structural",
            "description": "Concrete, steel, and structural framework", 
            "crews": [
                {
                    "name": "Concrete Crew",
                    "specialization": "Concrete work and foundations",
                    "members": [
                        {"name": "Bro. Arroyo", "role": "Trade Crew Overseer", "phone": "555-0201", "email": "arroyo@example.com", "congregation": "Central"},
                        {"name": "Bro. Avila", "role": "Assistant", "phone": "555-0202", "email": "avila@example.com", "congregation": "North"},
                        {"name": "Bro. Baca", "role": "Support", "phone": "555-0203", "email": "baca@example.com", "congregation": "South"},
                    ]
                },
                {
                    "name": "Steel Crew",
                    "specialization": "Structural steel and framing",
                    "members": [
                        {"name": "Bro. Baez", "role": "Trade Crew Overseer", "phone": "555-0204", "email": "baez@example.com", "congregation": "East"},
                        {"name": "Bro. Baker", "role": "Assistant", "phone": "555-0205", "email": "baker@example.com", "congregation": "West"},
                    ]
                }
            ]
        },
        {
            "name": "Electrical",
            "description": "Electrical systems and power distribution",
            "crews": [
                {
                    "name": "Audio & Video",
                    "specialization": "Electrical - Audio & Video systems", 
                    "members": [
                        {"name": "Hayden Jacob Ronald", "role": "Trade Crew Overseer", "phone": "555-0301", "email": "hayden.jacob@example.com", "congregation": "Central"},
                        {"name": "Huckeba Jason", "role": "Assistant", "phone": "555-0302", "email": "huckeba.jason@example.com", "congregation": "North"},
                        {"name": "Anderson Karen Diane", "role": "Support", "phone": "555-0303", "email": "anderson.karen@example.com", "congregation": "South"},
                        {"name": "Hayden Katherine", "role": "Support", "phone": "555-0304", "email": "hayden.katherine@example.com", "congregation": "East"},
                        {"name": "Moore Tanya Nicole", "role": "Support", "phone": "555-0305", "email": "moore.tanya@example.com", "congregation": "West"},
                        {"name": "Anderson Karen Diane", "role": "Support", "phone": "555-0306", "email": "anderson.karen2@example.com", "congregation": "Central"},
                        {"name": "Moore Tanya Nicole", "role": "Support", "phone": "555-0307", "email": "moore.tanya2@example.com", "congregation": "North"},
                    ]
                },
                {
                    "name": "Electrical Commissioning", 
                    "specialization": "Electrical commissioning and testing",
                    "members": [
                        {"name": "TBD", "role": "Trade Crew Overseer", "phone": "555-0308", "email": "tbd.electrical@example.com", "congregation": "South"},
                    ]
                },
                {
                    "name": "Electrical Finish", 
                    "specialization": "Electrical finishing work",
                    "members": [
                        {"name": "Moore Matthew Thomas", "role": "Trade Crew Overseer", "phone": "555-0309", "email": "moore.matthew@example.com", "congregation": "East"},
                        {"name": "Anderson Clinton Lewis Sr.", "role": "Assistant", "phone": "555-0310", "email": "anderson.clinton@example.com", "congregation": "West"},
                    ]
                },
                {
                    "name": "Electrical Low Voltage", 
                    "specialization": "Low voltage electrical systems",
                    "members": [
                        {"name": "Nippo Michael L.", "role": "Trade Crew Overseer", "phone": "555-0311", "email": "nippo.michael@example.com", "congregation": "Central"},
                    ]
                },
                {
                    "name": "Electrical Rough-in", 
                    "specialization": "Electrical rough-in installation",
                    "members": [
                        {"name": "Moore Matthew Thomas", "role": "Trade Crew Overseer", "phone": "555-0312", "email": "moore.matthew2@example.com", "congregation": "North"},
                        {"name": "Anderson Clinton Lewis Sr.", "role": "Assistant", "phone": "555-0313", "email": "anderson.clinton2@example.com", "congregation": "South"},
                    ]
                },
                {
                    "name": "Electrical Utilities", 
                    "specialization": "Electrical utilities and infrastructure",
                    "members": [
                        {"name": "TBD", "role": "Trade Crew Overseer", "phone": "555-0314", "email": "tbd.utilities@example.com", "congregation": "East"},
                    ]
                }
            ]
        },
        {
            "name": "Plumbing",
            "description": "Plumbing systems and water distribution",
            "crews": [
                {
                    "name": "Main Plumbing Crew",
                    "specialization": "Water, sewer, and gas systems",
                    "members": [
                        {"name": "Bro. Bravo", "role": "Trade Crew Overseer", "phone": "555-0401", "email": "bravo@example.com", "congregation": "Central"},
                        {"name": "Bro. Burgos", "role": "Assistant", "phone": "555-0402", "email": "burgos@example.com", "congregation": "North"},
                        {"name": "Bro. Cabrera", "role": "Support", "phone": "555-0403", "email": "cabrera@example.com", "congregation": "South"},
                    ]
                }
            ]
        },
        {
            "name": "Mechanical", 
            "description": "HVAC and mechanical systems",
            "crews": [
                {
                    "name": "HVAC Crew",
                    "specialization": "Heating, ventilation, and air conditioning",
                    "members": [
                        {"name": "Bro. Calderon", "role": "Trade Crew Overseer", "phone": "555-0501", "email": "calderon@example.com", "congregation": "East"},
                        {"name": "Bro. Campos", "role": "Assistant", "phone": "555-0502", "email": "campos@example.com", "congregation": "West"},
                    ]
                }
            ]
        },
        {
            "name": "Interiors",
            "description": "Interior finishing and fixtures",
            "crews": [
                {
                    "name": "Drywall Crew",
                    "specialization": "Drywall installation and finishing",
                    "members": [
                        {"name": "Bro. Cardenas", "role": "Trade Crew Overseer", "phone": "555-0601", "email": "cardenas@example.com", "congregation": "Central"},
                        {"name": "Bro. Carrillo", "role": "Assistant", "phone": "555-0602", "email": "carrillo@example.com", "congregation": "North"},
                        {"name": "Bro. Castillo", "role": "Support", "phone": "555-0603", "email": "castillo@example.com", "congregation": "South"},
                    ]
                },
                {
                    "name": "Flooring Crew",
                    "specialization": "Flooring installation and finishing", 
                    "members": [
                        {"name": "Bro. Castro", "role": "Trade Crew Overseer", "phone": "555-0604", "email": "castro@example.com", "congregation": "East"},
                        {"name": "Bro. Cervantes", "role": "Assistant", "phone": "555-0605", "email": "cervantes@example.com", "congregation": "West"},
                    ]
                }
            ]
        },
        {
            "name": "Exteriors",
            "description": "Exterior finishing and landscaping",
            "crews": [
                {
                    "name": "Roofing Crew",
                    "specialization": "Roofing and exterior weather protection",
                    "members": [
                        {"name": "Bro. Chavez", "role": "Trade Crew Overseer", "phone": "555-0701", "email": "chavez@example.com", "congregation": "Central"},
                        {"name": "Bro. Cisneros", "role": "Assistant", "phone": "555-0702", "email": "cisneros@example.com", "congregation": "North"},
                        {"name": "Bro. Contreras", "role": "Support", "phone": "555-0703", "email": "contreras@example.com", "congregation": "South"},
                    ]
                },
                {
                    "name": "Landscaping Crew",
                    "specialization": "Site landscaping and exterior finishing",
                    "members": [
                        {"name": "Bro. Cordova", "role": "Trade Crew Overseer", "phone": "555-0704", "email": "cordova@example.com", "congregation": "East"},
                        {"name": "Bro. Cruz", "role": "Assistant", "phone": "555-0705", "email": "cruz@example.com", "congregation": "West"},
                    ]
                }
            ]
        },
        {
            "name": "Site Support",
            "description": "General site support and coordination",
            "crews": [
                {
                    "name": "Safety Crew",
                    "specialization": "Site safety and compliance",
                    "members": [
                        {"name": "Bro. Delgado", "role": "Trade Crew Overseer", "phone": "555-0801", "email": "delgado@example.com", "congregation": "Central"},
                        {"name": "Bro. Diaz", "role": "Assistant", "phone": "555-0802", "email": "diaz@example.com", "congregation": "North"},
                        {"name": "Bro. Dominguez", "role": "Support", "phone": "555-0803", "email": "dominguez@example.com", "congregation": "South"},
                    ]
                },
                {
                    "name": "Logistics Crew",
                    "specialization": "Material handling and site logistics",
                    "members": [
                        {"name": "Bro. Duran", "role": "Trade Crew Overseer", "phone": "555-0804", "email": "duran@example.com", "congregation": "East"},
                        {"name": "Bro. Espinoza", "role": "Assistant", "phone": "555-0805", "email": "espinoza@example.com", "congregation": "West"},
                    ]
                }
            ]
        }
    ]
    
    # Create trade teams and crews
    for team_data in trade_teams_data:
        # Create trade team
        trade_team = TradeTeam(
            name=team_data["name"],
            description=team_data["description"]
        )
        db.add(trade_team)
        db.flush()  # Get the ID
        
        # Create crews for this team
        for crew_data in team_data["crews"]:
            trade_crew = TradeCrew(
                name=crew_data["name"],
                trade_team_id=trade_team.id,
                specialization=crew_data["specialization"],
                capacity=len(crew_data["members"])
            )
            db.add(trade_crew)
            db.flush()  # Get the ID
            
            # Create crew members
            for member_data in crew_data["members"]:
                # Split name into first and last name
                name_parts = member_data["name"].split(" ", 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ""
                
                crew_member = CrewMember(
                    first_name=first_name,
                    last_name=last_name,
                    ba_id=None,  # Will be populated during actual data import
                    role=member_data["role"],
                    phone=member_data["phone"],
                    email_personal=member_data["email"],
                    congregation=member_data["congregation"],
                    is_overseer=(member_data["role"] == "Trade Crew Overseer"),
                    is_assistant=(member_data["role"] == "Assistant"),
                    trade_crew_id=trade_crew.id
                )
                db.add(crew_member)
    
    # Commit all changes
    db.commit()
    print("Seed data created successfully!")


def reset_db() -> None:
    """Reset database (drop and recreate all tables)"""
    from app.core.database import drop_tables
    print("Dropping all tables...")
    drop_tables()
    print("Recreating tables and seed data...")
    init_db()
    print("Database reset complete!")


if __name__ == "__main__":
    init_db()
