import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://10.92.3.25:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    let endpoint = '';
    let requestBody = body;
    
    switch (action) {
      case 'reset-database':
        endpoint = '/admin/reset';
        break;
      case 'import-csv':
      case 'import':
        endpoint = '/admin/import-contacts';
        // Transform the request body to match backend expectations
        if (body.data) {
          requestBody = { contacts: body.data };
        }
        break;
      default:
        throw new Error(`Unknown admin action: ${action}`);
    }
    
    const response = await fetch(`${BACKEND_URL}/api/v1${endpoint}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to execute admin action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
