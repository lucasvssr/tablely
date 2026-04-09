import { test, expect } from '@playwright/test';

test.describe('Captcha Verification Unit Tests', () => {
  const originalFetch = global.fetch;

  test.beforeAll(() => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret-key';
  });

  test.afterAll(() => {
    global.fetch = originalFetch;
  });

  test('verifyTurnstileToken should return true on success', async () => {
    // Dynamic import to allow env var setup if needed (though here it's inside the function)
    const { verifyTurnstileToken } = await import('../../../../apps/web/lib/security/captcha');

    global.fetch = (async () => ({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)) as any;

    const result = await verifyTurnstileToken('valid-token');
    expect(result).toBe(true);
  });

  test('verifyTurnstileToken should return false on failure', async () => {
    const { verifyTurnstileToken } = await import('../../../../apps/web/lib/security/captcha');

    global.fetch = (async () => ({
      ok: true,
      json: async () => ({ success: false }),
    } as Response)) as any;

    const result = await verifyTurnstileToken('invalid-token');
    expect(result).toBe(false);
  });

  test('verifyTurnstileToken should return true if secret key is missing (warn and skip)', async () => {
    const { verifyTurnstileToken } = await import('../../../../apps/web/lib/security/captcha');
    
    const oldKey = process.env.TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;

    const result = await verifyTurnstileToken('any-token');
    expect(result).toBe(true);

    process.env.TURNSTILE_SECRET_KEY = oldKey;
  });
});
