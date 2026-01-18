import fs from 'fs';
import path from 'path';

/**
 * Extract the first feature/highlight from the latest release in RELEASE_NOTES.md
 * Returns a concise one-line description for the release banner
 */
export function getLatestReleaseHighlight(): string {
  try {
    const releaseNotesPath = path.join(process.cwd(), '..', 'RELEASE_NOTES.md');
    
    // Check if file exists
    if (!fs.existsSync(releaseNotesPath)) {
      return 'Check out the latest updates and improvements!';
    }

    const content = fs.readFileSync(releaseNotesPath, 'utf-8');
    const lines = content.split('\n');

    let inFirstRelease = false;
    let inFeaturesSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Find first release (starts with ##)
      if (line.startsWith('## v') && !inFirstRelease) {
        inFirstRelease = true;
        continue;
      }

      // If we're in the first release, look for features section
      if (inFirstRelease) {
        // Stop at next release
        if (line.startsWith('## v')) {
          break;
        }

        // Look for features/highlights sections
        if (line.includes('🎯') || line.includes('✨') || line.includes('New Features') || line.includes('Highlights')) {
          inFeaturesSection = true;
          continue;
        }

        // Stop at next major section
        if (inFeaturesSection && line.startsWith('###') && !line.includes('Features') && !line.includes('Highlights')) {
          break;
        }

        // Extract first feature bullet point
        if (inFeaturesSection && line.startsWith('**') && line.includes('**')) {
          // Extract text between ** markers
          const match = line.match(/\*\*([^*]+)\*\*/);
          if (match && match[1]) {
            return match[1].trim();
          }
        }

        // Also check for simple bullet points
        if (inFeaturesSection && (line.startsWith('- ') || line.startsWith('* '))) {
          const text = line.substring(2).trim();
          // Remove markdown formatting
          const cleaned = text.replace(/\*\*/g, '').replace(/`/g, '');
          if (cleaned && cleaned.length > 10 && cleaned.length < 150) {
            return cleaned;
          }
        }
      }
    }

    // Fallback: return default message
    return 'Check out the latest updates and improvements!';
  } catch (error) {
    console.error('Error reading release notes:', error);
    return 'Check out the latest updates and improvements!';
  }
}
