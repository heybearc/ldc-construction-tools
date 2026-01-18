// API route for Regional Staff management (Region-level)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { REGIONAL_STAFF_CONFIG, validateRoleLimit } from '@/lib/oversight-types';

// GET: List all regional staff for a region
export async function GET(
  request: NextRequest,
  { params }: { params: { regionId: string } }
) {
  try {
    const { regionId } = params;

    // Query volunteer_roles table for regional staff roles
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
    }>>(Prisma.sql`
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
      FROM volunteer_roles vr
      JOIN volunteers v ON vr."volunteerId" = v.id
      LEFT JOIN "User" u ON u."volunteerId" = v.id
      WHERE vr."roleCode" IN ('ZO', 'ZOA', 'RO', 'ROA')
        AND (
          (vr."entityType" = 'Region' AND vr."entityId" = ${regionId})
          OR (vr."entityType" = 'Zone' AND vr."entityId" IN (
            SELECT "zoneId" FROM regions WHERE id = ${regionId}
          ))
        )
        AND vr."endDate" IS NULL
      ORDER BY 
        CASE vr."roleCode"
          WHEN 'ZO' THEN 1
          WHEN 'ZOA' THEN 2
          WHEN 'RO' THEN 3
          WHEN 'ROA' THEN 4
        END,
        vr."startDate" ASC
    `);

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
      ZO: staff.filter(s => s.role === 'ZO'),
      ZOA: staff.filter(s => s.role === 'ZOA'),
      RO: staff.filter(s => s.role === 'RO'),
      ROA: staff.filter(s => s.role === 'ROA')
    };

    return NextResponse.json({
      contacts: staff, // Keep same property name for OversightSection compatibility
      grouped,
      config: REGIONAL_STAFF_CONFIG
    });

  } catch (error) {
    console.error('Regional Staff GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regional staff' },
      { status: 500 }
    );
  }
}

// POST: Add a new regional staff member
export async function POST(
  request: NextRequest,
  { params }: { params: { regionId: string } }
) {
  try {
    const { regionId } = params;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!REGIONAL_STAFF_CONFIG[role as keyof typeof REGIONAL_STAFF_CONFIG]) {
      return NextResponse.json(
        { error: `Invalid role: ${role}. Valid roles: ZO, ZOA, RO, ROA` },
        { status: 400 }
      );
    }

    // Determine entity type and ID based on role
    const entityType = (role === 'ZO' || role === 'ZOA') ? 'Zone' : 'Region';
    let entityId = regionId;
    
    if (entityType === 'Zone') {
      // Get zone ID from region
      const region = await prisma.region.findUnique({
        where: { id: regionId },
        select: { zoneId: true }
      });
      if (!region?.zoneId) {
        return NextResponse.json({ error: 'Region has no zone assigned' }, { status: 400 });
      }
      entityId = region.zoneId;
    }

    // Check current count for this role
    const currentCount = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT COUNT(*) as count
      FROM volunteer_roles
      WHERE "roleCode" = ${role}
        AND "entityType" = ${entityType}
        AND "entityId" = ${entityId}
        AND "endDate" IS NULL
    `);

    const count = Number(currentCount[0]?.count || 0);
    const validation = validateRoleLimit(REGIONAL_STAFF_CONFIG, role, count);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // Check if user already has this role
    const existing = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT vr.id
      FROM volunteer_roles vr
      JOIN volunteers v ON vr."volunteerId" = v.id
      LEFT JOIN "User" u ON u."volunteerId" = v.id
      WHERE u.id = ${userId}
        AND vr."roleCode" = ${role}
        AND vr."entityType" = ${entityType}
        AND vr."entityId" = ${entityId}
        AND vr."endDate" IS NULL
      LIMIT 1
    `);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already has this role for this entity' },
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
        { error: 'User must have a volunteer record to be assigned regional staff roles' },
        { status: 400 }
      );
    }

    // Get role config for full name
    const roleConfig = REGIONAL_STAFF_CONFIG[role as keyof typeof REGIONAL_STAFF_CONFIG];
    
    // Create the role assignment
    const roleAssignment = await prisma.volunteerRole.create({
      data: {
        volunteerId: volunteer.id,
        roleCategory: 'CG_OVERSIGHT',
        roleName: roleConfig.name,
        roleCode: role,
        entityType: entityType,
        entityId: entityId,
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

    console.log(`✅ Added ${role} to ${entityType} ${entityId}: ${userId}`);
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Regional Staff POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create regional staff assignment' },
      { status: 500 }
    );
  }
}
