import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getCGScope } from '@/lib/cg-scope';

// PATCH - Update Construction Group
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to manage hierarchy
    const cgScope = await getCGScope();
    if (!cgScope?.canViewAllBranches) {
      return NextResponse.json(
        { error: 'Insufficient permissions - SUPER_ADMIN required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, description, regionId } = body;

    // Validate required fields
    if (!code || !name || !regionId) {
      return NextResponse.json(
        { error: 'Code, name, and regionId are required' },
        { status: 400 }
      );
    }

    // Check if CG exists
    const existingCG = await prisma.constructionGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            volunteers: true,
            tradeTeams: true,
            projects: true,
          }
        }
      }
    });

    if (!existingCG) {
      return NextResponse.json(
        { error: 'Construction Group not found' },
        { status: 404 }
      );
    }

    // Check if code is being changed and if it's already in use
    if (code !== existingCG.code) {
      const codeInUse = await prisma.constructionGroup.findFirst({
        where: {
          code,
          id: { not: params.id }
        }
      });

      if (codeInUse) {
        return NextResponse.json(
          { error: 'Construction Group code already in use' },
          { status: 409 }
        );
      }
    }

    // Validate region exists
    const region = await prisma.region.findUnique({
      where: { id: regionId }
    });

    if (!region) {
      return NextResponse.json(
        { error: 'Region not found' },
        { status: 404 }
      );
    }

    // Update the Construction Group
    const updatedCG = await prisma.constructionGroup.update({
      where: { id: params.id },
      data: {
        code,
        name,
        description: description || null,
        regionId,
      },
      include: {
        region: {
          include: {
            zone: {
              include: {
                branch: true
              }
            }
          }
        },
        _count: {
          select: {
            users: true,
            volunteers: true,
            tradeTeams: true,
            projects: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Construction Group updated successfully',
      constructionGroup: updatedCG
    });

  } catch (error) {
    console.error('Update Construction Group error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update Construction Group',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete (deactivate) Construction Group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to manage hierarchy
    const cgScope = await getCGScope();
    if (!cgScope?.canViewAllBranches) {
      return NextResponse.json(
        { error: 'Insufficient permissions - SUPER_ADMIN required' },
        { status: 403 }
      );
    }

    // Check if CG exists and get counts
    const existingCG = await prisma.constructionGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            volunteers: true,
            tradeTeams: true,
            projects: true,
          }
        }
      }
    });

    if (!existingCG) {
      return NextResponse.json(
        { error: 'Construction Group not found' },
        { status: 404 }
      );
    }

    // Check if CG has active dependencies
    const hasActiveDependencies = 
      existingCG._count.users > 0 ||
      existingCG._count.volunteers > 0 ||
      existingCG._count.tradeTeams > 0 ||
      existingCG._count.projects > 0;

    if (hasActiveDependencies) {
      return NextResponse.json(
        { 
          error: 'Cannot delete Construction Group with active dependencies',
          details: {
            users: existingCG._count.users,
            volunteers: existingCG._count.volunteers,
            tradeTeams: existingCG._count.tradeTeams,
            projects: existingCG._count.projects,
          },
          message: 'Please reassign or remove all users, volunteers, trade teams, and projects before deleting this Construction Group.'
        },
        { status: 409 }
      );
    }

    // Soft delete by setting isActive to false
    const deactivatedCG = await prisma.constructionGroup.update({
      where: { id: params.id },
      data: {
        isActive: false,
      }
    });

    return NextResponse.json({
      message: 'Construction Group deactivated successfully',
      constructionGroup: deactivatedCG
    });

  } catch (error) {
    console.error('Delete Construction Group error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete Construction Group',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
