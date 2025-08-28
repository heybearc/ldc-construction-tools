"""
API v1 router for LDC Construction Tools
"""

from fastapi import APIRouter

from app.api.v1.endpoints import trade_teams, projects, admin, export, volunteers

api_router = APIRouter()

api_router.include_router(
    trade_teams.router,
    prefix="/trade-teams",
    tags=["trade-teams"]
)

api_router.include_router(
    projects.router,
    prefix="/projects",
    tags=["projects"]
)

api_router.include_router(
    export.router,
    prefix="/export",
    tags=["export"]
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"]
)

api_router.include_router(
    volunteers.router,
    prefix="/volunteers",
    tags=["volunteers"]
)
