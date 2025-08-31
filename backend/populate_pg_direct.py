import psycopg2

# Connect directly to PostgreSQL
conn = psycopg2.connect(
    host="10.92.3.21",
    database="ldc_construction_tools_production",
    user="ldc_user",
    password="ldc_password"
)
cur = conn.cursor()

# Insert trade teams
teams = [
    ('Electrical', 'Electrical systems and wiring', True, 'ELECTRICAL'),
    ('Exteriors', 'Exterior construction and finishes', True, 'EXTERIORS'),
    ('Interiors', 'Interior construction and finishes', True, 'INTERIORS'),
    ('Mechanical', 'HVAC and mechanical systems', True, 'MECHANICAL'),
    ('Plumbing', 'Plumbing systems and fixtures', True, 'PLUMBING'),
    ('Site Support', 'Site support and logistics', True, 'SITE SUPPORT'),
    ('Sitework/Civil', 'Site work and civil engineering', True, 'SITEWORK/CIVIL'),
    ('Structural', 'Structural construction', True, 'STRUCTURAL')
]

cur.executemany(
    "INSERT INTO trade_teams (name, description, is_active, ba_group_prefix) VALUES (%s, %s, %s, %s)",
    teams
)

# Insert trade crews
crews = [
    ('AUDIO & VIDEO', 1, 'ELECTRICAL – AUDIO & VIDEO', 'audio_&_video', True),
    ('ELECTRICAL COMMISSIONING', 1, 'ELECTRICAL – COMMISSIONING', 'electrical_commissioning', True),
    ('ELECTRICAL FINISH', 1, 'ELECTRICAL – FINISH', 'electrical_finish', True),
    ('LOW VOLTAGE', 1, 'ELECTRICAL – LOW VOLTAGE', 'low_voltage', True),
    ('ELECTRICAL ROUGH-IN', 1, 'ELECTRICAL – ROUGH-IN', 'electrical_rough_in', True),
    ('ELECTRICAL UTILITIES', 1, 'ELECTRICAL – UTILITIES', 'electrical_utilities', True),
    ('EXTERIOR SPECIALTIES', 2, 'EXTERIORS – EXTERIOR SPECIALTIES', 'exterior_specialties', True),
    ('MASONRY', 2, 'EXTERIORS – MASONRY', 'masonry', True),
    ('ROOFING', 2, 'EXTERIORS – ROOFING', 'roofing', True),
    ('SCAFFOLDING', 2, 'EXTERIORS – SCAFFOLDING', 'scaffolding', True),
    ('SIDING', 2, 'EXTERIORS – SIDING', 'siding', True),
    ('WINDOWS', 2, 'EXTERIORS – WINDOWS', 'windows', True),
    ('CARPET', 3, 'INTERIORS – CARPET', 'carpet', True),
    ('DOORS', 3, 'INTERIORS – DOORS', 'doors', True),
    ('DRYWALL', 3, 'INTERIORS – DRYWALL', 'drywall', True),
    ('FINISH CARPENTRY', 3, 'INTERIORS – FINISH CARPENTRY', 'finish_carpentry', True),
    ('INTERIOR SPECIALTIES', 3, 'INTERIORS – INTERIOR SPECIALTIES', 'interior_specialties', True),
    ('PAINT', 3, 'INTERIORS – PAINT', 'paint', True),
    ('SUSPENDED CEILING', 3, 'INTERIORS – SUSPENDED CEILING', 'suspended_ceiling', True),
    ('TILE', 3, 'INTERIORS – TILE', 'tile', True),
    ('TOILET PARTITIONS', 3, 'INTERIORS – TOILET PARTITIONS', 'toilet_partitions', True),
    ('HVAC COMMISSIONING', 4, 'MECHANICAL – HVAC COMMISSIONING', 'hvac_commissioning', True),
    ('HVAC FINISH', 4, 'MECHANICAL – HVAC FINISH', 'hvac_finish', True),
    ('HVAC ROUGH-IN', 4, 'MECHANICAL – HVAC ROUGH-IN', 'hvac_rough_in', True),
    ('PLUMBING FINISH', 5, 'PLUMBING – PLUMBING FINISH', 'plumbing_finish', True),
    ('PLUMBING ROUGH-IN', 5, 'PLUMBING – PLUMBING ROUGH-IN', 'plumbing_rough_in', True),
    ('PLUMBING UTILITIES', 5, 'PLUMBING – PLUMBING UTILITIES', 'plumbing_utilities', True),
    ('EQUIPMENT & VEHICLE MAINTENANCE', 6, 'SITE SUPPORT – EQUIPMENT & VEHICLE MAINTENANCE', 'equipment_&_vehicle_maintenance', True),
    ('PROJECT SUPPORT', 6, 'SITE SUPPORT – PROJECT SUPPORT', 'project_support', True),
    ('TRUCKING', 6, 'SITE SUPPORT – TRUCKING', 'trucking', True),
    ('ASPHALT COATING', 7, 'SITEWORK/CIVIL – ASPHALT COATING', 'asphalt_coating', True),
    ('CONCRETE', 7, 'SITEWORK/CIVIL – CONCRETE', 'concrete', True),
    ('EARTHWORK', 7, 'SITEWORK/CIVIL – EARTHWORK', 'earthwork', True),
    ('LANDSCAPING', 7, 'SITEWORK/CIVIL – LANDSCAPING', 'landscaping', True),
    ('PAVEMENT STRIPING', 7, 'SITEWORK/CIVIL – PAVEMENT STRIPING', 'pavement_striping', True),
    ('TREE CLEARING', 7, 'SITEWORK/CIVIL – TREE CLEARING', 'tree_clearing', True),
    ('DEMOLITION', 8, 'STRUCTURAL – DEMOLITION', 'demolition', True),
    ('FRAMING', 8, 'STRUCTURAL – FRAMING', 'framing', True),
    ('INSULATION', 8, 'STRUCTURAL – INSULATION', 'insulation', True),
    ('REMEDIATION', 8, 'STRUCTURAL – REMEDIATION', 'remediation', True)
]

cur.executemany(
    "INSERT INTO trade_crews (name, trade_team_id, ba_group_name, specialization, is_active) VALUES (%s, %s, %s, %s, %s)",
    crews
)

conn.commit()
cur.close()
conn.close()
print("PostgreSQL database populated successfully")
