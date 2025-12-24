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
  { category: 'CG_OVERSIGHT', name: 'Construction Group Overseer Support', code: 'CGO-Support' },

  // CG STAFF - FROM ORG CHART
  { category: 'CG_STAFF', name: 'Construction Group Members', code: 'CG-Member' },
  { category: 'CG_STAFF', name: 'Construction Group Members Assistant', code: 'CG-Member-Asst' },
  { category: 'CG_STAFF', name: 'Construction Group Members Support', code: 'CG-Member-Support' },
  { category: 'CG_STAFF', name: 'Safety Coordinator', code: 'SC' },
  { category: 'CG_STAFF', name: 'Safety Coordinator Assistant', code: 'SC-Asst' },
  { category: 'CG_STAFF', name: 'Safety Coordinator Support', code: 'SC-Support' },
  { category: 'CG_STAFF', name: 'Project Construction Coordinator', code: 'PCC' },
  { category: 'CG_STAFF', name: 'Project Construction Coordinator Assistant', code: 'PCC-Asst' },
  { category: 'CG_STAFF', name: 'Project Construction Coordinator Support', code: 'PCC-Support' },
  { category: 'CG_STAFF', name: 'Regulatory Consultant', code: 'RC' },
  { category: 'CG_STAFF', name: 'Regulatory Consultant Assistant', code: 'RC-Asst' },
  { category: 'CG_STAFF', name: 'Regulatory Consultant Support', code: 'RC-Support' },
  { category: 'CG_STAFF', name: 'Estimator', code: 'EST' },
  { category: 'CG_STAFF', name: 'Estimator Assistant', code: 'EST-Asst' },
  { category: 'CG_STAFF', name: 'Estimator Support', code: 'EST-Support' },
  { category: 'CG_STAFF', name: 'Scheduler', code: 'SCHED' },
  { category: 'CG_STAFF', name: 'Scheduler Assistant', code: 'SCHED-Asst' },
  { category: 'CG_STAFF', name: 'Scheduler Support', code: 'SCHED-Support' },

  // REGION SUPPORT SERVICES
  { category: 'REGION_SUPPORT_SERVICES', name: 'Equipment Management Contact', code: 'EMC' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Equipment Management Contact Assistant', code: 'EMC-Asst' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Equipment Management Contact Support', code: 'EMC-Support' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Housing Contact', code: 'HC' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Housing Contact Assistant', code: 'HC-Asst' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Housing Contact Support', code: 'HC-Support' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Personnel Contact', code: 'PC' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Personnel Contact Assistant', code: 'PCA' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Personnel Contact Support', code: 'PC-Support' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Regulatory Contact', code: 'REG' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Regulatory Contact Assistant', code: 'REG-Asst' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Regulatory Contact Support', code: 'REG-Support' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Safety Coordinator Contact', code: 'SCC' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Safety Coordinator Contact Assistant', code: 'SCC-Asst' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Safety Coordinator Contact Support', code: 'SCC-Support' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Sourcing Buyer', code: 'SB' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Sourcing Buyer Assistant', code: 'SB-Asst' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Sourcing Buyer Support', code: 'SB-Support' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Training Organizer', code: 'TO' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Training Organizer Assistant', code: 'TO-Asst' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Training Organizer Support', code: 'TO-Support' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Translation Buyer', code: 'TB' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Translation Buyer Assistant', code: 'TB-Asst' },
  { category: 'REGION_SUPPORT_SERVICES', name: 'Translation Buyer Support', code: 'TB-Support' },

  // TRADE TEAM
  { category: 'TRADE_TEAM', name: 'Trade Team Overseer', code: 'TTO' },
  { category: 'TRADE_TEAM', name: 'Trade Team Overseer Assistant', code: 'TTOA' },
  { category: 'TRADE_TEAM', name: 'Trade Team Support', code: 'TTS' },

  // TRADE CREW
  { category: 'TRADE_CREW', name: 'Trade Crew Overseer', code: 'TCO' },
  { category: 'TRADE_CREW', name: 'Trade Crew Overseer Assistant', code: 'TCOA' },
  { category: 'TRADE_CREW', name: 'Trade Crew Support', code: 'TCS' },
  { category: 'TRADE_CREW', name: 'Trade Crew Volunteer', code: 'TCV' }
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
