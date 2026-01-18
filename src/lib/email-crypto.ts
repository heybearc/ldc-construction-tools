import crypto from 'crypto';

// Use a secret key from environment or a default (should be in .env in production)
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'ldc-tools-email-secret-key-32ch';
const ALGORITHM = 'aes-256-cbc';

export function encryptPassword(password: string): string {
  // Ensure key is 32 bytes for AES-256
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptPassword(encryptedPassword: string): string {
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const parts = encryptedPassword.split(':');
    
    if (parts.length !== 2) {
      // If it's not in the new format, return as-is (backward compatibility)
      return encryptedPassword;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return as-is if decryption fails (backward compatibility)
    return encryptedPassword;
  }
}
