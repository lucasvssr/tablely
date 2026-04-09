import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Use a secret key from environment variables or a default one for dev
const ALGORITHM_GCM = 'aes-256-gcm';
const ALGORITHM_CBC = 'aes-256-cbc'; // Keep for backward compatibility
const SECRET_KEY = process.env.ENCRYPTION_SECRET!;
const SALT = process.env.ENCRYPTION_SALT!;

if (!SECRET_KEY || !SALT) {
  throw new Error(
    'ENCRYPTION_SECRET or ENCRYPTION_SALT is missing from your environment variables.',
  );
}

/**
 * @name encrypt
 * @description Encrypts a string using AES-256-GCM.
 */
export function encrypt(text: string): string {
    const iv = randomBytes(12); // GCM standard IV length is 12 bytes
    const key = scryptSync(SECRET_KEY, SALT, 32);
    const cipher = createCipheriv(ALGORITHM_GCM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');

    // New format: iv:authTag:encryptedText
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * @name decrypt
 * @description Decrypts a string. Supports both new GCM and old CBC formats.
 */
export function decrypt(text: string): string {
    try {
        const parts = text.split(':');
        
        // Return original if format is invalid
        if (parts.length < 2) return text;

        const key = scryptSync(SECRET_KEY, SALT, 32);

        // Case 1: New GCM Format (iv:authTag:encryptedText)
        if (parts.length === 3) {
            const [ivHex, authTagHex, encryptedText] = parts;
            const iv = Buffer.from(ivHex!, 'hex');
            const authTag = Buffer.from(authTagHex!, 'hex');
            
            const decipher = createDecipheriv(ALGORITHM_GCM, key, iv);
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encryptedText!, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }

        // Case 2: Old CBC Format (iv:encryptedText)
        if (parts.length === 2) {
            const [ivHex, encryptedText] = parts;
            const iv = Buffer.from(ivHex!, 'hex');
            const decipher = createDecipheriv(ALGORITHM_CBC, key, iv);

            let decrypted = decipher.update(encryptedText!, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }

        return text;
    } catch (error) {
        console.error('Decryption failed:', error);
        return text; 
    }
}

