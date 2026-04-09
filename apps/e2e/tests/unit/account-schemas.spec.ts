import { test, expect } from '@playwright/test';
import { UpdateEmailSchema } from '../../../../packages/features/accounts/src/schema/update-email.schema';
import { PasswordUpdateSchema } from '../../../../packages/features/accounts/src/schema/update-password.schema';

test.describe('Account Schemas Unit Tests', () => {
  const emailSchema = UpdateEmailSchema.withTranslation('Error');
  const passwordSchema = PasswordUpdateSchema.withTranslation('Error');

  test('UpdateEmailSchema should validate matching emails', () => {
    const data = {
      email: 'new@example.com',
      repeatEmail: 'new@example.com',
    };
    const result = emailSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('UpdateEmailSchema should fail if emails do not match', () => {
    const data = {
      email: 'new@example.com',
      repeatEmail: 'different@example.com',
    };
    const result = emailSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test('PasswordUpdateSchema should validate matching passwords', () => {
    const data = {
      newPassword: 'Password123!',
      repeatPassword: 'Password123!',
    };
    const result = passwordSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('PasswordUpdateSchema should fail if passwords do not match', () => {
    const data = {
      newPassword: 'Password123!',
      repeatPassword: 'DifferentPassword!',
    };
    const result = passwordSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
