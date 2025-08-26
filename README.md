# LDC Construction Tools

Tools and utilities to assist Personnel Contacts in supporting the Construction Group for Local Design/Construction (LDC) projects.

## Overview

This repository contains applications and tools designed to streamline coordination between Personnel Contacts and the Construction Group, helping manage volunteers, resources, and project logistics for Kingdom Hall and other theocratic construction projects.

## Project Goals

### Primary Objectives
- **Volunteer Coordination**: Tools for managing volunteer assignments and availability
- **Resource Management**: Track materials, equipment, and logistics
- **Communication**: Streamline communication between Personnel Contacts and Construction Group
- **Project Tracking**: Monitor construction project progress and milestones
- **Documentation**: Maintain records and generate reports for RBC/LDC oversight

### Target Users
- **Personnel Contacts**: Primary users managing volunteer coordination
- **Construction Group Overseers**: Project leadership and oversight
- **Volunteer Coordinators**: Managing specific skill groups and assignments
- **Administrative Personnel**: Documentation and reporting support

## Planned Features

### Phase 1: Core Volunteer Management
- [ ] Volunteer database with skills and availability tracking
- [ ] Assignment scheduling and notification system
- [ ] Contact information management
- [ ] Basic reporting capabilities

### Phase 2: Project Coordination
- [ ] Project timeline and milestone tracking
- [ ] Resource allocation and inventory management
- [ ] Communication hub for announcements and updates
- [ ] Integration with existing JW tools and workflows

### Phase 3: Advanced Features
- [ ] Mobile-responsive interface for field use
- [ ] Automated scheduling based on availability and skills
- [ ] Advanced reporting and analytics
- [ ] Integration with congregation management systems

## Technology Stack

### Backend
- **Python 3.11+**: Core application logic
- **FastAPI**: REST API framework
- **SQLAlchemy**: Database ORM
- **PostgreSQL**: Primary database
- **Pydantic**: Data validation and serialization

### Frontend
- **React**: User interface framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and state management

### Development Tools
- **Poetry**: Dependency management
- **Black**: Code formatting
- **Flake8**: Linting
- **Pytest**: Testing framework
- **Docker**: Containerization

## Project Structure

```
ldc-construction-tools/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API routes and endpoints
│   │   ├── core/           # Core configuration and utilities
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API client and utilities
│   │   └── types/          # TypeScript type definitions
│   └── package.json        # Node.js dependencies
├── docs/                   # Project documentation
├── scripts/                # Deployment and utility scripts
└── docker-compose.yml      # Development environment
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for development)

### Development Setup

1. **Clone and navigate to project**
   ```bash
   cd /Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools
   ```

2. **Backend setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb ldc_construction_tools
   
   # Run migrations
   cd backend
   alembic upgrade head
   ```

5. **Start development servers**
   ```bash
   # Backend (from backend/ directory)
   uvicorn app.main:app --reload --port 8000
   
   # Frontend (from frontend/ directory)
   npm run dev
   ```

## Contributing

### Development Workflow
1. Create feature branch from `develop`
2. Implement feature with comprehensive tests
3. Update documentation as needed
4. Submit pull request for review

### Code Standards
- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Maintain test coverage above 80%
- Document all public APIs and components

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Security Considerations

- **Data Privacy**: All personal information is handled according to JW privacy guidelines
- **Access Control**: Role-based permissions for different user types
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Audit Logging**: All data modifications are logged for accountability

## Deployment

### Production Environment
- Containerized deployment using Docker
- PostgreSQL database with regular backups
- SSL/TLS encryption for all communications
- Monitoring and logging for system health

### Staging Environment
- Mirror of production for testing
- Automated deployment from `develop` branch
- Integration testing and user acceptance testing

## License

This project is developed for use within the Jehovah's Witnesses organization for theocratic construction activities. All code is proprietary and intended for internal use only.

## Contact

For questions, suggestions, or support:
- **Project Lead**: Cory Allen
- **Email**: cory@personal.dev
- **Repository**: Personal GitHub - Cloudy-Work

## Changelog

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
