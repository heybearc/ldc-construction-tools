-- Manual population script for LDC Construction Tools Phase 2
-- Populates 8 trade teams, 42 trade crews, and 192 role positions

-- Insert Trade Teams
INSERT INTO trade_teams (name, ba_group_prefix, description, is_active, created_at, updated_at) VALUES
('ELECTRICAL', 'ELECTRICAL', 'ELECTRICAL trade team for LDC Construction Group 01.12', true, NOW(), NOW()),
('EXTERIORS', 'EXTERIORS', 'EXTERIORS trade team for LDC Construction Group 01.12', true, NOW(), NOW()),
('INTERIORS', 'INTERIORS', 'INTERIORS trade team for LDC Construction Group 01.12', true, NOW(), NOW()),
('MECHANICAL', 'MECHANICAL', 'MECHANICAL trade team for LDC Construction Group 01.12', true, NOW(), NOW()),
('PLUMBING', 'PLUMBING', 'PLUMBING trade team for LDC Construction Group 01.12', true, NOW(), NOW()),
('SITE SUPPORT', 'SITE SUPPORT', 'SITE SUPPORT trade team for LDC Construction Group 01.12', true, NOW(), NOW()),
('SITEWORK', 'SITEWORK', 'SITEWORK trade team for LDC Construction Group 01.12', true, NOW(), NOW()),
('STRUCTURAL', 'STRUCTURAL', 'STRUCTURAL trade team for LDC Construction Group 01.12', true, NOW(), NOW());

-- Insert Trade Crews for ELECTRICAL
INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active, created_at, updated_at) VALUES
('AUDIO & VIDEO', (SELECT id FROM trade_teams WHERE name = 'ELECTRICAL'), 'ELECTRICAL – AUDIO & VIDEO', 'audio_&_video', true, NOW(), NOW()),
('ELECTRICAL COMMISSIONING', (SELECT id FROM trade_teams WHERE name = 'ELECTRICAL'), 'ELECTRICAL – ELECTRICAL COMMISSIONING', 'electrical_commissioning', true, NOW(), NOW()),
('ELECTRICAL FINISH', (SELECT id FROM trade_teams WHERE name = 'ELECTRICAL'), 'ELECTRICAL – ELECTRICAL FINISH', 'electrical_finish', true, NOW(), NOW()),
('ELECTRICAL LOW VOLTAGE', (SELECT id FROM trade_teams WHERE name = 'ELECTRICAL'), 'ELECTRICAL – ELECTRICAL LOW VOLTAGE', 'electrical_low_voltage', true, NOW(), NOW()),
('ELECTRICAL ROUGH-IN', (SELECT id FROM trade_teams WHERE name = 'ELECTRICAL'), 'ELECTRICAL – ELECTRICAL ROUGH-IN', 'electrical_rough-in', true, NOW(), NOW()),
('ELECTRICAL UTILITIES', (SELECT id FROM trade_teams WHERE name = 'ELECTRICAL'), 'ELECTRICAL – ELECTRICAL UTILITIES', 'electrical_utilities', true, NOW(), NOW());

-- Insert Trade Crews for EXTERIORS
INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active, created_at, updated_at) VALUES
('EXTERIOR SPECIALTIES', (SELECT id FROM trade_teams WHERE name = 'EXTERIORS'), 'EXTERIORS – EXTERIOR SPECIALTIES', 'exterior_specialties', true, NOW(), NOW()),
('MASONRY', (SELECT id FROM trade_teams WHERE name = 'EXTERIORS'), 'EXTERIORS – MASONRY', 'masonry', true, NOW(), NOW()),
('ROOFING', (SELECT id FROM trade_teams WHERE name = 'EXTERIORS'), 'EXTERIORS – ROOFING', 'roofing', true, NOW(), NOW()),
('SCAFFOLDING', (SELECT id FROM trade_teams WHERE name = 'EXTERIORS'), 'EXTERIORS – SCAFFOLDING', 'scaffolding', true, NOW(), NOW()),
('SIDING', (SELECT id FROM trade_teams WHERE name = 'EXTERIORS'), 'EXTERIORS – SIDING', 'siding', true, NOW(), NOW()),
('WINDOWS', (SELECT id FROM trade_teams WHERE name = 'EXTERIORS'), 'EXTERIORS – WINDOWS', 'windows', true, NOW(), NOW());

-- Insert Trade Crews for INTERIORS
INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active, created_at, updated_at) VALUES
('CARPET', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – CARPET', 'carpet', true, NOW(), NOW()),
('DOORS', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – DOORS', 'doors', true, NOW(), NOW()),
('DRYWALL', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – DRYWALL', 'drywall', true, NOW(), NOW()),
('FINISH CARPENTRY', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – FINISH CARPENTRY', 'finish_carpentry', true, NOW(), NOW()),
('INTERIOR SPECIALTIES', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – INTERIOR SPECIALTIES', 'interior_specialties', true, NOW(), NOW()),
('PAINT', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – PAINT', 'paint', true, NOW(), NOW()),
('SUSPENDED CEILING', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – SUSPENDED CEILING', 'suspended_ceiling', true, NOW(), NOW()),
('TILE', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – TILE', 'tile', true, NOW(), NOW()),
('TOILET PARTITIONS', (SELECT id FROM trade_teams WHERE name = 'INTERIORS'), 'INTERIORS – TOILET PARTITIONS', 'toilet_partitions', true, NOW(), NOW());

-- Insert Trade Crews for MECHANICAL
INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active, created_at, updated_at) VALUES
('HVAC COMMISSIONING', (SELECT id FROM trade_teams WHERE name = 'MECHANICAL'), 'MECHANICAL – HVAC COMMISSIONING', 'hvac_commissioning', true, NOW(), NOW()),
('HVAC FINISH', (SELECT id FROM trade_teams WHERE name = 'MECHANICAL'), 'MECHANICAL – HVAC FINISH', 'hvac_finish', true, NOW(), NOW()),
('HVAC ROUGH-IN', (SELECT id FROM trade_teams WHERE name = 'MECHANICAL'), 'MECHANICAL – HVAC ROUGH-IN', 'hvac_rough-in', true, NOW(), NOW());

-- Insert Trade Crews for PLUMBING
INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active, created_at, updated_at) VALUES
('PLUMBING FINISH', (SELECT id FROM trade_teams WHERE name = 'PLUMBING'), 'PLUMBING – PLUMBING FINISH', 'plumbing_finish', true, NOW(), NOW()),
('PLUMBING ROUGH-IN', (SELECT id FROM trade_teams WHERE name = 'PLUMBING'), 'PLUMBING – PLUMBING ROUGH-IN', 'plumbing_rough-in', true, NOW(), NOW()),
('PLUMBING UTILITIES', (SELECT id FROM trade_teams WHERE name = 'PLUMBING'), 'PLUMBING – PLUMBING UTILITIES', 'plumbing_utilities', true, NOW(), NOW());

-- Insert Trade Crews for SITE SUPPORT
INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active, created_at, updated_at) VALUES
('EQUIPMENT & VEHICLE MAINTENANCE', (SELECT id FROM trade_teams WHERE name = 'SITE SUPPORT'), 'SITE SUPPORT – EQUIPMENT & VEHICLE MAINTENANCE', 'equipment_&_vehicle_maintenance', true, NOW(), NOW()),
('PROJECT SUPPORT', (SELECT id FROM trade_teams WHERE name = 'SITE SUPPORT'), 'SITE SUPPORT – PROJECT SUPPORT', 'project_support', true, NOW(), NOW()),
('TRUCKING', (SELECT id FROM trade_teams WHERE name = 'SITE SUPPORT'), 'SITE SUPPORT – TRUCKING', 'trucking', true, NOW(), NOW());

-- Insert Trade Crews for SITEWORK
INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active, created_at, updated_at) VALUES
('ASPHALT COATING', (SELECT id FROM trade_teams WHERE name = 'SITEWORK'), 'SITEWORK – ASPHALT COATING', 'asphalt_coating', true, NOW(), NOW()),
('CONCRETE', (SELECT id FROM trade_teams WHERE name = 'SITEWORK'), 'SITEWORK – CONCRETE', 'concrete', true, NOW(), NOW()),
('EARTHWORK', (SELECT id FROM trade_teams WHERE name = 'SITEWORK'), 'SITEWORK – EARTHWORK', 'earthwork', true, NOW(), NOW()),
('LANDSCAPING', (SELECT id FROM trade_teams WHERE name = 'SITEWORK'), 'SITEWORK – LANDSCAPING', 'landscaping', true, NOW(), NOW()),
('PAVEMENT STRIPING', (SELECT id FROM trade_teams WHERE name = 'SITEWORK'), 'SITEWORK – PAVEMENT STRIPING', 'pavement_striping', true, NOW(), NOW()),
('TREE CLEARING', (SELECT id FROM trade_teams WHERE name = 'SITEWORK'), 'SITEWORK – TREE CLEARING', 'tree_clearing', true, NOW(), NOW());

-- Insert Trade Crews for STRUCTURAL
INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active, created_at, updated_at) VALUES
('DEMOLITION', (SELECT id FROM trade_teams WHERE name = 'STRUCTURAL'), 'STRUCTURAL – DEMOLITION', 'demolition', true, NOW(), NOW()),
('FRAMING', (SELECT id FROM trade_teams WHERE name = 'STRUCTURAL'), 'STRUCTURAL – FRAMING', 'framing', true, NOW(), NOW()),
('INSULATION', (SELECT id FROM trade_teams WHERE name = 'STRUCTURAL'), 'STRUCTURAL – INSULATION', 'insulation', true, NOW(), NOW()),
('REMEDIATION', (SELECT id FROM trade_teams WHERE name = 'STRUCTURAL'), 'STRUCTURAL – REMEDIATION', 'remediation', true, NOW(), NOW());

-- Create Team-Level Role Assignments (3 roles per team × 8 teams = 24 roles)
INSERT INTO role_assignments (role_level, assignment_category, trade_team_id, is_vacant, status, consultation_completed, created_at, updated_at)
SELECT 
    'trade_team_overseer'::role_level,
    'trade_team_leadership'::assignment_category,
    id,
    true,
    'no_adjustment_needed',
    false,
    NOW(),
    NOW()
FROM trade_teams;

INSERT INTO role_assignments (role_level, assignment_category, trade_team_id, is_vacant, status, consultation_completed, created_at, updated_at)
SELECT 
    'trade_team_assistant_overseer'::role_level,
    'trade_team_leadership'::assignment_category,
    id,
    true,
    'no_adjustment_needed',
    false,
    NOW(),
    NOW()
FROM trade_teams;

INSERT INTO role_assignments (role_level, assignment_category, trade_team_id, is_vacant, status, consultation_completed, created_at, updated_at)
SELECT 
    'trade_team_support'::role_level,
    'trade_team_leadership'::assignment_category,
    id,
    true,
    'no_adjustment_needed',
    false,
    NOW(),
    NOW()
FROM trade_teams;

-- Create Crew-Level Role Assignments (4 roles per crew × 42 crews = 168 roles)
INSERT INTO role_assignments (role_level, assignment_category, trade_team_id, trade_crew_id, is_vacant, status, consultation_completed, created_at, updated_at)
SELECT 
    'trade_crew_overseer'::role_level,
    'trade_crew_leadership'::assignment_category,
    trade_team_id,
    id,
    true,
    'no_adjustment_needed',
    false,
    NOW(),
    NOW()
FROM trade_crews;

INSERT INTO role_assignments (role_level, assignment_category, trade_team_id, trade_crew_id, is_vacant, status, consultation_completed, created_at, updated_at)
SELECT 
    'trade_crew_assistant_overseer'::role_level,
    'trade_crew_leadership'::assignment_category,
    trade_team_id,
    id,
    true,
    'no_adjustment_needed',
    false,
    NOW(),
    NOW()
FROM trade_crews;

INSERT INTO role_assignments (role_level, assignment_category, trade_team_id, trade_crew_id, is_vacant, status, consultation_completed, created_at, updated_at)
SELECT 
    'trade_crew_support'::role_level,
    'trade_crew_leadership'::assignment_category,
    trade_team_id,
    id,
    true,
    'no_adjustment_needed',
    false,
    NOW(),
    NOW()
FROM trade_crews;

INSERT INTO role_assignments (role_level, assignment_category, trade_team_id, trade_crew_id, is_vacant, status, consultation_completed, created_at, updated_at)
SELECT 
    'trade_crew_volunteer'::role_level,
    'trade_crew_leadership'::assignment_category,
    trade_team_id,
    id,
    true,
    'no_adjustment_needed',
    false,
    NOW(),
    NOW()
FROM trade_crews;
