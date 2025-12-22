import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getCGScope } from '@/lib/cg-scope';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope(session.user.id);
    if (!cgScope) {
      return NextResponse.json({ error: 'No construction group access' }, { status: 403 });
    }

    const body = await request.json();
    const { volunteers } = body;

    if (!Array.isArray(volunteers) || volunteers.length === 0) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    console.log(`Starting import of ${volunteers.length} volunteers for CG ${cgScope}`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < volunteers.length; i++) {
      const volunteer = volunteers[i];
      try {
        console.log(`Processing volunteer ${i + 1}:`, volunteer.first_name, volunteer.last_name);

        let crewId = null;
        let tradeTeamId = null;

        const hasTradeTeam = volunteer.trade_team && volunteer.trade_team.trim() !== '';
        const hasTradeCrew = volunteer.trade_crew && volunteer.trade_crew.trim() !== '';

        if (hasTradeTeam) {
          const tradeTeam = await prisma.tradeTeam.findFirst({ 
            where: { 
              name: volunteer.trade_team.trim(),
              constructionGroupId: cgScope.constructionGroupId
            } 
          });

          if (!tradeTeam) {
            throw new Error(`Trade team "${volunteer.trade_team}" not found`);
          }

          tradeTeamId = tradeTeam.id;

          if (hasTradeCrew) {
            const crew = await prisma.crew.findFirst({
              where: {
                name: volunteer.trade_crew.trim(),
                tradeTeamId: tradeTeam.id,
              },
            });

            if (!crew) {
              throw new Error(`Trade crew "${volunteer.trade_crew}" not found for team "${volunteer.trade_team}"`);
            }

            crewId = crew.id;
          }
        }

        const servingAsArray = volunteer.serving_as && volunteer.serving_as.trim() !== ''
          ? volunteer.serving_as.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
          : [];

        await prisma.volunteer.create({
          data: {
            firstName: volunteer.first_name,
            lastName: volunteer.last_name,
            baId: volunteer.ba_id || null,
            emailPersonal: volunteer.email_personal || null,
            emailJw: volunteer.email_jw || null,
            phone: volunteer.phone || null,
            congregation: volunteer.congregation || null,
            role: volunteer.role || 'Trade Crew Volunteer',
            servingAs: servingAsArray,
            isOverseer: volunteer.is_overseer === 'TRUE' || volunteer.is_overseer === true,
            isAssistant: volunteer.is_assistant === 'TRUE' || volunteer.is_assistant === true,
            isActive: volunteer.is_active === 'TRUE' || volunteer.is_active === true,
            crewId: crewId,
            tradeTeamId: tradeTeamId,
            constructionGroupId: cgScope.constructionGroupId,
          },
        });

        results.success++;
        console.log(`Successfully imported: ${volunteer.first_name} ${volunteer.last_name}`);
      } catch (error: any) {
        results.failed++;
        const errorMsg = `Row ${i + 1} (${volunteer.first_name} ${volunteer.last_name}): ${error.message}`;
        results.errors.push(errorMsg);
        console.error('Import error:', errorMsg);
      }
    }

    console.log(`Import completed: ${results.success} successful, ${results.failed} failed`);

    return NextResponse.json({
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      results,
    });
  } catch (error: any) {
    console.error('Volunteer import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
