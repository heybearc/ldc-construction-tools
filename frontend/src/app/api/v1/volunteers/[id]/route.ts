import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCGScope } from '@/lib/cg-scope';

// GET /api/v1/volunteers/[id] - Get a single volunteer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope();

    const volunteer = await prisma.volunteer.findFirst({
      where: {
        id: params.id,
        constructionGroupId: cgScope.constructionGroupId,
      },
      include: {
        crew: {
          include: {
            tradeTeam: true,
          },
        },
        user: {
          select: { id: true, email: true, name: true },
        },
        roles: {
          where: {
            isActive: true,
          },
          include: {
            tradeTeam: {
              select: { id: true, name: true }
            },
            crew: {
              select: { id: true, name: true }
            }
          },
          orderBy: [
            { isPrimary: 'desc' },
            { startDate: 'desc' },
          ],
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: volunteer.id,
      first_name: volunteer.firstName,
      last_name: volunteer.lastName,
      ba_id: volunteer.baId,
      role: volunteer.role,
      phone: volunteer.phone,
      email_personal: volunteer.emailPersonal,
      email_jw: volunteer.emailJw,
      congregation: volunteer.congregation,
      serving_as: volunteer.servingAs,
      is_overseer: volunteer.isOverseer,
      is_assistant: volunteer.isAssistant,
      is_active: volunteer.isActive,
      trade_crew_id: volunteer.crewId,
      trade_team_id: volunteer.tradeTeamId,
      trade_crew_name: volunteer.crew?.name,
      trade_team_name: volunteer.crew?.tradeTeam?.name,
      user_id: volunteer.userId,
      has_user_account: !!volunteer.userId,
      roles: volunteer.roles,
    });
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteer' }, { status: 500 });
  }
}

// PATCH /api/v1/volunteers/[id] - Update a volunteer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope();
    const body = await request.json();
    console.log("PATCH volunteer body:", JSON.stringify(body));

    // Verify volunteer exists and belongs to CG
    const existing = await prisma.volunteer.findFirst({
      where: {
        id: params.id,
        constructionGroupId: cgScope.constructionGroupId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.first_name !== undefined) updateData.firstName = body.first_name;
    if (body.last_name !== undefined) updateData.lastName = body.last_name;
    if (body.ba_id !== undefined) updateData.baId = body.ba_id || null;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.email_personal !== undefined) updateData.emailPersonal = body.email_personal || null;
    if (body.email_jw !== undefined) updateData.emailJw = body.email_jw || null;
    if (body.congregation !== undefined) updateData.congregation = body.congregation || null;
    if (body.serving_as !== undefined) updateData.servingAs = body.serving_as;
    // Note: role field removed - now using VolunteerRole junction table
    if (body.is_active !== undefined) updateData.isActive = body.is_active;
    // Trade team/crew assignments
    if (body.trade_team_id !== undefined) updateData.tradeTeamId = body.trade_team_id || null;
    if (body.trade_crew_id !== undefined) updateData.crewId = body.trade_crew_id || null;

    const volunteer = await prisma.volunteer.update({
      where: { id: params.id },
      data: updateData,
      include: {
        crew: {
          include: {
            tradeTeam: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Handle user linking - update User.volunteerId instead of Volunteer.userId
    if (body.user_id !== undefined) {
      if (body.user_id) {
        // Link user to this volunteer
        await prisma.user.update({
          where: { id: body.user_id },
          data: { volunteerId: params.id },
        });
      } else {
        // Unlink any user from this volunteer
        const linkedUser = await prisma.user.findFirst({
          where: { volunteerId: params.id },
        });
        if (linkedUser) {
          await prisma.user.update({
            where: { id: linkedUser.id },
            data: { volunteerId: null },
          });
        }
      }
    }

    return NextResponse.json({
      id: volunteer.id,
      first_name: volunteer.firstName,
      last_name: volunteer.lastName,
      ba_id: volunteer.baId,
      role: volunteer.role,
      phone: volunteer.phone,
      email_personal: volunteer.emailPersonal,
      email_jw: volunteer.emailJw,
      congregation: volunteer.congregation,
      serving_as: volunteer.servingAs,
      is_overseer: volunteer.isOverseer,
      is_assistant: volunteer.isAssistant,
      is_active: volunteer.isActive,
      trade_crew_id: volunteer.crewId,
      trade_team_id: volunteer.tradeTeamId,
      trade_crew_name: volunteer.crew?.name,
      trade_team_name: volunteer.crew?.tradeTeam?.name,
    });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    return NextResponse.json({ error: 'Failed to update volunteer' }, { status: 500 });
  }
}

// DELETE /api/v1/volunteers/[id] - Soft delete a volunteer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope();

    // Verify volunteer exists and belongs to CG
    const existing = await prisma.volunteer.findFirst({
      where: {
        id: params.id,
        constructionGroupId: cgScope.constructionGroupId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.volunteer.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    return NextResponse.json({ error: 'Failed to delete volunteer' }, { status: 500 });
  }
}
