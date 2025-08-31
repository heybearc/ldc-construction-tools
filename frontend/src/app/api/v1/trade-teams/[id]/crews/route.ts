import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://10.92.3.25:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Trade team crews API route called:', request.url, 'Team ID:', params.id);
  
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/trade-teams/${params.id}/crews${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching from backend:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend data received:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade team crews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
