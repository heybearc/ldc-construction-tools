import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET /api/v1/volunteers/available-roles - Get list of available volunteer roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = [
      { name: 'Trade Team Overseer' },
      { name: 'Trade Team Overseer Assistant' },
      { name: 'Trade Team Support' },
      { name: 'Trade Crew Overseer' },
      { name: 'Trade Crew Overseer Assistant' },
      { name: 'Trade Crew Support' },
      { name: 'Trade Crew Volunteer' },
    ];

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching available roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}
