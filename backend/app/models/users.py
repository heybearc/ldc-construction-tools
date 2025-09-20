"""
User models for authentication and user management
Based on proven JW Attendant Scheduler patterns
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
import enum
import uuid

Base = declarative_base()

class UserRole(enum.Enum):
    SUPER_ADMIN = "super_admin"
    ZONE_OVERSEER = "zone_overseer"
    PERSONNEL_CONTACT = "personnel_contact"
    CONSTRUCTION_GROUP_OVERSEER = "construction_group_overseer"
    TRADE_TEAM_OVERSEER = "trade_team_overseer"
    FIELD_REP = "field_rep"
    READ_ONLY = "read_only"

class UserStatus(enum.Enum):
    INVITED = "invited"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=True)  # Null for invited users
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.READ_ONLY)
    status = Column(SQLEnum(UserStatus), nullable=False, default=UserStatus.INVITED)
    
    # Regional assignment
    region_id = Column(String(10), nullable=False, default="01.12")  # Zone.Region format
    zone_id = Column(String(5), nullable=False, default="01")
    
    # Authentication tracking
    email_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    login_count = Column(Integer, default=0)
    
    # Invitation tracking
    invited_by = Column(String, nullable=True)  # User ID who sent invitation
    invited_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def is_admin(self):
        return self.role in [UserRole.SUPER_ADMIN, UserRole.ZONE_OVERSEER]

    @property
    def can_manage_users(self):
        return self.role in [UserRole.SUPER_ADMIN, UserRole.ZONE_OVERSEER, UserRole.PERSONNEL_CONTACT]

    def __repr__(self):
        return f"<User {self.email} ({self.role.value})>"


class UserInvitation(Base):
    __tablename__ = "user_invitations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    
    # Regional assignment
    region_id = Column(String(10), nullable=False)
    zone_id = Column(String(5), nullable=False)
    
    # Invitation details
    invited_by = Column(String, nullable=False)  # User ID
    invitation_token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    
    # Status tracking
    status = Column(String(20), default="pending")  # pending, sent, accepted, expired, cancelled
    sent_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    
    # Reminder tracking
    reminders_sent = Column(Integer, default=0)
    last_reminder_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def __repr__(self):
        return f"<UserInvitation {self.email} ({self.status})>"


class EmailConfiguration(Base):
    __tablename__ = "email_configurations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Provider details
    provider = Column(String(20), nullable=False, default="gmail")  # gmail, outlook, smtp_custom
    display_name = Column(String(100), nullable=False)
    
    # SMTP Configuration
    smtp_host = Column(String(255), nullable=False)
    smtp_port = Column(Integer, nullable=False, default=587)
    username = Column(String(255), nullable=False)
    app_password_encrypted = Column(Text, nullable=False)  # Encrypted Gmail app password
    
    # Email settings
    from_email = Column(String(255), nullable=False)
    from_name = Column(String(255), nullable=False)
    encryption = Column(String(10), default="tls")  # tls, ssl, none
    
    # Status
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    test_status = Column(String(20), default="untested")  # untested, success, failed, testing
    last_tested = Column(DateTime, nullable=True)
    
    # Regional assignment (optional - for multi-tenant)
    region_id = Column(String(10), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<EmailConfiguration {self.display_name} ({self.provider})>"


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False)
    
    # Session details
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=False)
    last_accessed = Column(DateTime, default=func.now())

    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def __repr__(self):
        return f"<UserSession {self.user_id}>"
