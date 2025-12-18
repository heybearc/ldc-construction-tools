import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// PATCH /api/v1/projects/[id]/congregations/[assignmentId] - Update assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.food_contact) {
      if (body.food_contact.name !== undefined) updateData.foodContactName = body.food_contact.name || null;
      if (body.food_contact.phone !== undefined) updateData.foodContactPhone = body.food_contact.phone || null;
      if (body.food_contact.email !== undefined) updateData.foodContactEmail = body.food_contact.email || null;
    }
    if (body.volunteer_contact) {
      if (body.volunteer_contact.name !== undefined) updateData.volunteerContactName = body.volunteer_contact.name || null;
      if (body.volunteer_contact.phone !== undefined) updateData.volunteerContactPhone = body.volunteer_contact.phone || null;
      if (body.volunteer_contact.email !== undefined) updateData.volunteerContactEmail = body.volunteer_contact.email || null;
    }
    if (body.security_contact) {
      if (body.security_contact.name !== undefined) updateData.securityContactName = body.security_contact.name || null;
      if (body.security_contact.phone !== undefined) updateData.securityContactPhone = body.security_contact.phone || null;
      if (body.security_contact.email !== undefined) updateData.securityContactEmail = body.security_contact.email || null;
    }
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.is_active !== undefined) updateData.isActive = body.is_active;

    const assignment = await prisma.projectCongregationAssignment.update({
      where: { id: params.assignmentId },
      data: updateData,
      include: { congregation: true },
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
    });
  } catch (error) {
    console.error('Error updating congregation assignment:', error);
    return NextResponse.json({ error: 'Failed to update congregation assignment' }, { status: 500 });
  }
}

// DELETE /api/v1/projects/[id]/congregations/[assignmentId] - Remove congregation from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.projectCongregationAssignment.delete({
      where: { id: params.assignmentId },
    });

    return NextResponse.json({ message: 'Congregation removed from project' });
  } catch (error) {
    console.error('Error removing congregation from project:', error);
    return NextResponse.json({ error: 'Failed to remove congregation from project' }, { status: 500 });
  }
}
