"""
LDC Construction Tools - Application Configuration
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # Application
    PROJECT_NAME: str = "LDC Construction Tools"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # API
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = Field(default="ldc-construction-tools-secret-key-change-in-production", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Database configuration
    DATABASE_URL: str = Field(
        default="sqlite:///ldc_construction.db",
        description="Database connection URL"
    )
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
        env="ALLOWED_ORIGINS"
    )
    
    # Email (for notifications)
    SMTP_HOST: str = Field(default="", env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USER: str = Field(default="", env="SMTP_USER")
    SMTP_PASSWORD: str = Field(default="", env="SMTP_PASSWORD")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


def get_settings() -> Settings:
    return Settings()

settings = Settings()
