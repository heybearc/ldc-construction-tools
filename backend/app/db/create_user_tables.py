"""
Database migration script to create user management tables
Run this to add authentication system to existing LDC Construction Tools database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import get_settings
from app.models.users import Base, User, UserInvitation, EmailConfiguration, UserSession, UserRole, UserStatus
import bcrypt
from datetime import datetime, timedelta
import uuid

def create_user_tables():
    """Create all user management tables"""
    settings = get_settings()
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    print("🔧 Creating user management tables...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ User management tables created successfully!")
    
    # Create default admin user
    create_default_admin_user(engine)
    
    # Create default email configuration
    create_default_email_config(engine)

def create_default_admin_user(engine):
    """Create default admin user for initial access"""
    print("👤 Creating default admin user...")
    
    # Check if admin user already exists
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM users WHERE email = 'admin@ldc-construction.local'"))
        count = result.scalar()
        
        if count > 0:
            print("ℹ️  Admin user already exists, skipping creation")
            return
    
    # Create admin user
    admin_password = "AdminPass123!"  # Change this in production
    password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin_user = {
        'id': str(uuid.uuid4()),
        'email': 'admin@ldc-construction.local',
        'first_name': 'System',
        'last_name': 'Administrator',
        'password_hash': password_hash,
        'role': UserRole.SUPER_ADMIN.value,
        'status': UserStatus.ACTIVE.value,
        'region_id': '01.12',
        'zone_id': '01',
        'email_verified': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO users (id, email, first_name, last_name, password_hash, role, status, 
                             region_id, zone_id, email_verified, created_at, updated_at)
            VALUES (:id, :email, :first_name, :last_name, :password_hash, :role, :status,
                    :region_id, :zone_id, :email_verified, :created_at, :updated_at)
        """), admin_user)
        conn.commit()
    
    print(f"✅ Default admin user created:")
    print(f"   Email: admin@ldc-construction.local")
    print(f"   Password: {admin_password}")
    print(f"   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!")

def create_default_email_config(engine):
    """Create default email configuration template"""
    print("📧 Creating default email configuration template...")
    
    # Check if email config already exists
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM email_configurations"))
        count = result.scalar()
        
        if count > 0:
            print("ℹ️  Email configuration already exists, skipping creation")
            return
    
    # Create default Gmail configuration (needs to be configured by admin)
    email_config = {
        'id': str(uuid.uuid4()),
        'provider': 'gmail',
        'display_name': 'LDC Construction Tools Gmail',
        'smtp_host': 'smtp.gmail.com',
        'smtp_port': 587,
        'username': 'your-email@gmail.com',  # To be configured
        'app_password_encrypted': 'CONFIGURE_GMAIL_APP_PASSWORD',  # To be configured
        'from_email': 'your-email@gmail.com',  # To be configured
        'from_name': 'LDC Construction Tools',
        'encryption': 'tls',
        'is_default': True,
        'is_active': False,  # Inactive until configured
        'test_status': 'untested',
        'region_id': '01.12',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO email_configurations (id, provider, display_name, smtp_host, smtp_port,
                                            username, app_password_encrypted, from_email, from_name,
                                            encryption, is_default, is_active, test_status, region_id,
                                            created_at, updated_at)
            VALUES (:id, :provider, :display_name, :smtp_host, :smtp_port,
                    :username, :app_password_encrypted, :from_email, :from_name,
                    :encryption, :is_default, :is_active, :test_status, :region_id,
                    :created_at, :updated_at)
        """), email_config)
        conn.commit()
    
    print("✅ Default email configuration template created")
    print("   Configure Gmail SMTP settings in the admin panel")

if __name__ == "__main__":
    print("🚀 LDC Construction Tools - User Management Setup")
    print("=" * 50)
    
    try:
        create_user_tables()
        print("\n🎉 User management system setup complete!")
        print("\nNext steps:")
        print("1. Login with admin@ldc-construction.local / AdminPass123!")
        print("2. Configure Gmail SMTP settings")
        print("3. Create additional users")
        print("4. Change default admin password")
        
    except Exception as e:
        print(f"\n❌ Error setting up user management: {e}")
        sys.exit(1)
