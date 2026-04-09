import { test, expect } from '@playwright/test';
import { AuthPageObject } from '../../tests/authentication/auth.po';

test.describe('AuthPageObject Unit Tests', () => {
  const mockPage = {} as any;
  let authPo: AuthPageObject;

  test.beforeEach(() => {
    authPo = new AuthPageObject(mockPage);
  });

  test('createRandomEmail should return a string with makerkit.dev domain', () => {
    const email = authPo.createRandomEmail();
    expect(email).toMatch(/^[0-9]+@makerkit\.dev$/);
  });

  test('createRandomEmail should return different values on subsequent calls', () => {
    const email1 = authPo.createRandomEmail();
    const email2 = authPo.createRandomEmail();
    expect(email1).not.toBe(email2);
  });
});
