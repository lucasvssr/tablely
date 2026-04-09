import { test, expect } from '@playwright/test';
import { PasswordSignUpSchema } from '../../../../packages/features/auth/src/schemas/password-sign-up.schema';

test.describe('Auth Schemas Unit Tests', () => {
  test('PasswordSignUpSchema should validate correct data', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };
    
    const result = PasswordSignUpSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('PasswordSignUpSchema should fail if passwords do not match', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'DifferentPassword!',
      firstName: 'John',
      lastName: 'Doe',
    };
    
    const result = PasswordSignUpSchema.safeParse(data);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('auth:errors.passwordsDoNotMatch');
    }
  });

  test('PasswordSignUpSchema should fail if email is invalid', () => {
    const data = {
      email: 'invalid-email',
      password: 'Password123!',
      repeatPassword: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };
    
    const result = PasswordSignUpSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test('PasswordSignUpSchema should fail if fields are missing', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123!',
      repeatPassword: 'Password123!',
      firstName: '',
      lastName: '',
    };
    
    const result = PasswordSignUpSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
