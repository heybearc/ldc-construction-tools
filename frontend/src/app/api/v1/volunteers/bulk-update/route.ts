import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCGScope } from '@/lib/cg-scope';
import { canManageVolunteers } from '@/lib/permissions';

// POST /api/v1/volunteers/bulk-update - Bulk update volunteers
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (!canManageVolunteers(session.user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cgScope = await getCGScope();
    if (!cgScope) {
      return NextResponse.json({ error: 'Construction Group scope required' }, { status: 400 });
    }

    const body = await request.json();
    const { volunteer_ids, updates } = body;

    if (!volunteer_ids || !Array.isArray(volunteer_ids) || volunteer_ids.length === 0) {
      return NextResponse.json({ error: 'volunteer_ids array is required' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'updates object is required' }, { status: 400 });
    }

    // Verify all volunteers belong to the user's CG
    const volunteers = await prisma.volunteer.findMany({
      where: {
        id: { in: volunteer_ids },
        constructionGroupId: cgScope.constructionGroupId,
      },
    });

    if (volunteers.length !== volunteer_ids.length) {
      return NextResponse.json({ error: 'Some volunteers not found or not accessible' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    // Simple field updates
    if (updates.congregation !== undefined) {
      updateData.congregation = updates.congregation || null;
    }
    if (updates.is_overseer !== undefined) {
      updateData.isOverseer = updates.is_overseer;
    }
    if (updates.is_assistant !== undefined) {
      updateData.isAssistant = updates.is_assistant;
    }
    if (updates.is_active !== undefined) {
      updateData.isActive = updates.is_active;
    }
    if (updates.trade_team_id !== undefined) {
      updateData.tradeTeamId = updates.trade_team_id || null;
    }
    if (updates.crew_id !== undefined) {
      updateData.crewId = updates.crew_id || null;
    }

    // Handle serving_as add/remove
    if (updates.serving_as_add || updates.serving_as_remove) {
      // For each volunteer, we need to update their serving_as array
      const updatePromises = volunteer_ids.map(async (volunteerId) => {
        const volunteer = await prisma.volunteer.findUnique({
          where: { id: volunteerId },
          select: { servingAs: true },
        });

        if (!volunteer) return;

        let servingAs = [...(volunteer.servingAs || [])];

        // Add roles
        if (updates.serving_as_add && Array.isArray(updates.serving_as_add)) {
          updates.serving_as_add.forEach((role: string) => {
            if (!servingAs.includes(role)) {
              servingAs.push(role);
            }
          });
        }

        // Remove roles
        if (updates.serving_as_remove && Array.isArray(updates.serving_as_remove)) {
          servingAs = servingAs.filter((role) => !updates.serving_as_remove.includes(role));
        }

        return prisma.volunteer.update({
          where: { id: volunteerId },
          data: { servingAs },
        });
      });

      await Promise.all(updatePromises);
    }

    // Apply simple field updates if any
    if (Object.keys(updateData).length > 0) {
      await prisma.volunteer.updateMany({
        where: {
          id: { in: volunteer_ids },
          constructionGroupId: cgScope.constructionGroupId,
        },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      updated_count: volunteer_ids.length,
      message: `Successfully updated ${volunteer_ids.length} volunteers`,
    });
  } catch (error) {
    console.error('Error bulk updating volunteers:', error);
    return NextResponse.json({ error: 'Failed to bulk update volunteers' }, { status: 500 });
  }
}
