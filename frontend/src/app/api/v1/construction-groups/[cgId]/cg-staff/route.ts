// API route for CG Staff management (CG-level)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CG_STAFF_CONFIG, validateRoleLimit } from '@/lib/oversight-types';

// GET: List all CG staff for a construction group
export async function GET(
  request: NextRequest,
  { params }: { params: { cgId: string } }
) {
  try {
    const { cgId } = params;

    // Query volunteer_roles table for CG staff roles
    const staffRoles = await prisma.$queryRaw<Array<{
      id: string;
      volunteer_id: string;
      role_code: string;
      entity_type: string | null;
      entity_id: string | null;
      is_primary: boolean;
      start_date: Date;
      end_date: Date | null;
      user_id: string;
      user_name: string | null;
      user_email: string;
      user_first_name: string | null;
      user_last_name: string | null;
    }>>`
      SELECT 
        vr.id,
        vr."volunteerId" as volunteer_id,
        vr."roleCode" as role_code,
        vr."entityType" as entity_type,
        vr."entityId" as entity_id,
        vr."isPrimary" as is_primary,
        vr."startDate" as start_date,
        vr."endDate" as end_date,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u."firstName" as user_first_name,
        u."lastName" as user_last_name
      FROM "VolunteerRole" vr
      JOIN "Volunteer" v ON vr."volunteerId" = v.id
      JOIN "User" u ON v."userId" = u.id
      WHERE vr."roleCode" IN ('CGO', 'CGOA', 'CG_SECRETARY', 'CG_SAFETY')
        AND vr."entityType" = 'Construction Group'
        AND vr."entityId" = ${cgId}
        AND vr."endDate" IS NULL
      ORDER BY 
        CASE vr."roleCode"
          WHEN 'CGO' THEN 1
          WHEN 'CGOA' THEN 2
          WHEN 'CG_SECRETARY' THEN 3
          WHEN 'CG_SAFETY' THEN 4
        END,
        vr."startDate" ASC
    `;

    // Transform to match OversightSection expected format
    const staff = staffRoles.map(row => ({
      id: row.id,
      userId: row.user_id,
      role: row.role_code,
      isActive: true,
      startDate: row.start_date.toISOString(),
      endDate: row.end_date?.toISOString() || null,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        firstName: row.user_first_name,
        lastName: row.user_last_name
      }
    }));

    const grouped = {
      CGO: staff.filter(s => s.role === 'CGO'),
      CGOA: staff.filter(s => s.role === 'CGOA'),
      CG_SECRETARY: staff.filter(s => s.role === 'CG_SECRETARY'),
      CG_SAFETY: staff.filter(s => s.role === 'CG_SAFETY')
    };

    return NextResponse.json({
      contacts: staff, // Keep same property name for OversightSection compatibility
      grouped,
      config: CG_STAFF_CONFIG
    });

  } catch (error) {
    console.error('CG Staff GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CG staff' },
      { status: 500 }
    );
  }
}

// POST: Add a new CG staff member
export async function POST(
  request: NextRequest,
  { params }: { params: { cgId: string } }
) {
  try {
    const { cgId } = params;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!CG_STAFF_CONFIG[role as keyof typeof CG_STAFF_CONFIG]) {
      return NextResponse.json(
        { error: `Invalid role: ${role}. Valid roles: CGO, CGOA, CG_SECRETARY, CG_SAFETY` },
        { status: 400 }
      );
    }

    // Check current count for this role
    const currentCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "VolunteerRole"
      WHERE "roleCode" = ${role}
        AND "entityType" = 'Construction Group'
        AND "entityId" = ${cgId}
        AND "endDate" IS NULL
    `;

    const count = Number(currentCount[0]?.count || 0);
    const validation = validateRoleLimit(CG_STAFF_CONFIG, role, count);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // Check if user already has this role
    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT vr.id
      FROM "VolunteerRole" vr
      JOIN "Volunteer" v ON vr."volunteerId" = v.id
      WHERE v."userId" = ${userId}
        AND vr."roleCode" = ${role}
        AND vr."entityType" = 'Construction Group'
        AND vr."entityId" = ${cgId}
        AND vr."endDate" IS NULL
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already has this role for this Construction Group' },
        { status: 409 }
      );
    }

    // Get volunteer record for this user
    const volunteer = await prisma.volunteer.findFirst({
      where: { 
        user: {
          id: userId
        }
      }
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: 'User must have a volunteer record to be assigned CG staff roles' },
        { status: 400 }
      );
    }

    // Get role config for full name
    const roleConfig = CG_STAFF_CONFIG[role as keyof typeof CG_STAFF_CONFIG];
    
    // Create the role assignment
    const roleAssignment = await prisma.volunteerRole.create({
      data: {
        volunteerId: volunteer.id,
        roleCategory: 'CG_OVERSIGHT',
        roleName: roleConfig.name,
        roleCode: role,
        entityType: 'Construction Group',
        entityId: cgId,
        isPrimary: false,
        startDate: new Date()
      }
    });

    // Fetch user details for response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    const response = {
      id: roleAssignment.id,
      userId,
      role: roleAssignment.roleCode,
      isActive: true,
      startDate: roleAssignment.startDate.toISOString(),
      endDate: null,
      user
    };

    console.log(`✅ Added ${role} to CG ${cgId}: ${userId}`);
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('CG Staff POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create CG staff assignment' },
      { status: 500 }
    );
  }
}
