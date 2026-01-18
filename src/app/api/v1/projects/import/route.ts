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

    // Get the construction group with regionId
    const constructionGroup = await prisma.constructionGroup.findUnique({
      where: { id: cgScope.constructionGroupId },
      select: { regionId: true }
    });

    if (!constructionGroup) {
      return NextResponse.json({ error: 'Construction group not found' }, { status: 404 });
    }

    const body = await request.json();
    const { projects } = body;

    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    console.log(`Starting import of ${projects.length} projects for CG ${cgScope.constructionGroupId}`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      try {
        console.log(`Processing project ${i + 1}:`, project.project_name);

        await prisma.project.create({
          data: {
            name: project.project_name,
            projectNumber: project.project_number || null,
            description: project.description || null,
            location: project.location || null,
            projectType: project.project_type || 'Kingdom Hall',
            currentPhase: project.current_phase || null,
            status: project.status || 'PLANNING',
            startDate: project.start_date ? new Date(project.start_date) : null,
            endDate: project.end_date ? new Date(project.end_date) : null,
            jwSharepointUrl: project.jw_sharepoint_url || null,
            builderAssistantUrl: project.builder_assistant_url || null,
            regionId: constructionGroup.regionId,
            constructionGroupId: cgScope.constructionGroupId,
          },
        });

        results.success++;
        console.log(`Successfully imported: ${project.project_name}`);
      } catch (error: any) {
        results.failed++;
        const errorMsg = `Row ${i + 1} (${project.project_name}): ${error.message}`;
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
    console.error('Project import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
