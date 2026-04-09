import { test, expect } from '@playwright/test';
// Simulating the environment for requireUser
import { requireUser } from '../../../../packages/supabase/src/require-user';

test.describe('requireUser Unit Tests', () => {
  
  test('should return error and redirect to sign-in if no claims found', async () => {
    const mockClient = {
      auth: {
        getClaims: async () => ({ data: null, error: null })
      }
    } as any;
    
    const result = await requireUser(mockClient);
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Authentication required');
    if ('redirectTo' in result) {
      expect(result.redirectTo).toBe('/auth/sign-in');
    }
  });

  test('should return data if claims are present and MFA is not required', async () => {
    const mockClient = {
      auth: {
        getClaims: async () => ({ 
          data: { claims: { sub: 'user-123', email: 'test@example.com' } }, 
          error: null 
        }),
        mfa: {
          getAuthenticatorAssuranceLevel: async () => ({
              data: { currentLevel: 'aal1', nextLevel: 'aal1' },
              error: null
          })
        }
      }
    } as any;
    
    const result = await requireUser(mockClient);
    expect(result.data).toEqual(expect.objectContaining({ id: 'user-123', email: 'test@example.com' }));
    expect(result.error).toBeNull();
  });

  test('should redirect to verify MFA if MFA is required', async () => {
    const mockClient = {
      auth: {
        getClaims: async () => ({ 
          data: { claims: { sub: 'user-123' } }, 
          error: null 
        }),
        mfa: {
          getAuthenticatorAssuranceLevel: async () => ({
              data: { currentLevel: 'aal1', nextLevel: 'aal2' },
              error: null
          })
        }
      }
    } as any;
    
    const result = await requireUser(mockClient);
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Multi-factor authentication required');
    if ('redirectTo' in result) {
      expect(result.redirectTo).toBe('/auth/verify');
    }
  });
});
