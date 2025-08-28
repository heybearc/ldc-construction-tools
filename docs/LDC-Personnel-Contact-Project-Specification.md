# LDC Personnel Contact Tools - Project Specification

**Project**: LDC Construction Tools for Personnel Contact Support  
**Region**: LDC Region 01.12  
**Construction Group**: Construction Group 01.12  
**Document Version**: 1.0  
**Date**: 2025-08-26

## Executive Summary

This specification defines the requirements for a comprehensive digital tool suite to support Personnel Contacts in LDC Region 01.12 for Construction Group 01.12. The system will streamline volunteer coordination, project management, and communication workflows for Kingdom Hall and other theocratic construction projects.

## Core System Features

### 1. Visual Organizational Dashboard with Role Management
- **Grid-Based Trade Team Layout**: Visual grid display showing each trade team as a distinct section, mirroring the organizational chart structure used in Construction Group 01.12
- **Interactive Role Editing**: Click-to-edit functionality for all positions - Trade Team Overseers, Assistant Overseers, Trade Crew Overseers, and Support roles
- **Assignment Change Tracking**: Track role changes following USLDC-2829-E requirements:
  - **Consultation Status**: Track when consultations with oversight have been completed before discussing with volunteers
  - **Assignment Categories**: Document which positions are branch-appointed vs field-assigned (for reference only - actual approvals done manually by Construction Group Overseer)
  - **Impact Assessment**: Visual indicators showing which other roles/people are affected by changes
- **Role Status Management**: 
  - Mark positions as "Remove Trade Team Role", "Adjustment Needed", or "No Adjustment Needed"
  - Track vacant positions and recruitment needs
  - Monitor role transition timelines
- **Change History**: Complete audit trail of all role changes with dates, reasons, and status tracking
- **Printable Org Chart Generator**: Generate updated organizational charts reflecting current and planned changes

### 2. Crew-Level Assignment Tracking System
- **Trade Crew Role Tracker**: Track crew-specific role adjustments including Trade Crew Overseers, Assistant Overseers, and Trade Crew Support positions
- **Crew Assignment Status**: Track crew-level assignment changes and consultation status (actual approvals handled manually by Construction Group Overseer)
- **Specialization Management**: Document crew assignments within specific trade specializations (e.g., electrical rough-in, plumbing finish, structural framing)
- **Crew Composition Planning**: Plan and document optimal crew makeup with proper oversight ratios and skill distribution
- **Cross-Crew Coordination**: Identify and document dependencies and coordination needs between related trade crews
- **Crew Performance Documentation**: Document crew effectiveness and identify training or adjustment needs

### 3. Communication Hub
- **Multi-Channel Messaging**: Email, SMS, and in-app notifications for different communication needs
- **Automated Notifications**: Assignment confirmations, schedule changes, safety reminders, and project updates
- **Group Communication Tools**: Broadcast messaging to specific trade teams, project groups, or skill categories
- **Document Sharing**: Secure sharing of project documents, safety materials, and training resources
- **Emergency Communication**: Rapid notification system for urgent project needs or safety issues
- **Elder Coordination**: Facilitate communication with elders for spiritual oversight requirements

### 4. Project Documentation & Compliance
- **Digital Forms Management**: Electronic versions of all LDC forms with automated routing and approval
- **Safety Training Verification**: Track and verify required safety training for all project volunteers
- **Required Trade Crew Overseers (formerly PTO's)**: 
- **Oversight Assessment Tracking**: Manage annual assessments and additional responsibility evaluations
- **Regulatory Compliance**: Ensure all volunteers meet project-specific regulatory and licensing requirements
- **Audit Trail**: Complete documentation of all assignment changes, communications, and approvals
- **Spiritual Oversight Documentation**: Track completion of USLDC-3993-E outline reviews for applicable volunteers

### 5. Reporting & Analytics Dashboard
- **Personnel Analytics**: Volunteer utilization rates, skill gap analysis, and workforce planning metrics
- **Project Reporting**: Assignment fulfillment rates, timeline adherence, and resource allocation efficiency
- **Compliance Monitoring**: Safety training compliance, assessment completion rates, and regulatory adherence
- **Performance Metrics**: Individual and team performance tracking with growth opportunity identification
- **Executive Summaries**: High-level reports for Construction Group leadership and regional oversight
- **Spiritual Oversight Reports**: Track volunteers requiring elder review and completion status per USLDC-3993-E
- **Estimator**: Cost estimating, material quantity take-offs, budgetary estimates for all project phases
- **Regulatory Consultant**: Regulatory research, permit coordination, AHJ compliance, inspection scheduling
- **Safety Coordinator**: Project-specific safety coordination (when assigned to Construction Group projects)
- **Scheduler**: Project schedule creation and maintenance using JW Hub Project Tasks
- **Personnel Contact**: Staffing coordination, volunteer identification, assignment management (your role)
- **Personnel Contact Support**: Assists Personnel Contact with staffing coordination tasks
- **Volunteers**: Categorized as Expert/Skilled (45%), Semi-skilled (35%), Helper/Unskilled/Local Congregation (20%)

## System Requirements

### Standalone Tool Strategy
This system is designed as **standalone tools** that complement existing JW systems without requiring programmatic access:

- **No API Integration**: No programmatic access to ba.jw.org or hub.jw.org
- **Complementary Workflow Tools**: Independent tools that make Personnel Contact tasks easier
- **Manual Data Entry**: Users input relevant information as needed from existing JW systems
- **Focus on PC Pain Points**: Address specific challenges that existing systems don't solve
- **Export/Import Capabilities**: Allow data exchange through standard formats (CSV, Excel) when beneficial

### Core Functional Requirements

#### 1. Trade Team & Crew Management (8 Standard Trade Teams)
- **Trade Team Structure Management**
  - **Interiors**: Carpet, doors, drywall, finish carpentry, interior specialties, paint, suspended ceiling, tile, toilet partitions
  - **Exteriors**: Exterior specialties, roofing, scaffolding, siding, windows (optional: masonry)
  - **Mechanical**: HVAC commissioning, HVAC finish, HVAC rough-in (optional: elevator)
  - **Electrical**: Audio & video, electrical commissioning, electrical finish, electrical low-voltage, electrical rough-in, electrical utilities
  - **Plumbing**: Plumbing finish, plumbing rough-in, plumbing utilities (optional: fire sprinkler)
  - **Structural**: Demolition, framing, insulation, remediation (optional: rigging)
  - **Sitework**: Earthwork, landscaping, tree clearing (optional: asphalt coating, asphalt pavement, concrete, fence, pavement striping, septic)
  - **Site Support**: Equipment & vehicle maintenance, project support, trucking

- **Builder Assistant Group Management**
  - Consistent naming convention: "TRADE TEAM NAME – TRADE NAME" (e.g., "INTERIORS – PAINTING")
  - Role assignments: Overseer, Assistant, Skilled, Helper
  - Volunteer ratio tracking: 45% Expert/Skilled, 35% Semi-skilled, 20% Helper/Unskilled/Local Congregation
  - Integration with Construction Group Builder Assistant project (e.g., "LDC CG 01.12 - Construction Group")

#### 2. Oversight Assessment Management
- **Annual Assessment Tracking**
  - Automated reminders for annual oversight assessments at service year beginning
  - Dashboard showing completion status for all trade team overseers and assistants
  - Dashboard showing completion status for all trade crew overseers and assistants
  - Integration with Builder Assistant "Oversight Assessment" roles

- **Assessment Review Tools**
  - 12-month assessment history review interface
  - Qualification tracking for additional responsibility opportunities
  - Disqualification alerts and follow-up workflows
  - Recommendation generation for leadership advancement

#### 3. JW Hub Project Task Integration
- **Personnel Planning Workflow**
  - Integration with JW Hub project tasks for personnel planning
  - Template-based task creation using "Task Templates (PMC) (Action Plan 16983)"
  - Primary Construction summary task with trade crew subtasks
  - Task naming convention: "Trade Team | Trade Crew" format

- **Workforce & Skills Tracking**
  - Primary Skill selection for majority of assigned volunteers
  - Estimated Volunteers count for skilled and support volunteers
  - Additional Skills selection for comprehensive crew composition
  - Task duration tracking with start/end dates for crew work schedules

#### 4. Project Roster & Event Management (BA Integration)
- **Event Creation Tools**
  - Streamlined event creation workflow in Builder Assistant
  - Automated project roster population with assigned volunteers
  - Trade crew scheduling and assignment verification
  - Real-time roster status and completion tracking

- **Trade Team Ratio Management**
  - Automated ratio calculations for project events (45/35/20 ratio enforcement)
  - Alerts for inadequate staffing levels
  - Recommendation engine for optimal crew composition
  - Historical ratio analysis and optimization

#### 5. Safety Training & Compliance Verification
- **Safety Training Dashboard**
  - Real-time verification of volunteer safety training status
  - Integration with training records and certification systems
  - Automated alerts for expired or missing training
  - Project-specific safety requirement tracking

- **Youth Volunteer Management**
  - Special tracking and encouragement tools for younger volunteers
  - Age-appropriate assignment recommendations
  - Mentorship pairing and progress tracking
  - Youth engagement metrics and reporting

#### 6. Housing & Logistics Coordination
- **Housing Eligibility Verification**
  - Automated eligibility checking for volunteers requiring housing
  - Integration with housing contact coordination systems
  - Room availability tracking and assignment management
  - Housing request workflow and approval process

- **Personnel Contact Support Management**
  - Request workflow for additional personnel contact support through Personnel Desk
  - Task delegation and assignment tracking for support personnel
  - Training coordination for personnel contact support roles
  - Performance tracking and development planning

#### 7. Assignment Management & Adjustment Workflow (Per USLDC-2829-E)
- **Assignment Category Tracking**
  - **Branch-Appointed**: Assembly Hall overseers, design contacts, maintenance trainers, local staffing contacts, Trade Team overseers
    - Continuous basis with appointment/assignment letter from branch office
    - Branch approval required for all assignment changes
    - Coordination through LDC Support for adjustments
  - **Field Assigned (Continuous)**: Safety coordinators, regulatory consultants, drafters, Assembly Hall department overseers, Trade Crew overseers
    - Ongoing basis with zone/large facility/project oversight notification
    - Field oversight approval for assignment changes
    - No branch consultation required for adjustments
  - **Field Assigned (Temporary)**: Trade Crew members, short-term project workers
    - Limited duration assignments via Builder Assistant
    - No formal assignment change process required

- **Assignment Change Request Workflow**
  - Pre-consultation requirement with oversight before discussing with volunteer
  - Multi-level approval process based on assignment category
  - Impact assessment on other overseers and affected parties
  - Written confirmation via email after verbal notification
  - LDC Tech Support request submission for field-assigned changes
  - Multiple assignment tracking and workload management

#### 4. Documentation & Compliance
- **Form Management**
  - Digital versions of LDC forms (USLDC-2230-E, etc.)
  - Electronic signature capabilities
  - Automatic form routing and approval workflows
  - Document version control and archiving

- **Compliance Tracking**
  - Background check expiration monitoring
  - Training requirement tracking
  - Safety certification management
  - Insurance and liability documentation

#### 5. Reporting & Analytics
- **Volunteer Reports**
  - Participation statistics and trends
  - Skills gap analysis
  - Volunteer retention metrics
  - Performance and reliability tracking

- **Project Reports**
  - Staffing efficiency and coverage
  - Timeline adherence and delays
  - Resource utilization analysis
  - Cost tracking and budget management

### Technical Requirements

#### Architecture
- **Backend**: FastAPI with PostgreSQL database
- **Frontend**: Next.js with responsive design for mobile and desktop
- **Authentication**: Role-based access control (RBAC)
- **Integration**: Email/SMS services, document management, calendar systems

#### Security & Privacy
- **Data Protection**: Encryption at rest and in transit
- **Access Control**: Multi-level permissions based on organizational roles
- **Audit Logging**: Complete activity tracking for accountability
- **Backup & Recovery**: Automated backups with disaster recovery procedures

#### Performance
- **Scalability**: Support for 500+ active volunteers and multiple concurrent projects
- **Availability**: 99.5% uptime with maintenance windows
- **Response Time**: Sub-2 second page loads for optimal user experience

## User Roles & Permissions (Per USLDC-2274-E)

### Personnel Contact (Primary User - Your Role)
- **Full Access**: All volunteer and project management features
- **Permissions**: Create/edit assignments, manage communications, generate reports, coordinate with all Construction Group roles
- **Responsibilities**: Primary system administration, volunteer coordination, assignment management per USLDC-2275-E
- **Spiritual Oversight**: Coordinate with elders to ensure USLDC-3993-E "Reminders on Keeping Spirituality to the Fore" outline is reviewed with volunteers having recurring weekly assignments within first month

### Construction Group Overseer (CGO)
- **Strategic Leadership**: Overall Construction Group oversight, project delivery management
- **Permissions**: View all projects, approve major assignments, access executive reports, personnel evaluations
- **Responsibilities**: Monitor well-being of oversight, deliver projects within scope, manage schedules, cost control, safety/quality implementation

### Construction Group Assistant Overseer (CGAO)
- **Phase 6 Coordination**: Preconstruction and on-site construction activities
- **Permissions**: Coordinate Construction Group activities, delegate to PCC and trade crews, quality assurance planning
- **Responsibilities**: Detailed daily construction scheduling, safety plan development, quality control coordination

### Project Construction Coordinator (PCC)
- **On-Site Coordination**: Primary on-site point-of-contact for trade crews
- **Permissions**: Coordinate on-site activities, maintain daily schedules, check-in/out volunteers
- **Responsibilities**: Daily on-site management, trade crew coordination, safety implementation

### Trade Team Overseers and Assistants
- **Administrative Trade Management**: Project-specific preparations for trade crews
- **Permissions**: Develop Work Assignment Sheets, perform oversight assessments, coordinate with trade crews
- **Responsibilities**: Administrative support, quality control preparation, safety planning, volunteer training coordination

### Trade Crew Overseers and Assistants
- **On-Site Trade Leadership**: Direct trade crew management and work coordination
- **Permissions**: Coordinate volunteers, update progress, conduct safety huddles, quality inspections
- **Responsibilities**: On-site trade coordination, volunteer training, safety implementation, quality control

### Construction Group Support
- **Administrative Support**: Administrative and logistical assistance
- **Permissions**: Check-in/out volunteers, maintain project documentation, process forms
- **Responsibilities**: Meeting coordination, documentation preparation, administrative tasks

### Estimator, Regulatory Consultant, Safety Coordinator, Scheduler
- **Specialized Support Roles**: Domain-specific expertise and coordination
- **Permissions**: Role-specific access to relevant project data and coordination tools
- **Responsibilities**: Specialized support per individual job descriptions

### Volunteers
- **Self-Service Portal**: View assignments, update availability, access project information
- **Permissions**: Update personal information, confirm assignments, view schedules
- **Responsibilities**: Maintain current information and respond to assignments

## Data Models

### Volunteer Profile
```
- Personal Information (name, contact, emergency contacts)
- Skills & Certifications (trade skills, proficiency levels, certifications)
- Availability (schedule preferences, blackout dates, travel distance)
- Participation History (projects, hours, performance ratings)
- Compliance Status (background checks, training, insurance)
```

### Project Structure
```
- Project Details (name, location, timeline, phases)
- Staffing Requirements (roles needed, skill levels, quantities)
- Schedule (daily/weekly needs, critical dates, dependencies)
- Progress Tracking (milestones, completion status, issues)
- Resource Allocation (materials, equipment, logistics)
```

### Assignment Management
```
- Assignment Details (volunteer, project, role, dates/times)
- Status Tracking (confirmed, pending, completed, cancelled)
- Communication Log (notifications sent, responses received)
- Performance Notes (attendance, quality, feedback)
```

## Integration Requirements

### JW Organization Systems
- **Builder Assistant (ba.jw.org)**: Primary LDC project management and volunteer coordination system
  - Data synchronization for volunteer profiles and assignments
  - Project timeline and milestone integration
  - Avoid duplication of existing BA functionality
  - Complement BA with Personnel Contact-specific tools

- **JW Hub (hub.jw.org)**: Organizational communication and resource platform
  - Single sign-on (SSO) integration for seamless user experience
  - Leverage existing volunteer directory and contact information
  - Integrate with Hub's communication channels and notifications
  - Respect Hub's data privacy and security protocols

### External Systems
- **Email Services**: SMTP integration for automated notifications
- **SMS Gateway**: Text messaging for urgent communications
- **Calendar Systems**: Integration with Outlook/Google Calendar
- **Document Storage**: Cloud storage for forms and documentation
- **Mapping Services**: Location and travel time calculations

## Compliance & Documentation

### LDC Policy Compliance
- **Assignment Management**: Follow USLDC-2829-E memo for assignment categories and change procedures
- **Construction Group Organization**: Adhere to USLDC-2230-E guidelines for trade team structure
- **Personnel Contact Responsibilities**: Implement all requirements from USLDC-2275-E job description
- **Spiritual Oversight Requirements**: Support USLDC-3993-E "Reminders on Keeping Spirituality to the Fore" process for all LDC volunteers with recurring weekly assignments
- **Builder Assistant Integration**: Maintain consistency with existing BA workflows and data structures
- **JW Hub Authentication**: Leverage existing authentication infrastructure

## Development Roadmap - Visual Organizational Dashboard

### Technical Architecture
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python 3.11+
- **Database**: PostgreSQL with encrypted storage
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Deployment**: Docker containers with HTTPS/SSL encryption
- **Security**: End-to-end encryption, audit logging, secure session management

### Phase 1: Foundation & Core Dashboard (Weeks 1-4)
**Effort**: 80-100 hours
- **Week 1-2**: Backend setup and database design
  - PostgreSQL schema for trade teams, crews, and personnel
  - FastAPI project structure with authentication
  - Basic CRUD operations for organizational data
- **Week 3-4**: Frontend foundation and grid layout
  - Next.js project setup with TypeScript
  - Grid-based trade team layout component
  - Basic role editing interface
  - Responsive design for desktop and tablet

### Phase 2: Role Management & Tracking (Weeks 5-8)
**Effort**: 60-80 hours
- **Week 5-6**: Assignment change tracking system
  - Role status management (Remove/Adjust/No Change)
  - Consultation status tracking
  - Assignment category documentation (branch/field)
- **Week 7-8**: Change history and audit trail
  - Complete change logging with timestamps
  - Impact assessment indicators
  - Role transition timeline tracking

### Phase 3: Security & Multi-User Access (Weeks 9-10)
**Effort**: 40-50 hours
- **Week 9**: Security implementation
  - User authentication and authorization
  - Data encryption at rest and in transit
  - Audit logging for all changes
- **Week 10**: Multi-user system
  - Role-based permissions (Personnel Contact, Construction Group Overseer, team members)
  - User management interface
  - Session security and timeout handling

### Phase 4: Reporting & Polish (Weeks 11-12)
**Effort**: 30-40 hours
- **Week 11**: Printable org chart generator
  - PDF generation with current structure
  - Export capabilities (CSV, Excel)
  - Meeting-ready formatted reports
- **Week 12**: Testing, deployment, and documentation
  - Comprehensive testing and bug fixes
  - Production deployment setup
  - User documentation and training materials

### Total Timeline: 12 weeks (3 months)
### Total Effort: 210-270 hours

### Security Features
- **Data Encryption**: AES-256 encryption for personal information
- **Access Control**: Role-based permissions with audit trails
- **Authentication**: Secure login with session management
- **HTTPS/SSL**: All communications encrypted in transit
- **Backup & Recovery**: Automated encrypted backups
- **Compliance**: GDPR-compliant data handling practices

### User Access Levels
- **Personnel Contact (Admin)**: Full access to all features and data management
- **Construction Group Overseer**: View all data, approve role changes, generate reports
- **Team Members**: View relevant team/crew information, limited editing permissions

## Success Metrics

### Operational Efficiency
- **Assignment Fill Rate**: >95% of assignments filled within 48 hours
- **Volunteer Utilization**: Optimal matching of skills to project needs
- **Communication Response**: >90% response rate to assignment notifications
- **Project Timeline Adherence**: <5% variance from planned schedules

### User Satisfaction
- **Personnel Contact Efficiency**: 50% reduction in administrative time
- **Volunteer Experience**: High satisfaction scores for assignment process
- **Construction Group Satisfaction**: Improved coordination and communication
- **System Adoption**: >90% active user engagement within 6 months

### Quality Metrics
- **Data Accuracy**: >99% accuracy in volunteer information and assignments
- **System Reliability**: <1% error rate in notifications and scheduling
- **Compliance**: 100% compliance with LDC documentation requirements
- **Security**: Zero security incidents or data breaches

## Risk Management

### Technical Risks
- **Data Loss**: Mitigated by automated backups and disaster recovery
- **System Downtime**: Addressed through redundancy and monitoring
- **Security Breaches**: Prevented through encryption and access controls
- **Integration Failures**: Managed through thorough testing and fallback procedures

### Operational Risks
- **User Adoption**: Addressed through training and change management
- **Data Quality**: Managed through validation and regular audits
- **Workflow Disruption**: Minimized through phased implementation
- **Compliance Issues**: Prevented through built-in compliance tracking

## Conclusion

This specification provides a comprehensive framework for developing digital tools to support Personnel Contacts in LDC Region 01.12. The system will significantly improve volunteer coordination efficiency, enhance communication workflows, and provide valuable insights for Construction Group 01.12 operations.

The phased implementation approach ensures manageable development cycles while delivering immediate value to Personnel Contacts and the broader construction organization. Success will be measured through operational efficiency gains, user satisfaction improvements, and enhanced project delivery capabilities.

---

**Document Control**
- **Author**: Cory Allen, Personnel Contact, LDC Region 01.12
- **Review**: Construction Group 01.12 Leadership
- **Approval**: Regional LDC Office
- **Next Review**: 2025-11-26
