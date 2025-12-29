// API route for managing construction groups
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { STANDARD_TRADE_TEAMS } from '@/lib/standard-trade-teams';

// GET: List all construction groups
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const constructionGroups = await prisma.constructionGroup.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        regionId: true,
        isActive: true
      },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json({ constructionGroups });

  } catch (error) {
    console.error('Get construction groups error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch construction groups' },
      { status: 500 }
    );
  }
}

// POST: Create a new construction group (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can create construction groups' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, regionId } = body;

    if (!code || !regionId) {
      return NextResponse.json(
        { error: 'Code and regionId are required' },
        { status: 400 }
      );
    }

    // Check if region exists
    const region = await prisma.region.findUnique({ where: { id: regionId } });
    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    // Check if code already exists
    const existing = await prisma.constructionGroup.findUnique({ 
      where: { code },
      include: {
        tradeTeams: {
          include: {
            crews: true
          }
        }
      }
    });

    let constructionGroup;
    let totalCrews = 0;
    let isReactivation = false;

    if (existing) {
      if (existing.isActive) {
        // CG exists and is active - cannot create
        return NextResponse.json(
          { error: `Construction Group with code "${code}" already exists` },
          { status: 409 }
        );
      }

      // CG exists but is inactive - reactivate it
      isReactivation = true;
      
      // Reactivate the CG
      constructionGroup = await prisma.constructionGroup.update({
        where: { id: existing.id },
        data: {
          name: name || existing.name,
          regionId,
          isActive: true,
        },
        include: {
          tradeTeams: {
            include: {
              crews: true
            }
          }
        }
      });

      // Reactivate existing trade teams and crews
      await prisma.tradeTeam.updateMany({
        where: { constructionGroupId: existing.id },
        data: { isActive: true }
      });

      await prisma.crew.updateMany({
        where: { 
          tradeTeam: {
            constructionGroupId: existing.id
          }
        },
        data: { isActive: true }
      });

      // Check if we need to add any missing standard trade teams
      const existingTeamNames = existing.tradeTeams.map(t => t.name);
      const missingTeams = STANDARD_TRADE_TEAMS.filter(
        team => !existingTeamNames.includes(team.name)
      );

      if (missingTeams.length > 0) {
        // Create missing trade teams with their crews
        await prisma.tradeTeam.createMany({
          data: missingTeams.flatMap(team => ({
            name: team.name,
            description: team.description,
            constructionGroupId: existing.id,
            isActive: true,
          }))
        });

        // Get the newly created teams to add their crews
        const newTeams = await prisma.tradeTeam.findMany({
          where: {
            constructionGroupId: existing.id,
            name: { in: missingTeams.map(t => t.name) }
          }
        });

        // Create crews for the new teams
        for (const team of newTeams) {
          const teamTemplate = STANDARD_TRADE_TEAMS.find(t => t.name === team.name);
          if (teamTemplate) {
            await prisma.crew.createMany({
              data: teamTemplate.crews.map(crew => ({
                name: crew.name,
                scopeOfWork: crew.scopeOfWork,
                isRequired: crew.isRequired,
                tradeTeamId: team.id,
                isActive: true
              }))
            });
          }
        }
      }

      // Refresh the CG data
      constructionGroup = await prisma.constructionGroup.findUnique({
        where: { id: existing.id },
        include: {
          tradeTeams: {
            include: {
              crews: true
            }
          }
        }
      })!;

      totalCrews = constructionGroup!.tradeTeams.reduce((sum, t) => sum + t.crews.length, 0);
      console.log(`✅ Reactivated CG "${code}" with ${constructionGroup!.tradeTeams.length} trade teams and ${totalCrews} crews`);

    } else {
      // Create new construction group with standard trade teams and crews
      constructionGroup = await prisma.constructionGroup.create({
        data: {
          code,
          name: name || code,
          regionId,
          isActive: true,
          // Auto-create standard trade teams with their crews
          tradeTeams: {
            create: STANDARD_TRADE_TEAMS.map(team => ({
              name: team.name,
              description: team.description,
              isActive: true,
              // Auto-create standard crews for each trade team
              crews: {
                create: team.crews.map(crew => ({
                  name: crew.name,
                  scopeOfWork: crew.scopeOfWork,
                  isRequired: crew.isRequired,
                  isActive: true
                }))
              }
            }))
          }
        },
        include: {
          tradeTeams: {
            include: {
              crews: true
            }
          }
        }
      });

      totalCrews = constructionGroup.tradeTeams.reduce((sum, t) => sum + t.crews.length, 0);
      console.log(`✅ Created CG "${code}" with ${constructionGroup.tradeTeams.length} trade teams and ${totalCrews} crews`);
    }

    return NextResponse.json({ 
      constructionGroup,
      message: isReactivation 
        ? `Reactivated with ${constructionGroup!.tradeTeams.length} trade teams and ${totalCrews} crews`
        : `Created with ${constructionGroup!.tradeTeams.length} trade teams and ${totalCrews} crews`
    }, { status: 201 });

  } catch (error) {
    console.error('Create construction group error:', error);
    return NextResponse.json(
      { error: 'Failed to create construction group' },
      { status: 500 }
    );
  }
}
