import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logUpdate, logDelete } from '@/lib/audit';

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
    const { name, email, role, constructionGroupId, adminLevel, status, password } = body;
    
    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { name: true, email: true, role: true, constructionGroupId: true, adminLevel: true, status: true, emailVerified: true }
    });
    
    // Build update data
    const updateData: any = {
      name,
      email,
      role,
      constructionGroupId: constructionGroupId === '' ? null : constructionGroupId,
      adminLevel: adminLevel === '' ? null : adminLevel,
      status,
    };

    // Handle password change if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    
    // If status is being changed to ACTIVE and user is not yet verified,
    // set emailVerified to activate them
    if (status === 'ACTIVE' && !currentUser?.emailVerified) {
      updateData.emailVerified = new Date();
    }
    
    // If status is being changed to INVITED, clear emailVerified
    if (status === 'INVITED') {
      updateData.emailVerified = null;
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });
    
    // Sync volunteer data if user is linked to a volunteer
    try {
      if (updatedUser.volunteerId) {
        const volunteerData: any = {};
        
        // Sync name changes
        if (name) {
          const nameParts = name.split(' ');
          volunteerData.firstName = nameParts[0] || '';
          volunteerData.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Sync email changes (volunteer email is source of truth)
        if (email && email !== currentUser?.email) {
          volunteerData.emailPersonal = email;
        }
        
        // Sync status
        volunteerData.isActive = status === 'ACTIVE';
        
        // Update volunteer if we have changes
        if (Object.keys(volunteerData).length > 0) {
          await (prisma as any).volunteer?.update({
            where: { id: updatedUser.volunteerId },
            data: volunteerData
          }).catch((err: any) => {
            console.log('Volunteer sync skipped (table may not exist yet):', err.message);
          });
        }
      }
    } catch (volunteerSyncError) {
      // Non-critical error - volunteer sync can fail if schema not fully deployed
      console.log('Volunteer sync skipped:', volunteerSyncError);
    }
    
    // Log the update to audit trail
    await logUpdate(
      session?.user?.id || null,
      'USER',
      params.id,
      { name: currentUser?.name, email: currentUser?.email, role: currentUser?.role, adminLevel: currentUser?.adminLevel, status: currentUser?.status },
      { name, email, role, adminLevel, status }
    );
    
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
    
    // Get user data for audit log before deletion
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: { name: true, email: true, role: true, status: true }
    });
    
    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    });
    
    // Log the deletion to audit trail
    await logDelete(
      session?.user?.id || null,
      'USER',
      params.id,
      { name: userToDelete?.name, email: userToDelete?.email, role: userToDelete?.role, status: userToDelete?.status }
    );
    
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
