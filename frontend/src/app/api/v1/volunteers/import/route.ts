import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getCGScope } from '@/lib/cg-scope';

// Map legacy role names to organizational role codes
const ROLE_MAPPING: Record<string, { roleCode: string; roleCategory: string; roleName: string }> = {
  'Trade Team Overseer': { roleCode: 'TTO', roleCategory: 'TRADE_TEAM', roleName: 'Trade Team Overseer' },
  'Trade Team Overseer Assistant': { roleCode: 'TTOA', roleCategory: 'TRADE_TEAM', roleName: 'Trade Team Overseer Assistant' },
  'Trade Team Support': { roleCode: 'TT-Support', roleCategory: 'TRADE_TEAM', roleName: 'Trade Team Support' },
  'Trade Crew Overseer': { roleCode: 'TCO', roleCategory: 'TRADE_CREW', roleName: 'Trade Crew Overseer' },
  'Trade Crew Overseer Assistant': { roleCode: 'TCOA', roleCategory: 'TRADE_CREW', roleName: 'Trade Crew Overseer Assistant' },
  'Trade Crew Support': { roleCode: 'TC-Support', roleCategory: 'TRADE_CREW', roleName: 'Trade Crew Support' },
  'Trade Crew Volunteer': { roleCode: 'TCV', roleCategory: 'TRADE_CREW', roleName: 'Trade Crew Volunteer' },
  'Personnel Contact': { roleCode: 'PC', roleCategory: 'REGION_SUPPORT_SERVICES', roleName: 'Personnel Contact' },
  'Personnel Contact Assistant': { roleCode: 'PCA', roleCategory: 'REGION_SUPPORT_SERVICES', roleName: 'Personnel Contact Assistant' },
  'Personnel Contact Support': { roleCode: 'PC-Support', roleCategory: 'REGION_SUPPORT_SERVICES', roleName: 'Personnel Contact Support' },
};

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

        // Create volunteer with basic info only (no legacy role field)
        const newVolunteer = await prisma.volunteer.create({
          data: {
            firstName: volunteer.first_name,
            lastName: volunteer.last_name,
            baId: volunteer.ba_id || null,
            emailPersonal: volunteer.email_personal || null,
            emailJw: volunteer.email_jw || null,
            phone: volunteer.phone || null,
            congregation: volunteer.congregation || null,
            servingAs: servingAsArray,
            isActive: volunteer.is_active !== 'FALSE' && volunteer.is_active !== false,
            crewId: crewId,
            tradeTeamId: tradeTeamId,
            constructionGroupId: cgScope.constructionGroupId,
          },
        });

        // Create organizational role if role is provided
        if (volunteer.role && volunteer.role.trim() !== '') {
          const roleMapping = ROLE_MAPPING[volunteer.role.trim()];
          if (roleMapping) {
            await prisma.volunteerRole.create({
              data: {
                volunteerId: newVolunteer.id,
                roleCategory: roleMapping.roleCategory,
                roleName: roleMapping.roleName,
                roleCode: roleMapping.roleCode,
                entityType: roleMapping.roleCategory === 'TRADE_TEAM' ? 'TRADE_TEAM' : 
                           roleMapping.roleCategory === 'TRADE_CREW' ? 'CREW' : null,
                entityId: roleMapping.roleCategory === 'TRADE_TEAM' ? tradeTeamId :
                         roleMapping.roleCategory === 'TRADE_CREW' ? crewId : null,
                tradeTeamId: tradeTeamId,
                crewId: roleMapping.roleCategory === 'TRADE_CREW' ? crewId : null,
                isPrimary: true,
                isActive: true,
                startDate: new Date(),
              },
            });
          } else {
            console.warn(`Unknown role "${volunteer.role}" - skipping role assignment`);
          }
        }

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
