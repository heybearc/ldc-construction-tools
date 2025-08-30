-- Phase 2 Database Migration for LDC Construction Tools
-- Adds new columns and tables for complete role hierarchy system

-- Add new columns to existing trade_teams table
ALTER TABLE trade_teams ADD COLUMN IF NOT EXISTS ba_group_prefix VARCHAR(50);

-- Add new columns to existing trade_crews table  
ALTER TABLE trade_crews ADD COLUMN IF NOT EXISTS ba_group_name VARCHAR(100);

-- Create role_assignments table for 192 organizational positions
CREATE TABLE IF NOT EXISTS role_assignments (
    id SERIAL PRIMARY KEY,
    role_level VARCHAR(50) NOT NULL,
    assignment_category VARCHAR(50) NOT NULL,
    trade_team_id INTEGER REFERENCES trade_teams(id),
    trade_crew_id INTEGER REFERENCES trade_crews(id),
    assigned_member_id INTEGER REFERENCES crew_members(id),
    is_vacant BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'no_adjustment_needed',
    consultation_completed BOOLEAN DEFAULT FALSE,
    impact_assessment TEXT,
    change_reason TEXT,
    effective_date VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    notes TEXT
);

-- Create role_change_history table for USLDC-2829-E audit trail
CREATE TABLE IF NOT EXISTS role_change_history (
    id SERIAL PRIMARY KEY,
    role_assignment_id INTEGER NOT NULL REFERENCES role_assignments(id),
    change_type VARCHAR(50) NOT NULL,
    previous_member_id INTEGER,
    new_member_id INTEGER,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    change_reason TEXT NOT NULL,
    changed_by VARCHAR(100) NOT NULL,
    consultation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_assignments_trade_team ON role_assignments(trade_team_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_trade_crew ON role_assignments(trade_crew_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_member ON role_assignments(assigned_member_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_status ON role_assignments(status);
CREATE INDEX IF NOT EXISTS idx_role_change_history_assignment ON role_change_history(role_assignment_id);

-- Add constraints
ALTER TABLE role_assignments ADD CONSTRAINT chk_role_level 
    CHECK (role_level IN ('trade_team_overseer', 'trade_team_assistant_overseer', 'trade_team_support', 
                          'trade_crew_overseer', 'trade_crew_assistant_overseer', 'trade_crew_support', 'trade_crew_volunteer'));

ALTER TABLE role_assignments ADD CONSTRAINT chk_assignment_category 
    CHECK (assignment_category IN ('branch_appointed', 'field_assigned_continuous', 'field_assigned_temporary'));

ALTER TABLE role_assignments ADD CONSTRAINT chk_status 
    CHECK (status IN ('remove_role', 'adjustment_needed', 'no_adjustment_needed'));

-- Ensure either trade_team_id or trade_crew_id is set (but not both for team-level roles)
ALTER TABLE role_assignments ADD CONSTRAINT chk_assignment_location 
    CHECK ((trade_team_id IS NOT NULL AND trade_crew_id IS NULL AND role_level LIKE 'trade_team_%') OR
           (trade_crew_id IS NOT NULL AND role_level LIKE 'trade_crew_%'));

COMMENT ON TABLE role_assignments IS 'Tracks all 192 organizational positions with USLDC-2829-E compliance';
COMMENT ON TABLE role_change_history IS 'Complete audit trail for all role changes per USLDC-2829-E requirements';
