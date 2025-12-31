import { NextResponse } from 'next/server';
import os from 'os';
import { promises as fs } from 'fs';
import path from 'path';

const STATE_FILE = '/opt/ldc-construction-tools/deployment-state.json';

export async function GET() {
  try {
    // Get the server's hostname to determine which server we're on
    const hostname = os.hostname();
    
    // Determine server based on environment or hostname
    // Container 133 (BLUE) = 10.92.3.23
    // Container 135 (GREEN) = 10.92.3.25
    
    let server: 'BLUE' | 'GREEN' = 'BLUE';
    let container = 133;
    let ip = '10.92.3.23';
    
    // Check if we can determine from hostname or environment
    if (hostname.includes('135') || process.env.SERVER_NAME === 'GREEN') {
      server = 'GREEN';
      container = 135;
      ip = '10.92.3.25';
    } else if (hostname.includes('133') || process.env.SERVER_NAME === 'BLUE') {
      server = 'BLUE';
      container = 133;
      ip = '10.92.3.23';
    }
    
    // Determine if this is LIVE or STANDBY by reading deployment state file
    let status: 'LIVE' | 'STANDBY' = 'STANDBY';
    
    try {
      // Try to read the deployment state file
      const stateData = await fs.readFile(STATE_FILE, 'utf-8');
      const state = JSON.parse(stateData);
      
      // Check which server is currently LIVE
      if (state.liveServer === server) {
        status = 'LIVE';
      } else {
        status = 'STANDBY';
      }
    } catch (error) {
      // If state file doesn't exist or can't be read, use environment variable
      if (process.env.SERVER_STATUS) {
        status = process.env.SERVER_STATUS as 'LIVE' | 'STANDBY';
      } else {
        // Default fallback: BLUE is typically LIVE initially
        status = server === 'BLUE' ? 'LIVE' : 'STANDBY';
      }
    }
    
    return NextResponse.json({
      server,
      status,
      ip,
      container,
      hostname
    });
  } catch (error) {
    console.error('Error getting server info:', error);
    return NextResponse.json(
      { error: 'Failed to get server info' },
      { status: 500 }
    );
  }
}
