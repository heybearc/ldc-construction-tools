import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authConfig } from '../../../../../../auth.config';

const prisma = new PrismaClient();

// GET /api/v1/role-assignments/[id] - Get specific role assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleAssignment = await prisma.roleAssignment.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
            regionId: true,
            zoneId: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            type: true,
            scope: true,
            level: true,
            permissions: true
          }
        }
      }
    });

    if (!roleAssignment) {
      return NextResponse.json(
        { error: 'Role assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: roleAssignment
    });

  } catch (error) {
    console.error('Role assignment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role assignment' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/role-assignments/[id] - Update role assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      assignmentType,
      scope,
      startDate,
      endDate,
      isActive,
      consultationRequired,
      consultationStatus,
      notes
    } = body;

    // Get existing assignment for logging
    const existingAssignment = await prisma.roleAssignment.findUnique({
      where: { id: params.id }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Role assignment not found' },
        { status: 404 }
      );
    }

    // Update role assignment
    const updatedAssignment = await prisma.roleAssignment.update({
      where: { id: params.id },
      data: {
        assignmentType: assignmentType || existingAssignment.assignmentType,
        scope: scope !== undefined ? scope : existingAssignment.scope,
        startDate: startDate ? new Date(startDate) : existingAssignment.startDate,
        endDate: endDate ? new Date(endDate) : existingAssignment.endDate,
        isActive: isActive !== undefined ? isActive : existingAssignment.isActive,
        consultationRequired: consultationRequired !== undefined ? consultationRequired : existingAssignment.consultationRequired,
        consultationStatus: consultationStatus || existingAssignment.consultationStatus,
        notes: notes !== undefined ? notes : existingAssignment.notes,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            scope: true
          }
        }
      }
    });

    // Log the role assignment change
    await prisma.roleChangeLog.create({
      data: {
        roleAssignmentId: params.id,
        userId: existingAssignment.userId,
        roleId: existingAssignment.roleId,
        action: 'modified',
        previousData: JSON.stringify(existingAssignment),
        newData: JSON.stringify(updatedAssignment),
        reason: notes || 'Role assignment updated',
        performedBy: session.user.id!
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedAssignment,
      message: 'Role assignment updated successfully'
    });

  } catch (error) {
    console.error('Role assignment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update role assignment' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/role-assignments/[id] - Remove role assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing assignment for logging
    const existingAssignment = await prisma.roleAssignment.findUnique({
      where: { id: params.id }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Role assignment not found' },
        { status: 404 }
      );
    }

    // Delete role assignment
    await prisma.roleAssignment.delete({
      where: { id: params.id }
    });

    // Log the role assignment removal
    await prisma.roleChangeLog.create({
      data: {
        roleAssignmentId: params.id,
        userId: existingAssignment.userId,
        roleId: existingAssignment.roleId,
        action: 'removed',
        previousData: JSON.stringify(existingAssignment),
        reason: 'Role assignment removed',
        performedBy: session.user.id!
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Role assignment removed successfully'
    });

  } catch (error) {
    console.error('Role assignment deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to remove role assignment' },
      { status: 500 }
    );
  }
}
