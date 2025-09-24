"""
Authentication endpoints for user login and management
"""

from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import bcrypt
import jwt

from app.core.database import get_db
from app.models.users import User, UserStatus

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user"""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user or user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return LoginResponse(
        success=True,
        message="Login successful",
        user={
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "region_id": user.region_id,
            "zone_id": user.zone_id
        }
    )
