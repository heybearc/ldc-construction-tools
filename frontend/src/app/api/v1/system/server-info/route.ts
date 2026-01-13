import { NextResponse } from 'next/server';
import os from 'os';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

// Force dynamic rendering - do not cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const execAsync = promisify(exec);
const STATE_FILE = '/opt/ldc-construction-tools/deployment-state.json';

export async function GET() {
  try {
    // Determine which server we're on by checking local IP
    let server: 'BLUE' | 'GREEN' = 'BLUE';
    let container = 133;
    let ip = '10.92.3.23';
    
    try {
      const { stdout } = await execAsync('hostname -I 2>/dev/null || hostname -i 2>/dev/null');
      const localIp = stdout.trim().split(' ')[0];
      
      if (localIp.includes('10.92.3.25')) {
        server = 'GREEN';
        container = 135;
        ip = '10.92.3.25';
      } else if (localIp.includes('10.92.3.23')) {
        server = 'BLUE';
        container = 133;
        ip = '10.92.3.23';
      }
    } catch (error) {
      // Fallback to environment variable if IP detection fails
      if (process.env.SERVER_NAME === 'GREEN') {
        server = 'GREEN';
        container = 135;
        ip = '10.92.3.25';
      }
    }
    
    // Determine LIVE/STANDBY status from state file
    // The state file is updated by the MCP deployment tool during traffic switches
    let status: 'LIVE' | 'STANDBY' = 'STANDBY';
    let statusSource = 'default';
    
    try {
      const stateData = await fs.readFile(STATE_FILE, 'utf-8');
      const state = JSON.parse(stateData);
      
      status = state.liveServer === server ? 'LIVE' : 'STANDBY';
      statusSource = 'statefile';
    } catch (error) {
      // Fallback to environment variable if state file unavailable
      if (process.env.SERVER_STATUS) {
        status = process.env.SERVER_STATUS as 'LIVE' | 'STANDBY';
        statusSource = 'env';
      }
      console.error('Failed to read state file:', error);
    }
    
    return NextResponse.json({
      server,
      status,
      ip,
      container,
      hostname: os.hostname(),
      statusSource // For debugging
    });
  } catch (error) {
    console.error('Error getting server info:', error);
    return NextResponse.json(
      { error: 'Failed to get server info' },
      { status: 500 }
    );
  }
}
