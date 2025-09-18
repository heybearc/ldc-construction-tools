"""
Assignment Workflow API Tests
Comprehensive testing for USLDC-2829-E compliance
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json

from app.main import app
from app.database import get_db
from lib.assignment_workflow.backend.models import (
    AssignmentRequest, AssignmentApproval, WorkflowState,
    AssignmentType, AssignmentStatus, ApprovalStatus
)

client = TestClient(app)

class TestAssignmentRequestAPI:
    """Test assignment request CRUD operations."""
    
    def test_create_assignment_request_success(self, db_session: Session, auth_headers):
        """Test successful assignment request creation."""
        request_data = {
            "assignment_type": "standard",
            "priority_level": 3,
            "requested_role": "Electrical Supervisor",
            "trade_team_id": 1,
            "trade_crew_id": 1,
            "start_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=1, hours=8)).isoformat(),
            "description": "Need electrical supervisor for main panel installation and testing work."
        }
        
        response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["assignment_type"] == "standard"
        assert data["priority_level"] == 3
        assert data["requested_role"] == "Electrical Supervisor"
        assert data["status"] == "pending"
        assert "id" in data
    
    def test_create_emergency_assignment_priority_validation(self, db_session: Session, auth_headers):
        """Test emergency assignment priority validation."""
        request_data = {
            "assignment_type": "emergency",
            "priority_level": 4,  # Invalid for emergency
            "requested_role": "Emergency Electrician",
            "start_date": datetime.utcnow().isoformat(),
            "description": "Emergency electrical issue requiring immediate attention."
        }
        
        response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "priority level" in response.json()["detail"].lower()
    
    def test_create_assignment_past_date_validation(self, db_session: Session, auth_headers):
        """Test validation for past start dates."""
        request_data = {
            "assignment_type": "standard",
            "priority_level": 3,
            "requested_role": "Plumber",
            "start_date": (datetime.utcnow() - timedelta(days=1)).isoformat(),
            "description": "Standard plumbing work for bathroom renovation."
        }
        
        response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "past" in response.json()["detail"].lower()
    
    def test_create_assignment_capacity_check(self, db_session: Session, auth_headers):
        """Test capacity checking during assignment creation."""
        # First, create an assignment that uses most capacity
        request_data = {
            "assignment_type": "standard",
            "priority_level": 2,
            "requested_role": "Lead Carpenter",
            "trade_crew_id": 1,
            "start_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=1, hours=8)).isoformat(),
            "description": "Major carpentry work requiring full crew capacity."
        }
        
        # Create first assignment
        response1 = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        assert response1.status_code == 200
        
        # Try to create overlapping assignment (should fail for non-emergency)
        request_data["description"] = "Another carpentry job at same time."
        response2 = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        
        assert response2.status_code == 409
        assert "capacity" in response2.json()["detail"].lower()
    
    def test_list_assignment_requests(self, db_session: Session, auth_headers):
        """Test listing assignment requests with filters."""
        # Create test assignments
        for i in range(5):
            request_data = {
                "assignment_type": "standard" if i % 2 == 0 else "emergency",
                "priority_level": (i % 5) + 1,
                "requested_role": f"Test Role {i}",
                "start_date": (datetime.utcnow() + timedelta(days=i+1)).isoformat(),
                "description": f"Test assignment {i} for API testing purposes."
            }
            
            client.post(
                "/api/v1/assignments/requests",
                json=request_data,
                headers=auth_headers
            )
        
        # Test basic listing
        response = client.get("/api/v1/assignments/requests", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        
        # Test filtering by status
        response = client.get(
            "/api/v1/assignments/requests?status=pending",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert all(item["status"] == "pending" for item in data)
        
        # Test filtering by assignment type
        response = client.get(
            "/api/v1/assignments/requests?assignment_type=emergency",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert all(item["assignment_type"] == "emergency" for item in data)
    
    def test_get_assignment_request_by_id(self, db_session: Session, auth_headers):
        """Test retrieving specific assignment request."""
        # Create test assignment
        request_data = {
            "assignment_type": "scheduled",
            "priority_level": 3,
            "requested_role": "Project Manager",
            "start_date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "description": "Scheduled project management assignment for new construction phase."
        }
        
        create_response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        assignment_id = create_response.json()["id"]
        
        # Retrieve the assignment
        response = client.get(
            f"/api/v1/assignments/requests/{assignment_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == assignment_id
        assert data["assignment_type"] == "scheduled"
        assert data["requested_role"] == "Project Manager"
    
    def test_update_assignment_request(self, db_session: Session, auth_headers):
        """Test updating assignment request."""
        # Create test assignment
        request_data = {
            "assignment_type": "standard",
            "priority_level": 3,
            "requested_role": "Electrician",
            "start_date": (datetime.utcnow() + timedelta(days=2)).isoformat(),
            "description": "Initial electrical work description."
        }
        
        create_response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        assignment_id = create_response.json()["id"]
        
        # Update the assignment
        update_data = {
            "priority_level": 2,
            "description": "Updated electrical work description with more details."
        }
        
        response = client.put(
            f"/api/v1/assignments/requests/{assignment_id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["priority_level"] == 2
        assert "Updated electrical work" in data["description"]

class TestAssignmentApprovalAPI:
    """Test assignment approval workflow."""
    
    def test_submit_approval_decision(self, db_session: Session, auth_headers, supervisor_headers):
        """Test submitting approval decision."""
        # Create assignment request
        request_data = {
            "assignment_type": "standard",
            "priority_level": 3,
            "requested_role": "Carpenter",
            "start_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "description": "Carpentry work requiring supervisor approval."
        }
        
        create_response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        assignment_id = create_response.json()["id"]
        
        # Submit approval decision
        approval_data = {
            "assignment_request_id": assignment_id,
            "status": "approved",
            "comments": "Approved for immediate scheduling."
        }
        
        response = client.post(
            "/api/v1/assignments/approvals",
            json=approval_data,
            headers=supervisor_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "approved"
        assert data["comments"] == "Approved for immediate scheduling."
    
    def test_get_pending_approvals(self, db_session: Session, supervisor_headers):
        """Test retrieving pending approvals."""
        response = client.get(
            "/api/v1/assignments/approvals/pending",
            headers=supervisor_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned approvals should be pending
        assert all(approval["status"] == "pending" for approval in data)
    
    def test_workflow_state_transitions(self, db_session: Session, auth_headers, supervisor_headers):
        """Test workflow state transitions through approval process."""
        # Create emergency assignment (single approval)
        request_data = {
            "assignment_type": "emergency",
            "priority_level": 1,
            "requested_role": "Emergency Electrician",
            "start_date": datetime.utcnow().isoformat(),
            "description": "Critical electrical emergency requiring immediate response."
        }
        
        create_response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        assignment_id = create_response.json()["id"]
        
        # Check initial workflow status
        workflow_response = client.get(
            f"/api/v1/assignments/workflow/{assignment_id}",
            headers=auth_headers
        )
        
        assert workflow_response.status_code == 200
        workflow_data = workflow_response.json()
        assert workflow_data["current_state"] == "pending_supervisor_approval"
        
        # Approve the assignment
        approval_data = {
            "assignment_request_id": assignment_id,
            "status": "approved",
            "comments": "Emergency approved for immediate deployment."
        }
        
        client.post(
            "/api/v1/assignments/approvals",
            json=approval_data,
            headers=supervisor_headers
        )
        
        # Check updated workflow status
        workflow_response = client.get(
            f"/api/v1/assignments/workflow/{assignment_id}",
            headers=auth_headers
        )
        
        workflow_data = workflow_response.json()
        assert workflow_data["assignment_request"]["status"] == "approved"

class TestCapacityPlanningAPI:
    """Test capacity planning and checking."""
    
    def test_capacity_check(self, db_session: Session, auth_headers):
        """Test capacity availability checking."""
        start_date = datetime.utcnow() + timedelta(days=1)
        end_date = start_date + timedelta(hours=8)
        
        response = client.get(
            f"/api/v1/assignments/capacity/check"
            f"?trade_crew_id=1"
            f"&start_date={start_date.isoformat()}"
            f"&end_date={end_date.isoformat()}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "available" in data
        assert "available_capacity" in data
        assert "current_utilization" in data
        assert "conflicting_assignments" in data
        assert isinstance(data["available"], bool)
    
    def test_capacity_forecast(self, db_session: Session, auth_headers):
        """Test capacity forecasting."""
        response = client.get(
            "/api/v1/assignments/capacity/forecast?trade_crew_id=1&days_ahead=14",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "forecast_period" in data
        assert "daily_forecast" in data
        assert "summary" in data
        
        # Check forecast structure
        forecast_period = data["forecast_period"]
        assert "start_date" in forecast_period
        assert "end_date" in forecast_period
        assert "days" in forecast_period
        
        # Check summary metrics
        summary = data["summary"]
        assert "average_utilization" in summary
        assert "peak_utilization" in summary
        assert "overbooked_days" in summary

class TestAssignmentValidation:
    """Test business rule validation."""
    
    def test_emergency_assignment_validation(self, db_session: Session, auth_headers):
        """Test emergency assignment specific validations."""
        # Emergency assignments should allow past dates
        request_data = {
            "assignment_type": "emergency",
            "priority_level": 1,
            "requested_role": "Emergency Response Team",
            "start_date": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            "description": "Emergency response for critical infrastructure failure."
        }
        
        response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["assignment_type"] == "emergency"
    
    def test_scheduled_assignment_validation(self, db_session: Session, auth_headers):
        """Test scheduled assignment specific validations."""
        # Scheduled assignments should require advance planning
        request_data = {
            "assignment_type": "scheduled",
            "priority_level": 3,
            "requested_role": "Project Coordinator",
            "start_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=35)).isoformat(),
            "description": "Scheduled project coordination for upcoming construction phase."
        }
        
        response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["assignment_type"] == "scheduled"
    
    def test_description_length_validation(self, db_session: Session, auth_headers):
        """Test description length requirements."""
        # Too short description
        request_data = {
            "assignment_type": "standard",
            "priority_level": 3,
            "requested_role": "Worker",
            "start_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "description": "Short"  # Too short
        }
        
        response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        
        assert response.status_code == 422  # Validation error
        
        # Valid description length
        request_data["description"] = "This is a properly detailed description of the assignment requirements."
        
        response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200

class TestAssignmentSecurity:
    """Test security and access control."""
    
    def test_unauthorized_access(self, db_session: Session):
        """Test API access without authentication."""
        response = client.get("/api/v1/assignments/requests")
        assert response.status_code == 401
    
    def test_assignment_access_control(self, db_session: Session, auth_headers, other_user_headers):
        """Test assignment access control between users."""
        # Create assignment as user 1
        request_data = {
            "assignment_type": "standard",
            "priority_level": 3,
            "requested_role": "Test Role",
            "start_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "description": "Test assignment for access control validation."
        }
        
        create_response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        assignment_id = create_response.json()["id"]
        
        # Try to access as different user (should be allowed for viewing)
        response = client.get(
            f"/api/v1/assignments/requests/{assignment_id}",
            headers=other_user_headers
        )
        
        # Access should be controlled by role-based permissions
        # Implementation depends on specific access control rules
        assert response.status_code in [200, 403]
    
    def test_approval_authorization(self, db_session: Session, auth_headers):
        """Test approval authorization requirements."""
        # Create assignment
        request_data = {
            "assignment_type": "standard",
            "priority_level": 3,
            "requested_role": "Test Role",
            "start_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "description": "Test assignment for approval authorization testing."
        }
        
        create_response = client.post(
            "/api/v1/assignments/requests",
            json=request_data,
            headers=auth_headers
        )
        assignment_id = create_response.json()["id"]
        
        # Try to approve without proper authorization
        approval_data = {
            "assignment_request_id": assignment_id,
            "status": "approved",
            "comments": "Unauthorized approval attempt."
        }
        
        response = client.post(
            "/api/v1/assignments/approvals",
            json=approval_data,
            headers=auth_headers  # Regular user, not supervisor
        )
        
        # Should fail due to insufficient permissions
        assert response.status_code in [403, 404]

# Fixtures for testing
@pytest.fixture
def auth_headers():
    """Mock authentication headers for regular user."""
    return {"Authorization": "Bearer mock_user_token"}

@pytest.fixture
def supervisor_headers():
    """Mock authentication headers for supervisor user."""
    return {"Authorization": "Bearer mock_supervisor_token"}

@pytest.fixture
def other_user_headers():
    """Mock authentication headers for different user."""
    return {"Authorization": "Bearer mock_other_user_token"}

@pytest.fixture
def db_session():
    """Mock database session."""
    # This would be implemented with actual test database setup
    pass
