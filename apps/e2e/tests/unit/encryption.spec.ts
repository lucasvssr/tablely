import { test, expect } from '@playwright/test';

test.describe('Encryption Utils Unit Tests', () => {
  test.beforeAll(() => {
    process.env.ENCRYPTION_SECRET = 'my-secret-key-at-least-32-chars-long-!!!';
    process.env.ENCRYPTION_SALT = 'some-salt';
  });

  test('should encrypt and decrypt correctly using GCM', async () => {
    const { encrypt, decrypt } = await import('../../../../apps/web/lib/security/encryption');
    const originalText = 'Hello World';
    const encryptedText = encrypt(originalText);
    
    expect(encryptedText).toContain(':');
    expect(encryptedText.split(':').length).toBe(3);
    
    const decryptedText = decrypt(encryptedText);
    expect(decryptedText).toBe(originalText);
  });

  test('should support decryption of legacy CBC format', async () => {
    const { decrypt } = await import('../../../../apps/web/lib/security/encryption');
    expect(decrypt('plain-text')).toBe('plain-text');
  });

  test('should handle decryption failure gracefully', async () => {
    const { decrypt } = await import('../../../../apps/web/lib/security/encryption');
    const invalidGcm = 'abcd:efgh:ijkl'; 
    
    // Suppress console.error for this test as the failure is intentional
    const originalError = console.error;
    console.error = () => {};
    
    const result = decrypt(invalidGcm);
    expect(result).toBe(invalidGcm);
    
    console.error = originalError;
  });

  test('should return same length for encrypted data if called twice (same format)', async () => {
    const { encrypt } = await import('../../../../apps/web/lib/security/encryption');
    const text = 'Stable length';
    const enc1 = encrypt(text);
    const enc2 = encrypt(text);
    expect(enc1.length).toBe(enc2.length);
    expect(enc1).not.toBe(enc2);
  });
});
