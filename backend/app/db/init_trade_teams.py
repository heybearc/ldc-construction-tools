"""
Initialize 8 Standard Trade Teams for LDC Construction Tools
Based on LDC Construction Group organizational structure
"""

from sqlalchemy.orm import Session
from app.models.trade_teams import TradeTeam
from app.db.database import get_db

# 8 Standard Trade Teams for LDC Construction
STANDARD_TRADE_TEAMS = [
    {
        "name": "Site Work",
        "description": "Site preparation, excavation, utilities, and foundation work"
    },
    {
        "name": "Structural",
        "description": "Concrete, masonry, steel, and structural framing"
    },
    {
        "name": "Roofing",
        "description": "Roofing systems, waterproofing, and exterior envelope"
    },
    {
        "name": "Electrical",
        "description": "Electrical systems, lighting, and power distribution"
    },
    {
        "name": "Plumbing",
        "description": "Plumbing systems, HVAC, and mechanical systems"
    },
    {
        "name": "Drywall & Paint",
        "description": "Interior finishing, drywall, painting, and decorative work"
    },
    {
        "name": "Flooring & Tile",
        "description": "Flooring installation, tile work, and interior surfaces"
    },
    {
        "name": "Finish Carpentry",
        "description": "Trim work, cabinetry, doors, and final carpentry details"
    }
]

def init_standard_trade_teams(db: Session) -> None:
    """Initialize the 8 standard trade teams in the database"""
    
    print("Initializing 8 standard trade teams...")
    
    for team_data in STANDARD_TRADE_TEAMS:
        # Check if trade team already exists
        existing_team = db.query(TradeTeam).filter(
            TradeTeam.name == team_data["name"]
        ).first()
        
        if not existing_team:
            trade_team = TradeTeam(
                name=team_data["name"],
                description=team_data["description"],
                is_active=True
            )
            db.add(trade_team)
            print(f"✓ Created trade team: {team_data['name']}")
        else:
            print(f"- Trade team already exists: {team_data['name']}")
    
    db.commit()
    print("✓ Standard trade teams initialization complete")

def get_trade_teams_summary(db: Session) -> dict:
    """Get summary of current trade teams"""
    
    teams = db.query(TradeTeam).filter(TradeTeam.is_active == True).all()
    
    return {
        "total_teams": len(teams),
        "teams": [
            {
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "crew_count": len(team.trade_crews) if team.trade_crews else 0
            }
            for team in teams
        ]
    }

if __name__ == "__main__":
    # Initialize trade teams when run directly
    from app.db.database import SessionLocal
    
    db = SessionLocal()
    try:
        init_standard_trade_teams(db)
        
        # Display summary
        summary = get_trade_teams_summary(db)
        print(f"\nTrade Teams Summary:")
        print(f"Total Active Teams: {summary['total_teams']}")
        
        for team in summary['teams']:
            print(f"- {team['name']}: {team['crew_count']} crews")
            
    finally:
        db.close()
