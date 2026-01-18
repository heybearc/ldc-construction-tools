import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

// Get current deployment state
// Detects which server is PROD by checking the local IP address
export async function GET() {
  try {
    // Get the local IP address of this server
    let localIp = '';
    try {
      // Get IP from hostname -I (Linux)
      localIp = execSync('hostname -I 2>/dev/null || hostname -i 2>/dev/null', { encoding: 'utf8' }).trim().split(' ')[0];
    } catch {
      // Fallback: check network interfaces
      try {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
              localIp = iface.address;
              break;
            }
          }
          if (localIp) break;
        }
      } catch {
        localIp = '';
      }
    }
    
    // GREEN IPs: 10.92.3.25 (Container 135)
    // BLUE IPs: 10.92.3.23 (Container 133)
    const isGreenServer = localIp.includes('10.92.3.25');
    const isBlueServer = localIp.includes('10.92.3.23');
    
    // The server serving this request IS the PROD server
    // (because HAProxy routes production traffic here)
    const currentServer = isGreenServer ? 'GREEN' : isBlueServer ? 'BLUE' : 'UNKNOWN';
    const standbyServer = currentServer === 'GREEN' ? 'BLUE' : currentServer === 'BLUE' ? 'GREEN' : 'UNKNOWN';
    
    return NextResponse.json({
      prodServer: currentServer,
      standbyServer: standbyServer,
      prodIp: currentServer === 'GREEN' ? '10.92.3.25' : '10.92.3.23',
      standbyIp: standbyServer === 'GREEN' ? '10.92.3.25' : '10.92.3.23',
      localIp: localIp, // For debugging
      deployTarget: `STANDBY (${standbyServer})`,
      currentEnvironment: `PROD (${currentServer})`
    });
  } catch (error) {
    console.error('Failed to get deployment state:', error);
    return NextResponse.json({
      prodServer: 'UNKNOWN',
      standbyServer: 'UNKNOWN',
      deployTarget: 'STANDBY',
      currentEnvironment: 'UNKNOWN'
    });
  }
}
