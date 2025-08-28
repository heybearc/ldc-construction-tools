# LDC Construction Tools - Development Guide

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Update .env with your database credentials
python run_dev.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Application Structure

### Backend (FastAPI)
- **API Base URL**: `http://localhost:8000`
- **Documentation**: `http://localhost:8000/docs`
- **Database**: PostgreSQL with automatic initialization
- **Seed Data**: Construction Group 01.12 organizational structure

### Frontend (Next.js)
- **Application URL**: `http://localhost:3000`
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **API Proxy**: Configured to proxy `/api/*` to backend

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

## API Endpoints

### Trade Team Management
- `GET /api/v1/trade-teams/` - List all trade teams
- `GET /api/v1/trade-teams/{team_id}/crews` - List crews for team
- `GET /api/v1/trade-teams/crews/{crew_id}/members` - List crew members

### Project Management
- `GET /api/v1/projects/` - List all projects
- `GET /api/v1/projects/{project_id}/assignments` - List project assignments
- `POST /api/v1/projects/{project_id}/assignments` - Create assignment

### Export Functionality
- `GET /api/v1/export/trade-teams` - Export organizational structure
- `GET /api/v1/export/projects/{project_id}` - Export project data
- `GET /api/v1/export/contacts` - Export contact list

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
1. **Backend**: Add models in `app/models/`, schemas in `app/schemas/`, endpoints in `app/api/v1/endpoints/`
2. **Frontend**: Add components in `src/components/`, pages in `src/app/`, update API client in `src/lib/api.ts`
3. **Database**: Update `app/db/init_db.py` for seed data changes

### Testing
- **Backend**: `pytest` (when tests are added)
- **Frontend**: `npm test` (when tests are added)
- **Manual**: Use API docs at `http://localhost:8000/docs`

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
1. **Database connection**: Ensure PostgreSQL is running and credentials are correct
2. **CORS errors**: Check `ALLOWED_ORIGINS` in backend configuration
3. **API proxy**: Verify Next.js proxy configuration in `next.config.js`
4. **Excel exports**: Ensure `openpyxl` and `pandas` are installed in backend

### Development Tips
- **Backend logs**: Check terminal running `python run_dev.py`
- **Frontend logs**: Check browser console and terminal running `npm run dev`
- **API testing**: Use the interactive docs at `http://localhost:8000/docs`
- **Database reset**: Run `python -c "from app.db.init_db import reset_db; reset_db()"`

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
