import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Use a secret key from environment variables or a default one for dev
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'v-7H*k9P2#mL5$nQ8@bR1!zW0&xY3^jU'; // 32 chars
const SALT = process.env.ENCRYPTION_SALT || 'salt-bmad-booking';

/**
 * @name encrypt
 * @description Encrypts a string using AES-256-CBC.
 */
export function encrypt(text: string): string {
    const iv = randomBytes(16);
    const key = scryptSync(SECRET_KEY, SALT, 32);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * @name decrypt
 * @description Decrypts a string encrypted with the above encrypt function.
 */
export function decrypt(text: string): string {
    try {
        const [ivHex, encryptedText] = text.split(':');
        if (!ivHex || !encryptedText) return text;

        const iv = Buffer.from(ivHex, 'hex');
        const key = scryptSync(SECRET_KEY, SALT, 32);
        const decipher = createDecipheriv(ALGORITHM, key, iv);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return text; // Return original text if decryption fails (might be plain text)
    }
}
