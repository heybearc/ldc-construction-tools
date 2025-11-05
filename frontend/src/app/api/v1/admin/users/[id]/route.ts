import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// PATCH /api/v1/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, email, role, adminLevel, status } = body;
    
    console.log('Update user request:', { name, email, role, adminLevel, status });
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        role,
        adminLevel: adminLevel === '' ? null : adminLevel, // Convert empty string to null
        status,
      },
    });
    
    console.log('User updated successfully:', updatedUser.id, updatedUser.role, updatedUser.adminLevel, updatedUser.status);
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
