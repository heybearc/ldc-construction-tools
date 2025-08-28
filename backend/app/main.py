"""
LDC Construction Tools - Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings

app = FastAPI(
    title="LDC Construction Tools API",
    description="API for Personnel Contact tools to assist Construction Group coordination",
    version="0.1.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return JSONResponse(
        content={
            "message": "LDC Construction Tools API",
            "version": "0.1.0",
            "status": "healthy",
            "docs": "/docs" if settings.ENVIRONMENT != "production" else "disabled",
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return JSONResponse(
        content={
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "database": "connected",  # TODO: Add actual DB health check
        }
    )


# Include API routers
from app.api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")
