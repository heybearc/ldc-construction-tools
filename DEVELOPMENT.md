# LDC Construction Tools - Development Guide

## Architecture Overview

**LDC Tools is a Next.js full-stack application** (migrated from FastAPI in v1.18.0):
- **Frontend:** Next.js 14 with React, TypeScript, Tailwind CSS
- **API:** Next.js API routes in `frontend/src/app/api/v1/`
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** Blue-green deployment on Proxmox containers

See `ARCHITECTURE-HISTORY.md` for migration details.

## Quick Start

### Development Setup

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.test.example .env.local
# Update DATABASE_URL and other environment variables
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Application Structure

### Next.js Full-Stack Application
- **Application URL**: `http://localhost:3001`
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **API Routes**: `frontend/src/app/api/v1/*`
- **Database**: PostgreSQL with Prisma ORM
- **Seed Data**: Construction Group 01.12 organizational structure

## Core Features

### 1. Trade Team Management (`/`)
- **Visual organizational structure** with Construction Group 01.12 hierarchy
- **Interactive navigation** through teams → crews → members
- **Contact information** display with phone, email, congregation
- **Excel export** for organizational structure and contact lists

### 2. Project Management (`/projects`)
- **Project overview** with status and phase tracking
- **Trade crew assignments** showing which crews are assigned to projects
- **Contact information** for Trade Crew Overseers on each assignment
- **Excel export** for individual project data

### 3. Contact Management (`/contacts`)
- **Comprehensive contact directory** with search and filtering
- **Role-based filtering** (Trade Crew Overseers, Assistants, etc.)
- **Team-based filtering** and search across all fields
- **Statistics dashboard** showing member counts and roles
- **Excel export** optimized for Construction Group use

## Database Schema

### Trade Teams Structure
```
Trade Teams (8 teams)
├── Site/Civil (2 crews)
├── Structural (2 crews)  
├── Electrical (2 crews)
├── Plumbing (1 crew)
├── Mechanical (1 crew)
├── Interiors (2 crews)
├── Exteriors (2 crews)
└── Site Support (2 crews)
```

### Construction Phases
1. Site Preparation/Clearing
2. Construction Mobilization/Temp Services
3. Site Work
4. Structural
5. Rough-in
6. Finishes
7. Construction Final Prep

## API Routes (Next.js)

All API routes are located in `frontend/src/app/api/v1/` and use Prisma for database access.

### Trade Team Management
- `GET /api/v1/trade-teams/` - List all trade teams
- `GET /api/v1/trade-teams/{team_id}/crews` - List crews for team
- `GET /api/v1/trade-teams/{team_id}` - Get team details

### Volunteer Management
- `GET /api/v1/volunteers/` - List all volunteers
- `POST /api/v1/volunteers/` - Create volunteer
- `GET /api/v1/volunteers/{id}` - Get volunteer details
- `PATCH /api/v1/volunteers/{id}` - Update volunteer

### Project Management
- `GET /api/v1/projects/` - List all projects
- `POST /api/v1/projects/` - Create project
- `GET /api/v1/projects/{id}/assignments` - List project assignments

### Export Functionality
- `GET /api/v1/export/` - Export data in various formats

## Excel Export Features

### Trade Teams Export
- **Trade Teams Sheet**: Summary with crew counts and member totals
- **Trade Crews Sheet**: Detailed crew information with specializations
- **Crew Members Sheet**: Complete contact directory with roles

### Project Export
- **Project Info Sheet**: Project details and timeline
- **Project Assignments Sheet**: Trade crew assignments with contact info
- **Construction Phases Sheet**: Standard phases for reference

### Contact List Export
- **Contact List Sheet**: Optimized for Construction Group use
- **Role Summary Sheet**: Statistics by role type
- **Sorted by priority**: Trade Crew Overseers first, then alphabetical

## Development Workflow

### Adding New Features
1. **Database Schema**: Update `frontend/prisma/schema.prisma`
2. **API Routes**: Add routes in `frontend/src/app/api/v1/`
3. **Frontend**: Add components in `frontend/src/components/`, pages in `frontend/src/app/`
4. **Types**: Prisma generates types automatically from schema

### Testing
- **E2E Tests**: `npm run test:e2e` (Playwright)
- **Smoke Tests**: `npm run test:smoke:quick`
- **Type Check**: `npm run type-check`
- **Build Test**: `npm run build`

## Deployment Considerations

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key (generate secure random string)
- `ENVIRONMENT`: Set to "production" for production deployment
- `ALLOWED_ORIGINS`: Frontend URL for CORS

### Security Features
- **HTTPS enforcement** in production
- **CORS configuration** for frontend integration
- **Input validation** with Pydantic schemas
- **SQL injection prevention** with SQLAlchemy ORM

## Troubleshooting

### Common Issues
1. **Database connection**: Ensure PostgreSQL is running and `DATABASE_URL` is correct in `.env.local`
2. **Prisma errors**: Run `npx prisma generate` to regenerate client
3. **Build errors**: Run `npm run type-check` to identify TypeScript issues
4. **Port conflicts**: Ensure port 3001 is available

### Development Tips
- **Application logs**: Check terminal running `npm run dev`
- **Browser logs**: Check browser console for client-side errors
- **Database reset**: Run `npx prisma migrate reset` (WARNING: deletes all data)
- **Prisma Studio**: Run `npx prisma studio` for visual database management

## Next Steps

### Phase 2 Features (Months 3-4)
- **Calendar integration** matching Construction Group operational workflow
- **Project assignment interface** for creating new assignments
- **3-week look ahead** dashboard for Construction Group meetings
- **Enhanced reporting** with timeline integration

### Production Deployment
- **Docker containerization** for consistent deployment
- **Database migrations** with Alembic
- **Environment-specific configurations**
- **Monitoring and logging** setup
