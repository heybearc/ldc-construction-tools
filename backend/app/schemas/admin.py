"""
Admin schemas for contact and user management
"""

from typing import List, Optional
from pydantic import BaseModel, EmailStr


class ContactImportSchema(BaseModel):
    firstName: str
    lastName: str
    role: str
    phone: Optional[str] = None
    emailPersonal: Optional[str] = None
    emailJW: Optional[str] = None
    congregation: Optional[str] = None
    tradeTeam: Optional[str] = None
    tradeCrew: Optional[str] = None
    isOverseer: bool = False
    isAssistant: bool = False


class ContactImportResponse(BaseModel):
    success: bool
    imported_count: int
    updated_count: int
    error_count: int
    errors: List[str] = []


class DatabaseStatistics(BaseModel):
    total_teams: int
    total_crews: int
    total_members: int
    total_overseers: int
    total_assistants: int


class ExportResponse(BaseModel):
    csv_data: str
    filename: str
