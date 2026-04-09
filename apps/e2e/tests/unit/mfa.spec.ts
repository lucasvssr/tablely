import { test, expect } from '@playwright/test';
import { checkRequiresMultiFactorAuthentication } from '../../../../packages/supabase/src/check-requires-mfa';

test.describe('MFA Logic Unit Tests', () => {
  test('should return true if next level is aal2 and current level is not aal2', async () => {
    const mockClient = {
      auth: {
        mfa: {
          getAuthenticatorAssuranceLevel: async () => ({
            data: {
              nextLevel: 'aal2',
              currentLevel: 'aal1',
            },
            error: null,
          }),
        },
      },
    } as any;

    const result = await checkRequiresMultiFactorAuthentication(mockClient);
    expect(result).toBe(true);
  });

  test('should return false if current level is already aal2', async () => {
    const mockClient = {
      auth: {
        mfa: {
          getAuthenticatorAssuranceLevel: async () => ({
            data: {
              nextLevel: 'aal2',
              currentLevel: 'aal2',
            },
            error: null,
          }),
        },
      },
    } as any;

    const result = await checkRequiresMultiFactorAuthentication(mockClient);
    expect(result).toBe(false);
  });

  test('should throw error if Supabase returns error', async () => {
    const mockClient = {
      auth: {
        mfa: {
          getAuthenticatorAssuranceLevel: async () => ({
            data: null,
            error: { message: 'Supabase Error' },
          }),
        },
      },
    } as any;

    await expect(checkRequiresMultiFactorAuthentication(mockClient))
      .rejects.toThrow('Supabase Error');
  });
});
