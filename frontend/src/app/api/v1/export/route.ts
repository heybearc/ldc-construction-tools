import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://10.92.3.25:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'contacts';
    
    // Map frontend type to backend endpoint
    let endpoint = type;
    if (type === 'volunteers') {
      endpoint = 'contacts'; // Backend uses 'contacts' for volunteer export
    }
    
    console.log(`Export request: type=${type}, endpoint=${endpoint}`);
    
    const response = await fetch(`${BACKEND_URL}/api/v1/export/${endpoint}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    console.log(`Backend export response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend export error:', errorText);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    console.log(`Export file size: ${buffer.byteLength} bytes`);
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${type}-export.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
