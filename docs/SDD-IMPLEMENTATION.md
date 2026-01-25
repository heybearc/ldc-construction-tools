# SDD Implementation Guide - LDC Construction Tools

## Overview
This document describes the complete SDD (Software-Defined Development) implementation for LDC Construction Tools, featuring a modular library architecture where each feature is built as an independent, reusable module.

## Architecture

### Modular Library Structure
```
lib/
├── role-management/          # Role and user assignment management
├── trade-teams/             # Trade team and crew organization
└── volunteer-management/    # Volunteer coordination and tracking
```

Each module follows the SDD pattern:
- `src/` - TypeScript source code
- `tests/` - Unit and integration tests
- `contracts/` - OpenAPI specifications
- `specs/` - Feature specifications and requirements

### Module Dependencies
```typescript
// Import modules in your application
import { RoleManagementAPI } from '@ldc-tools/role-management';
import { TradeTeamsAPI } from '@ldc-tools/trade-teams';
import { VolunteerManagementAPI } from '@ldc-tools/volunteer-management';
```

## Available Modules

### 1. Role Management (`@ldc-tools/role-management`)
**Purpose**: Manages organizational roles with regional and project-specific scoping

**Key Features**:
- User and role assignment views
- Regional vs project-specific role distinction
- Role statistics and reporting
- Export capabilities

**API Endpoints**:
- `/api/v1/role-assignments` - CRUD operations
- `/api/v1/role-assignments/stats` - Statistics
- `/api/v1/role-assignments/health` - Health check

### 2. Trade Teams (`@ldc-tools/trade-teams`)
**Purpose**: Manages 8 trade teams and 40+ trade crews with organizational hierarchy

**Key Features**:
- Complete trade team structure (Electrical, Exteriors, Interiors, etc.)
- Crew drill-down functionality
- Status management (active/inactive/pending)
- Statistics dashboard

**API Endpoints**:
- `/api/v1/trade-teams` - List all teams
- `/api/v1/trade-teams/{id}/crews` - Get team crews
- `/api/v1/trade-teams/stats` - Statistics

### 3. Volunteer Management (`@ldc-tools/volunteer-management`)
**Purpose**: Comprehensive volunteer coordination with skills tracking and assignments

**Key Features**:
- CRUD operations for volunteer records
- Skills and availability tracking
- Congregation-based organization
- Assignment history and export functionality

**API Endpoints**:
- `/api/v1/volunteers` - CRUD operations
- `/api/v1/volunteers/stats` - Statistics
- `/api/v1/volunteers/{id}/assignments` - Assignment tracking

## Development Workflow

### Creating New Features
```bash
# Use the SDD helper to create a new feature module
./bin/new-feature feature-name

# Generate implementation plan
./bin/generate-plan feature-name

# Generate OpenAPI contract
./bin/generate-contract feature-name
```

### Module Development Process
1. **Specification**: Define requirements in `specs/feature.md`
2. **Contract**: Create OpenAPI specification in `contracts/openapi.yaml`
3. **Implementation**: Build TypeScript modules in `src/`
4. **Testing**: Add comprehensive tests in `tests/`
5. **Integration**: Import and use in main application

## CI/CD Pipeline

### SDD Foundation Workflows
The project uses SDD Foundation workflows for:
- **Spec Check**: Validates feature specifications
- **Contracts**: Validates OpenAPI contracts
- **Tests**: Runs comprehensive test suites
- **Security**: Security scanning and validation
- **QOS**: Performance and quality monitoring
- **OPA**: Policy validation
- **Contracts Conformance**: API contract compliance

### Quality Gates
- >90% test coverage required
- OpenAPI contract validation
- Performance budgets (P95 < 200ms)
- Security scanning passes
- Specification compliance

## Integration Guide

### Frontend Integration
```typescript
// Example: Using Trade Teams module in React
import { TradeTeamsDashboard } from '@ldc-tools/trade-teams';

function App() {
  return (
    <TradeTeamsDashboard 
      apiBaseUrl="http://localhost:8000"
      className="p-4"
    />
  );
}
```

### Backend Integration
```typescript
// Example: Using Volunteer Management API
import { VolunteerManagementService } from '@ldc-tools/volunteer-management';

const volunteerService = new VolunteerManagementService({
  apiBaseUrl: 'http://localhost:8000',
  version: '1.0.0'
});

await volunteerService.initialize();
const volunteers = await volunteerService.getAllVolunteers();
```

## Configuration

### TypeScript Configuration
The root `tsconfig.json` includes path mapping for all modules:
```json
{
  "compilerOptions": {
    "paths": {
      "@ldc-tools/role-management": ["./lib/role-management/src"],
      "@ldc-tools/trade-teams": ["./lib/trade-teams/src"],
      "@ldc-tools/volunteer-management": ["./lib/volunteer-management/src"]
    }
  }
}
```

### Module Configuration
Each module accepts a configuration object:
```typescript
interface ModuleConfig {
  apiBaseUrl: string;
  version: string;
}
```

## Testing Strategy

### Module-Level Testing
- **Unit Tests**: Individual function and class testing
- **Integration Tests**: Database and API integration
- **Component Tests**: React component testing
- **Contract Tests**: OpenAPI specification validation

### System-Level Testing
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability scanning
- **Compatibility Tests**: Cross-browser and device testing

## Deployment

### Module Deployment
Modules are deployed as part of the main application but can be:
- Independently versioned
- Selectively enabled/disabled
- Updated without affecting other modules

### Environment Configuration
- **Development**: Local development with hot reload
- **Staging**: Full integration testing environment
- **Production**: Optimized build with monitoring

## Monitoring & Observability

### Health Checks
Each module provides health check endpoints:
- `/api/v1/{module}/health`
- System-wide health at `/api/v1/health`

### Metrics Collection
- Performance metrics (response times, throughput)
- Error rates and types
- User activity and feature usage
- Resource utilization

### Alerting
- Service availability monitoring
- Performance degradation alerts
- Error rate thresholds
- Security incident detection

## Best Practices

### Module Development
1. **Single Responsibility**: Each module handles one domain
2. **API-First**: Design contracts before implementation
3. **Test-Driven**: Write tests alongside code
4. **Documentation**: Maintain specs and API docs
5. **Versioning**: Use semantic versioning for modules

### Integration Patterns
1. **Loose Coupling**: Modules communicate via APIs
2. **Error Handling**: Graceful degradation when modules fail
3. **Configuration**: Environment-based configuration
4. **Monitoring**: Comprehensive observability

## Troubleshooting

### Common Issues
1. **Module Import Errors**: Check TypeScript path configuration
2. **API Connection Issues**: Verify base URL configuration
3. **Contract Validation Failures**: Ensure OpenAPI spec compliance
4. **Test Failures**: Check module dependencies and setup

### Debug Tools
- Health check endpoints for module status
- API documentation for endpoint testing
- TypeScript compiler for type checking
- Jest test runner for debugging tests

## Future Enhancements

### Planned Modules
- Project Management
- Reporting & Analytics
- Communication Tools
- Resource Planning

### Architecture Evolution
- Micro-frontend architecture
- Event-driven communication
- Advanced caching strategies
- Real-time updates with WebSockets
