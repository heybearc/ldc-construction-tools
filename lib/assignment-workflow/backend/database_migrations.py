"""
Assignment Workflow Database Migrations
USLDC-2829-E Compliant Schema Updates
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime

# Migration: Create Assignment Workflow Tables
def upgrade_assignment_workflow_tables():
    """Create all assignment workflow related tables."""
    
    # Create assignment_requests table
    op.create_table(
        'assignment_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('requester_id', sa.Integer(), nullable=False),
        sa.Column('assignment_type', sa.Enum('emergency', 'standard', 'scheduled', name='assignmenttype'), nullable=False),
        sa.Column('priority_level', sa.Integer(), nullable=False),
        sa.Column('requested_role', sa.String(length=100), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('trade_team_id', sa.Integer(), nullable=True),
        sa.Column('trade_crew_id', sa.Integer(), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('requirements', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', 'cancelled', 'in_progress', 'completed', name='assignmentstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['requester_id'], ['app_users.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['trade_team_id'], ['trade_teams.id'], ),
        sa.ForeignKeyConstraint(['trade_crew_id'], ['trade_crews.id'], )
    )
    
    # Create indexes for assignment_requests
    op.create_index('ix_assignment_requests_id', 'assignment_requests', ['id'])
    op.create_index('ix_assignment_requests_requester_id', 'assignment_requests', ['requester_id'])
    op.create_index('ix_assignment_requests_status', 'assignment_requests', ['status'])
    op.create_index('ix_assignment_requests_assignment_type', 'assignment_requests', ['assignment_type'])
    op.create_index('ix_assignment_requests_start_date', 'assignment_requests', ['start_date'])
    op.create_index('ix_assignment_requests_created_at', 'assignment_requests', ['created_at'])
    
    # Create assignment_approvals table
    op.create_table(
        'assignment_approvals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assignment_request_id', sa.Integer(), nullable=False),
        sa.Column('approver_id', sa.Integer(), nullable=False),
        sa.Column('approval_level', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', name='approvalstatus'), nullable=False),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['assignment_request_id'], ['assignment_requests.id'], ),
        sa.ForeignKeyConstraint(['approver_id'], ['app_users.id'], )
    )
    
    # Create indexes for assignment_approvals
    op.create_index('ix_assignment_approvals_assignment_request_id', 'assignment_approvals', ['assignment_request_id'])
    op.create_index('ix_assignment_approvals_approver_id', 'assignment_approvals', ['approver_id'])
    op.create_index('ix_assignment_approvals_status', 'assignment_approvals', ['status'])
    
    # Create workflow_states table
    op.create_table(
        'workflow_states',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assignment_request_id', sa.Integer(), nullable=False),
        sa.Column('current_state', sa.String(length=50), nullable=False),
        sa.Column('next_state', sa.String(length=50), nullable=True),
        sa.Column('state_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['assignment_request_id'], ['assignment_requests.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['app_users.id'], )
    )
    
    # Create indexes for workflow_states
    op.create_index('ix_workflow_states_assignment_request_id', 'workflow_states', ['assignment_request_id'])
    op.create_index('ix_workflow_states_current_state', 'workflow_states', ['current_state'])
    op.create_index('ix_workflow_states_created_at', 'workflow_states', ['created_at'])
    
    # Create capacity_allocations table
    op.create_table(
        'capacity_allocations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assignment_request_id', sa.Integer(), nullable=False),
        sa.Column('trade_crew_id', sa.Integer(), nullable=False),
        sa.Column('allocated_capacity', sa.Integer(), nullable=False),
        sa.Column('allocation_percentage', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=False),
        sa.Column('is_confirmed', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['assignment_request_id'], ['assignment_requests.id'], ),
        sa.ForeignKeyConstraint(['trade_crew_id'], ['trade_crews.id'], )
    )
    
    # Create indexes for capacity_allocations
    op.create_index('ix_capacity_allocations_trade_crew_id', 'capacity_allocations', ['trade_crew_id'])
    op.create_index('ix_capacity_allocations_start_date', 'capacity_allocations', ['start_date'])
    op.create_index('ix_capacity_allocations_end_date', 'capacity_allocations', ['end_date'])
    op.create_index('ix_capacity_allocations_is_confirmed', 'capacity_allocations', ['is_confirmed'])
    
    # Create assignment_history table
    op.create_table(
        'assignment_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assignment_request_id', sa.Integer(), nullable=False),
        sa.Column('field_name', sa.String(length=50), nullable=False),
        sa.Column('old_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=True),
        sa.Column('change_reason', sa.Text(), nullable=True),
        sa.Column('changed_by', sa.Integer(), nullable=False),
        sa.Column('changed_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['assignment_request_id'], ['assignment_requests.id'], ),
        sa.ForeignKeyConstraint(['changed_by'], ['app_users.id'], )
    )
    
    # Create indexes for assignment_history
    op.create_index('ix_assignment_history_assignment_request_id', 'assignment_history', ['assignment_request_id'])
    op.create_index('ix_assignment_history_changed_at', 'assignment_history', ['changed_at'])
    op.create_index('ix_assignment_history_changed_by', 'assignment_history', ['changed_by'])

def downgrade_assignment_workflow_tables():
    """Drop all assignment workflow related tables."""
    
    # Drop tables in reverse order to handle foreign key constraints
    op.drop_table('assignment_history')
    op.drop_table('capacity_allocations')
    op.drop_table('workflow_states')
    op.drop_table('assignment_approvals')
    op.drop_table('assignment_requests')
    
    # Drop custom enums
    op.execute('DROP TYPE IF EXISTS assignmenttype')
    op.execute('DROP TYPE IF EXISTS assignmentstatus')
    op.execute('DROP TYPE IF EXISTS approvalstatus')

# Migration: Add Assignment Workflow Constraints
def upgrade_assignment_workflow_constraints():
    """Add business rule constraints to assignment workflow tables."""
    
    # Add check constraints for assignment_requests
    op.create_check_constraint(
        'ck_assignment_requests_priority_level',
        'assignment_requests',
        'priority_level >= 1 AND priority_level <= 5'
    )
    
    op.create_check_constraint(
        'ck_assignment_requests_emergency_priority',
        'assignment_requests',
        "assignment_type != 'emergency' OR priority_level <= 2"
    )
    
    op.create_check_constraint(
        'ck_assignment_requests_date_order',
        'assignment_requests',
        'end_date IS NULL OR end_date > start_date'
    )
    
    # Add check constraints for capacity_allocations
    op.create_check_constraint(
        'ck_capacity_allocations_percentage',
        'capacity_allocations',
        'allocation_percentage >= 0 AND allocation_percentage <= 100'
    )
    
    op.create_check_constraint(
        'ck_capacity_allocations_capacity',
        'capacity_allocations',
        'allocated_capacity > 0'
    )
    
    op.create_check_constraint(
        'ck_capacity_allocations_date_order',
        'capacity_allocations',
        'end_date > start_date'
    )
    
    # Add check constraints for assignment_approvals
    op.create_check_constraint(
        'ck_assignment_approvals_level',
        'assignment_approvals',
        'approval_level >= 1 AND approval_level <= 3'
    )

def downgrade_assignment_workflow_constraints():
    """Remove business rule constraints from assignment workflow tables."""
    
    op.drop_constraint('ck_assignment_requests_priority_level', 'assignment_requests')
    op.drop_constraint('ck_assignment_requests_emergency_priority', 'assignment_requests')
    op.drop_constraint('ck_assignment_requests_date_order', 'assignment_requests')
    op.drop_constraint('ck_capacity_allocations_percentage', 'capacity_allocations')
    op.drop_constraint('ck_capacity_allocations_capacity', 'capacity_allocations')
    op.drop_constraint('ck_capacity_allocations_date_order', 'capacity_allocations')
    op.drop_constraint('ck_assignment_approvals_level', 'assignment_approvals')

# Migration: Add Assignment Workflow Triggers
def upgrade_assignment_workflow_triggers():
    """Add database triggers for assignment workflow automation."""
    
    # Trigger to update updated_at timestamp
    op.execute("""
        CREATE OR REPLACE FUNCTION update_assignment_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    op.execute("""
        CREATE TRIGGER trigger_assignment_requests_updated_at
        BEFORE UPDATE ON assignment_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_assignment_updated_at();
    """)
    
    op.execute("""
        CREATE TRIGGER trigger_capacity_allocations_updated_at
        BEFORE UPDATE ON capacity_allocations
        FOR EACH ROW
        EXECUTE FUNCTION update_assignment_updated_at();
    """)
    
    # Trigger to automatically create workflow state on assignment creation
    op.execute("""
        CREATE OR REPLACE FUNCTION create_initial_workflow_state()
        RETURNS TRIGGER AS $$
        DECLARE
            initial_state TEXT;
        BEGIN
            -- Determine initial state based on assignment type
            CASE NEW.assignment_type
                WHEN 'emergency' THEN initial_state := 'pending_supervisor_approval';
                WHEN 'standard' THEN initial_state := 'pending_supervisor_approval';
                WHEN 'scheduled' THEN initial_state := 'pending_supervisor_approval';
                ELSE initial_state := 'pending_supervisor_approval';
            END CASE;
            
            -- Insert initial workflow state
            INSERT INTO workflow_states (
                assignment_request_id,
                current_state,
                state_data,
                created_by
            ) VALUES (
                NEW.id,
                initial_state,
                json_build_object('created_by', NEW.requester_id),
                NEW.requester_id
            );
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    op.execute("""
        CREATE TRIGGER trigger_create_initial_workflow_state
        AFTER INSERT ON assignment_requests
        FOR EACH ROW
        EXECUTE FUNCTION create_initial_workflow_state();
    """)
    
    # Trigger to log assignment changes to history
    op.execute("""
        CREATE OR REPLACE FUNCTION log_assignment_changes()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Log status changes
            IF OLD.status != NEW.status THEN
                INSERT INTO assignment_history (
                    assignment_request_id,
                    field_name,
                    old_value,
                    new_value,
                    change_reason,
                    changed_by
                ) VALUES (
                    NEW.id,
                    'status',
                    OLD.status::text,
                    NEW.status::text,
                    'Status updated',
                    NEW.requester_id  -- This should be the actual user making the change
                );
            END IF;
            
            -- Log priority changes
            IF OLD.priority_level != NEW.priority_level THEN
                INSERT INTO assignment_history (
                    assignment_request_id,
                    field_name,
                    old_value,
                    new_value,
                    change_reason,
                    changed_by
                ) VALUES (
                    NEW.id,
                    'priority_level',
                    OLD.priority_level::text,
                    NEW.priority_level::text,
                    'Priority level updated',
                    NEW.requester_id
                );
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    op.execute("""
        CREATE TRIGGER trigger_log_assignment_changes
        AFTER UPDATE ON assignment_requests
        FOR EACH ROW
        EXECUTE FUNCTION log_assignment_changes();
    """)

def downgrade_assignment_workflow_triggers():
    """Remove database triggers for assignment workflow."""
    
    op.execute("DROP TRIGGER IF EXISTS trigger_assignment_requests_updated_at ON assignment_requests")
    op.execute("DROP TRIGGER IF EXISTS trigger_capacity_allocations_updated_at ON capacity_allocations")
    op.execute("DROP TRIGGER IF EXISTS trigger_create_initial_workflow_state ON assignment_requests")
    op.execute("DROP TRIGGER IF EXISTS trigger_log_assignment_changes ON assignment_requests")
    
    op.execute("DROP FUNCTION IF EXISTS update_assignment_updated_at()")
    op.execute("DROP FUNCTION IF EXISTS create_initial_workflow_state()")
    op.execute("DROP FUNCTION IF EXISTS log_assignment_changes()")

# Migration: Create Assignment Workflow Views
def upgrade_assignment_workflow_views():
    """Create database views for assignment workflow reporting."""
    
    # View for assignment summary with related data
    op.execute("""
        CREATE VIEW assignment_summary AS
        SELECT 
            ar.id,
            ar.assignment_type,
            ar.priority_level,
            ar.requested_role,
            ar.start_date,
            ar.end_date,
            ar.status,
            ar.created_at,
            u.first_name || ' ' || u.last_name as requester_name,
            u.email as requester_email,
            p.name as project_name,
            tt.name as trade_team_name,
            tc.name as trade_crew_name,
            tc.capacity as crew_capacity,
            COALESCE(ca.allocation_percentage, 0) as allocated_percentage
        FROM assignment_requests ar
        LEFT JOIN app_users u ON ar.requester_id = u.id
        LEFT JOIN projects p ON ar.project_id = p.id
        LEFT JOIN trade_teams tt ON ar.trade_team_id = tt.id
        LEFT JOIN trade_crews tc ON ar.trade_crew_id = tc.id
        LEFT JOIN capacity_allocations ca ON ar.id = ca.assignment_request_id AND ca.is_confirmed = true;
    """)
    
    # View for pending approvals with assignment details
    op.execute("""
        CREATE VIEW pending_approvals_summary AS
        SELECT 
            aa.id as approval_id,
            aa.assignment_request_id,
            aa.approver_id,
            aa.approval_level,
            aa.created_at as approval_created_at,
            ar.assignment_type,
            ar.priority_level,
            ar.requested_role,
            ar.start_date,
            ar.description,
            requester.first_name || ' ' || requester.last_name as requester_name,
            approver.first_name || ' ' || approver.last_name as approver_name
        FROM assignment_approvals aa
        JOIN assignment_requests ar ON aa.assignment_request_id = ar.id
        JOIN app_users requester ON ar.requester_id = requester.id
        JOIN app_users approver ON aa.approver_id = approver.id
        WHERE aa.status = 'pending';
    """)
    
    # View for capacity utilization by crew
    op.execute("""
        CREATE VIEW crew_capacity_utilization AS
        SELECT 
            tc.id as crew_id,
            tc.name as crew_name,
            tt.name as team_name,
            tc.capacity,
            COALESCE(SUM(ca.allocation_percentage), 0) as current_utilization,
            COUNT(ca.id) as active_assignments,
            CASE 
                WHEN COALESCE(SUM(ca.allocation_percentage), 0) > 100 THEN true
                ELSE false
            END as is_overbooked
        FROM trade_crews tc
        LEFT JOIN trade_teams tt ON tc.trade_team_id = tt.id
        LEFT JOIN capacity_allocations ca ON tc.id = ca.trade_crew_id 
            AND ca.is_confirmed = true
            AND ca.start_date <= CURRENT_TIMESTAMP
            AND ca.end_date >= CURRENT_TIMESTAMP
        GROUP BY tc.id, tc.name, tt.name, tc.capacity;
    """)
    
    # View for assignment workflow status
    op.execute("""
        CREATE VIEW assignment_workflow_status AS
        SELECT 
            ar.id as assignment_id,
            ar.status as assignment_status,
            ws.current_state,
            ws.created_at as state_created_at,
            COUNT(aa.id) as total_approvals,
            COUNT(CASE WHEN aa.status = 'approved' THEN 1 END) as approved_count,
            COUNT(CASE WHEN aa.status = 'rejected' THEN 1 END) as rejected_count,
            COUNT(CASE WHEN aa.status = 'pending' THEN 1 END) as pending_count
        FROM assignment_requests ar
        LEFT JOIN workflow_states ws ON ar.id = ws.assignment_request_id
        LEFT JOIN assignment_approvals aa ON ar.id = aa.assignment_request_id
        WHERE ws.id = (
            SELECT MAX(ws2.id) 
            FROM workflow_states ws2 
            WHERE ws2.assignment_request_id = ar.id
        )
        GROUP BY ar.id, ar.status, ws.current_state, ws.created_at;
    """)

def downgrade_assignment_workflow_views():
    """Remove database views for assignment workflow reporting."""
    
    op.execute("DROP VIEW IF EXISTS assignment_summary")
    op.execute("DROP VIEW IF EXISTS pending_approvals_summary")
    op.execute("DROP VIEW IF EXISTS crew_capacity_utilization")
    op.execute("DROP VIEW IF EXISTS assignment_workflow_status")

# Main migration functions
def upgrade():
    """Apply all assignment workflow migrations."""
    upgrade_assignment_workflow_tables()
    upgrade_assignment_workflow_constraints()
    upgrade_assignment_workflow_triggers()
    upgrade_assignment_workflow_views()

def downgrade():
    """Rollback all assignment workflow migrations."""
    downgrade_assignment_workflow_views()
    downgrade_assignment_workflow_triggers()
    downgrade_assignment_workflow_constraints()
    downgrade_assignment_workflow_tables()
