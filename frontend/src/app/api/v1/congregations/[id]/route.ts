import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET /api/v1/congregations/[id] - Get single congregation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const congregation = await prisma.congregation.findUnique({
      where: { id: params.id },
    });

    if (!congregation) {
      return NextResponse.json({ error: 'Congregation not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: congregation.id,
      name: congregation.name,
      state: congregation.state,
      congregation_number: congregation.congregationNumber,
      coordinator_name: congregation.coordinatorName,
      coordinator_phone: congregation.coordinatorPhone,
      coordinator_email: congregation.coordinatorEmail,
      congregation_email: congregation.congregationEmail,
      is_active: congregation.isActive,
    });
  } catch (error) {
    console.error('Error fetching congregation:', error);
    return NextResponse.json({ error: 'Failed to fetch congregation' }, { status: 500 });
  }
}

// PATCH /api/v1/congregations/[id] - Update congregation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.state !== undefined) updateData.state = body.state || null;
    if (body.congregation_number !== undefined) updateData.congregationNumber = body.congregation_number || null;
    if (body.coordinator_name !== undefined) updateData.coordinatorName = body.coordinator_name || null;
    if (body.coordinator_phone !== undefined) updateData.coordinatorPhone = body.coordinator_phone || null;
    if (body.coordinator_email !== undefined) updateData.coordinatorEmail = body.coordinator_email || null;
    if (body.congregation_email !== undefined) updateData.congregationEmail = body.congregation_email || null;
    if (body.is_active !== undefined) updateData.isActive = body.is_active;

    const congregation = await prisma.congregation.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      id: congregation.id,
      name: congregation.name,
      state: congregation.state,
      congregation_number: congregation.congregationNumber,
      coordinator_name: congregation.coordinatorName,
      coordinator_phone: congregation.coordinatorPhone,
      coordinator_email: congregation.coordinatorEmail,
      congregation_email: congregation.congregationEmail,
      is_active: congregation.isActive,
    });
  } catch (error) {
    console.error('Error updating congregation:', error);
    return NextResponse.json({ error: 'Failed to update congregation' }, { status: 500 });
  }
}

// DELETE /api/v1/congregations/[id] - Delete congregation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.congregation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Congregation deleted successfully' });
  } catch (error) {
    console.error('Error deleting congregation:', error);
    return NextResponse.json({ error: 'Failed to delete congregation' }, { status: 500 });
  }
}
