import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { VolunteerRoleCategory } from '@prisma/client';

// Role definitions that can be assigned to volunteers
const AVAILABLE_ROLES = [
  // CG OVERSIGHT
  { category: 'CG_OVERSIGHT', name: 'Construction Group Overseer', code: 'CGO' },
  { category: 'CG_OVERSIGHT', name: 'Assistant Construction Group Overseer', code: 'ACGO' },
  { category: 'CG_OVERSIGHT', name: 'Construction Group Support', code: 'CG-Support' },

  // CONSTRUCTION STAFF - REGIONAL
  { category: 'CONSTRUCTION_STAFF', name: 'Construction Field Rep', code: 'CFR' },
  { category: 'CONSTRUCTION_STAFF', name: 'Construction Field Rep - RA Support', code: 'CFR-RA' },
  { category: 'CONSTRUCTION_STAFF', name: 'Field Rep', code: 'FR' },
  { category: 'CONSTRUCTION_STAFF', name: 'Field Rep (Wife)', code: 'FR-W' },
  { category: 'CONSTRUCTION_STAFF', name: 'Field Rep Assistant', code: 'FRAA' },
  { category: 'CONSTRUCTION_STAFF', name: 'Field Rep Assistant (Wife)', code: 'FRAA-W' },
  { category: 'CONSTRUCTION_STAFF', name: 'Design Contact', code: 'DC' },
  { category: 'CONSTRUCTION_STAFF', name: 'Design Lead', code: 'DL' },
  { category: 'CONSTRUCTION_STAFF', name: 'Purchasing Field Rep', code: 'PFR' },
  { category: 'CONSTRUCTION_STAFF', name: 'Local Cost Controller', code: 'LCC' },
  { category: 'CONSTRUCTION_STAFF', name: 'Field Cost Controller', code: 'LCC-Field' },
  { category: 'CONSTRUCTION_STAFF', name: 'Field Cost Controller (Wife)', code: 'LCC-Field-W' },
  { category: 'CONSTRUCTION_STAFF', name: 'Personnel/Training Contact', code: 'PTC' },
  { category: 'CONSTRUCTION_STAFF', name: 'Personnel/Training Contact (Wife)', code: 'PTC-W' },
  { category: 'CONSTRUCTION_STAFF', name: 'Housing Contact', code: 'HC' },
  { category: 'CONSTRUCTION_STAFF', name: 'Housing Contact Assistant', code: 'HC-Asst' },
  { category: 'CONSTRUCTION_STAFF', name: 'Housing Contact Support', code: 'HC-Support' },
  { category: 'CONSTRUCTION_STAFF', name: 'Zone Safety Contact', code: 'ZSC' },

  // CONSTRUCTION STAFF - TRADE DISCIPLINES
  { category: 'CONSTRUCTION_STAFF', name: 'Mechanical', code: 'MECH' },
  { category: 'CONSTRUCTION_STAFF', name: 'Structural & Roofing', code: 'STRUCT' },
  { category: 'CONSTRUCTION_STAFF', name: 'Electrical', code: 'ELEC' },
  { category: 'CONSTRUCTION_STAFF', name: 'Architectural', code: 'ARCH' },
  { category: 'CONSTRUCTION_STAFF', name: 'A/V & Low Voltage', code: 'AV-LV' },
  { category: 'CONSTRUCTION_STAFF', name: 'Plumbing', code: 'PLUMB' },

  // TRADE TEAM
  { category: 'TRADE_TEAM', name: 'Trade Team Overseer', code: 'TTO' },
  { category: 'TRADE_TEAM', name: 'Trade Team Overseer Assistant', code: 'TTOA' },
  { category: 'TRADE_TEAM', name: 'Trade Team Support', code: 'TTS' },

  // TRADE CREW
  { category: 'TRADE_CREW', name: 'Trade Crew Overseer', code: 'TCO' },
  { category: 'TRADE_CREW', name: 'Trade Crew Overseer Assistant', code: 'TCOA' },
  { category: 'TRADE_CREW', name: 'Trade Crew Support', code: 'TCS' },
  { category: 'TRADE_CREW', name: 'Trade Crew Volunteer', code: 'TCV' },

  // PROJECT STAFF
  { category: 'PROJECT_STAFF', name: 'Project Staffing Contact', code: 'PSC' },
  { category: 'PROJECT_STAFF', name: 'Project Staffing Contact - Assistant', code: 'PSC-Asst' },
  { category: 'PROJECT_STAFF', name: 'Local Project Regulatory Contact', code: 'LPRC' },
  { category: 'PROJECT_STAFF', name: 'Project Construction Coordinator', code: 'PCC' },
  { category: 'PROJECT_STAFF', name: 'Project Construction Coordinator - Assistant #1', code: 'PCC-Asst1' },
  { category: 'PROJECT_STAFF', name: 'Project Construction Coordinator - Assistant #2', code: 'PCC-Asst2' },
  { category: 'PROJECT_STAFF', name: 'Safety Coordinator', code: 'SC' },
  { category: 'PROJECT_STAFF', name: 'Safety Coordinator - Assistant #1', code: 'SC-Asst1' },
  { category: 'PROJECT_STAFF', name: 'Safety Coordinator - Assistant #2', code: 'SC-Asst2' },
  { category: 'PROJECT_STAFF', name: 'Maintenance Trainer', code: 'MT' },
  { category: 'PROJECT_STAFF', name: 'Maintenance Trainer Assistant', code: 'MTA' }
];

// GET /api/v1/volunteer-roles - Get available roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as VolunteerRoleCategory | null;

    let roles = AVAILABLE_ROLES;
    
    if (category) {
      roles = roles.filter(r => r.category === category);
    }

    // Group by category
    const grouped = roles.reduce((acc, role) => {
      if (!acc[role.category]) {
        acc[role.category] = [];
      }
      acc[role.category].push(role);
      return acc;
    }, {} as Record<string, typeof roles>);

    return NextResponse.json({
      roles: AVAILABLE_ROLES,
      grouped,
      categories: Object.keys(grouped)
    });
  } catch (error) {
    console.error('Error fetching volunteer roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer roles' },
      { status: 500 }
    );
  }
}

// POST /api/v1/volunteer-roles - Assign role to volunteer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { volunteerId, roleCategory, roleName, roleCode, entityId, entityType, isPrimary } = body;

    if (!volunteerId || !roleCategory || !roleName || !roleCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if volunteer exists
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId }
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Create role assignment
    const roleAssignment = await prisma.volunteerRole.create({
      data: {
        volunteerId,
        roleCategory: roleCategory as VolunteerRoleCategory,
        roleName,
        roleCode,
        entityId: entityId || null,
        entityType: entityType || null,
        isPrimary: isPrimary !== undefined ? isPrimary : true,
        isActive: true
      },
      include: {
        volunteer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json(roleAssignment, { status: 201 });
  } catch (error: any) {
    console.error('Error assigning volunteer role:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This role is already assigned to this volunteer' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}
