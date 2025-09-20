"""
API v1 router for LDC Construction Tools
"""

from fastapi import APIRouter

from app.api.v1.endpoints import volunteers, projects, trade_teams, admin, export, role_assignments, auth

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

api_router.include_router(
    role_assignments.router,
    prefix="/role-assignments",
    tags=["role-assignments"]
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)
