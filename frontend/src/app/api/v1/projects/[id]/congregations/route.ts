import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET /api/v1/projects/[id]/congregations - Get project's supporting congregations
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignments = await prisma.projectCongregationAssignment.findMany({
      where: { 
        projectId: params.id,
        isActive: true,
      },
      include: {
        congregation: true,
      },
      orderBy: { congregation: { name: 'asc' } },
    });

    const transformed = assignments.map(a => ({
      id: a.id,
      project_id: a.projectId,
      congregation_id: a.congregationId,
      congregation: {
        id: a.congregation.id,
        name: a.congregation.name,
        state: a.congregation.state,
        congregation_number: a.congregation.congregationNumber,
        coordinator_name: a.congregation.coordinatorName,
        coordinator_phone: a.congregation.coordinatorPhone,
        coordinator_email: a.congregation.coordinatorEmail,
        congregation_email: a.congregation.congregationEmail,
      },
      food_contact: {
        name: a.foodContactName,
        phone: a.foodContactPhone,
        email: a.foodContactEmail,
      },
      volunteer_contact: {
        name: a.volunteerContactName,
        phone: a.volunteerContactPhone,
        email: a.volunteerContactEmail,
      },
      security_contact: {
        name: a.securityContactName,
        phone: a.securityContactPhone,
        email: a.securityContactEmail,
      },
      notes: a.notes,
      is_active: a.isActive,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching project congregations:', error);
    return NextResponse.json({ error: 'Failed to fetch project congregations' }, { status: 500 });
  }
}

// POST /api/v1/projects/[id]/congregations - Add congregation to project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const assignment = await prisma.projectCongregationAssignment.create({
      data: {
        projectId: params.id,
        congregationId: body.congregation_id,
        foodContactName: body.food_contact?.name || null,
        foodContactPhone: body.food_contact?.phone || null,
        foodContactEmail: body.food_contact?.email || null,
        volunteerContactName: body.volunteer_contact?.name || null,
        volunteerContactPhone: body.volunteer_contact?.phone || null,
        volunteerContactEmail: body.volunteer_contact?.email || null,
        securityContactName: body.security_contact?.name || null,
        securityContactPhone: body.security_contact?.phone || null,
        securityContactEmail: body.security_contact?.email || null,
        notes: body.notes || null,
      },
      include: {
        congregation: true,
      },
    });

    return NextResponse.json({
      id: assignment.id,
      project_id: assignment.projectId,
      congregation_id: assignment.congregationId,
      congregation: {
        id: assignment.congregation.id,
        name: assignment.congregation.name,
        state: assignment.congregation.state,
      },
      food_contact: {
        name: assignment.foodContactName,
        phone: assignment.foodContactPhone,
        email: assignment.foodContactEmail,
      },
      volunteer_contact: {
        name: assignment.volunteerContactName,
        phone: assignment.volunteerContactPhone,
        email: assignment.volunteerContactEmail,
      },
      security_contact: {
        name: assignment.securityContactName,
        phone: assignment.securityContactPhone,
        email: assignment.securityContactEmail,
      },
      notes: assignment.notes,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding congregation to project:', error);
    return NextResponse.json({ error: 'Failed to add congregation to project' }, { status: 500 });
  }
}
