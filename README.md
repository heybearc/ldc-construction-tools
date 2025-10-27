# LDC Tools

A comprehensive personnel contact and project management system designed for LDC Construction Group 01.12 coordination.

## Purpose

This application serves as a **tracker system** for Construction Group personnel management, supporting the Personnel Contact (PC) role in coordinating trade teams, managing contact information, and tracking project assignments. It maintains existing Construction Group workflows while providing modern digital tools.

## Key Features

### **Trade Team Management**
- Construction Group 01.12 organizational structure
- 8 trade teams with specialized crews
- Trade Crew Overseer, Assistant, and Support role tracking
- Interactive crew member details with contact information

### **Personnel Contact System**
- Comprehensive contact directory with search and filtering
- Role-based organization (Trade Crew Overseers, Assistants, Support)
- Congregation assignments and contact information
- Statistics dashboard for member counts and roles

### **Admin Interface**
- **Bulk CSV Import**: Upload personnel data from spreadsheets
- **Data Export**: Download contact lists for Construction Group use
- **Template Downloads**: Properly formatted CSV templates
- **Database Management**: Reset and manage personnel data

### **Project Coordination**
- Project overview with status and phase tracking
- Trade crew assignment interface
- Contact information for Trade Crew Overseers on assignments
- Construction phase integration

### **Excel Integration**
- Import/export functionality maintaining Construction Group workflows
- Multiple export formats (Trade Teams, Projects, Contacts)
- Standardized filenames with timestamps
### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for responsive design
- **Modern, secure, responsive** web application

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy and configure environment:
```bash
cp .env.example .env
# Update .env with your database credentials and secret key
```

5. Run the development server (includes database initialization):
```bash
python run_dev.py
```

The API will be available at `http://localhost:8000` with documentation at `http://localhost:8000/docs`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Database Structure

The application includes seed data for Construction Group 01.12 organizational structure:

### Trade Teams
- **Site/Civil**: Site preparation, excavation, and civil work
- **Structural**: Concrete, masonry, and structural steel work  
- **Electrical**: Electrical systems and installations
- **Plumbing**: Plumbing and water systems
- **Mechanical**: HVAC and mechanical systems
- **Interiors**: Interior finishing and specialties
- **Exteriors**: Exterior finishing and roofing
- **Site Support**: Equipment, logistics, and site support

Each trade team contains multiple crews with specific specializations and capacity tracking.

## Key API Endpoints

### Trade Team Management
- `GET /api/v1/trade-teams/` - List all trade teams with summary
- `GET /api/v1/trade-teams/{team_id}/crews` - List crews for a team
- `GET /api/v1/trade-teams/crews/{crew_id}/members` - List crew members

### Project Management
- `GET /api/v1/projects/` - List all projects
- `POST /api/v1/projects/{project_id}/assignments` - Assign trade crew to project
- `GET /api/v1/projects/{project_id}/assignments` - View project assignments

### Excel Export
- `GET /api/v1/export/trade-teams` - Export complete organizational structure
- `GET /api/v1/export/projects/{project_id}` - Export project data with assignments
- `GET /api/v1/export/contacts` - Export contact list for Construction Group reference
### [Unreleased]
#### Added
- Initial project structure and documentation
- Technology stack selection and planning
- Development environment setup

### [0.1.0] - 2025-08-26
#### Added
- Project initialization
- README documentation
- Basic project structure planning
