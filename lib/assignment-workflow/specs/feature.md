# Assignment Workflow Module Feature Specification

## Overview
The Assignment Workflow module provides USLDC-2829-E compliant assignment processing for the LDC Construction Tools system. This module manages assignment requests, approval workflows, and capacity planning integration.

## Development Environment Policy
**MANDATORY: All development, testing, and debugging MUST be performed on the staging environment only.**

- **Staging URL**: https://ldc-staging.cloudigan.net
- **Local Development**: PROHIBITED - causes SQLAlchemy compatibility issues, database schema mismatches, and deployment inconsistencies
- **Testing Protocol**: All API testing, UI validation, and integration testing must use staging environment
- **Deployment Workflow**: Direct staging deployment using WMACS Guardian for immediate testing

## Core Features

### 1. Assignment Request Processing
- **Request Creation**: Structured assignment request forms
- **Validation Engine**: Role-based validation and capacity checks
- **Priority Handling**: Emergency, standard, and scheduled assignments
- **Status Tracking**: Real-time status updates throughout workflow

### 2. Approval Workflow Engine
- **Multi-level Approval**: Branch-appointed, Field-assigned continuous, Field-assigned temporary
- **Automated Routing**: Intelligent routing based on assignment type and scope
- **Escalation Logic**: Automatic escalation for overdue approvals
- **Audit Trail**: Complete history of all workflow actions

### 3. Capacity Planning Integration
- **Resource Availability**: Real-time capacity checking
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Load Balancing**: Optimal distribution of assignments across crews
- **Forecasting**: Predictive capacity planning for future assignments

## Database Schema

### assignment_requests
- `id` (Primary Key)
- `requester_id` (Foreign Key to app_users)
- `assignment_type` (ENUM: emergency, standard, scheduled)
- `priority_level` (INTEGER: 1-5)
- `requested_role` (VARCHAR)
- `project_id` (Foreign Key to projects)
- `trade_team_id` (Foreign Key to trade_teams)
- `trade_crew_id` (Foreign Key to trade_crews)
- `start_date` (TIMESTAMP)
- `end_date` (TIMESTAMP)
- `description` (TEXT)
- `requirements` (JSONB)
- `status` (ENUM: pending, approved, rejected, cancelled)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### assignment_approvals
- `id` (Primary Key)
- `assignment_request_id` (Foreign Key)
- `approver_id` (Foreign Key to app_users)
- `approval_level` (INTEGER)
- `status` (ENUM: pending, approved, rejected)
- `comments` (TEXT)
- `approved_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### workflow_states
- `id` (Primary Key)
- `assignment_request_id` (Foreign Key)
- `current_state` (VARCHAR)
- `next_state` (VARCHAR)
- `state_data` (JSONB)
- `created_at` (TIMESTAMP)

## API Endpoints

### Assignment Requests
- `POST /api/v1/assignments/requests` - Create new assignment request
- `GET /api/v1/assignments/requests` - List assignment requests
- `GET /api/v1/assignments/requests/{id}` - Get specific request
- `PUT /api/v1/assignments/requests/{id}` - Update request
- `DELETE /api/v1/assignments/requests/{id}` - Cancel request

### Approval Workflow
- `POST /api/v1/assignments/approvals` - Submit approval decision
- `GET /api/v1/assignments/approvals/pending` - Get pending approvals
- `GET /api/v1/assignments/workflow/{id}` - Get workflow status

### Capacity Planning
- `GET /api/v1/assignments/capacity/check` - Check capacity availability
- `GET /api/v1/assignments/capacity/forecast` - Get capacity forecast
- `POST /api/v1/assignments/capacity/reserve` - Reserve capacity

## Frontend Components

### AssignmentRequestForm
- Form for creating new assignment requests
- Dynamic field validation based on assignment type
- Integration with role management and trade teams

### AssignmentDashboard
- Overview of all assignment requests
- Status filtering and sorting
- Quick action buttons for approvals

### WorkflowTracker
- Visual representation of approval workflow
- Real-time status updates
- Audit trail display

### CapacityPlanner
- Interactive capacity planning interface
- Resource availability visualization
- Conflict detection alerts

## Business Logic

### Assignment Validation Rules
1. **Role Compatibility**: Requested role must match user qualifications
2. **Capacity Limits**: Cannot exceed crew capacity limits
3. **Time Conflicts**: No overlapping assignments for same resource
4. **Authority Levels**: Approval authority must match assignment scope

### Workflow Rules
1. **Emergency Assignments**: Expedited approval process (single level)
2. **Standard Assignments**: Two-level approval (supervisor + coordinator)
3. **Scheduled Assignments**: Three-level approval with advance planning

### Capacity Rules
1. **Crew Limits**: Maximum assignments per crew per time period
2. **Skill Requirements**: Match assignments to qualified personnel
3. **Geographic Constraints**: Consider travel time and location limits

## Integration Points

### Role Management Integration
- Validate assignment requests against user roles
- Check approval authority levels
- Enforce role-based access controls

### Trade Teams Integration
- Validate crew availability and capacity
- Check skill requirements and certifications
- Coordinate with trade team schedules

### Calendar Scheduling Integration
- Sync assignment schedules with calendar system
- Detect and resolve scheduling conflicts
- Update availability windows

## Quality Requirements

### Performance
- Assignment request processing: <30 seconds
- Capacity checking: <5 seconds
- Workflow status updates: Real-time

### Reliability
- 99.9% uptime for assignment processing
- Automatic failover for critical workflows
- Data consistency across all operations

### Security
- Role-based access to assignment data
- Audit logging for all workflow actions
- Encrypted storage of sensitive information

## Testing Requirements

### Unit Tests
- Assignment validation logic
- Workflow state transitions
- Capacity calculation algorithms

### Integration Tests
- End-to-end assignment workflow
- Cross-module data consistency
- API endpoint functionality

### User Acceptance Tests
- Assignment request creation flow
- Approval workflow usability
- Capacity planning accuracy

---

**Version**: 1.0.0  
**Author**: WMACS Guardian  
**Date**: 2025-09-17  
**Status**: Ready for Development
