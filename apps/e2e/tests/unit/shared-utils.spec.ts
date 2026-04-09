import { test, expect } from '@playwright/test';
import { isBrowser, formatCurrency, formatAddress } from '../../../../packages/shared/src/utils';

test.describe('Shared Utils Unit Tests', () => {
  test('isBrowser should return false in Node environment', () => {
    expect(isBrowser()).toBe(false);
  });

  test('formatCurrency should format USD correctly', () => {
    const result = formatCurrency({
      currencyCode: 'USD',
      locale: 'en-US',
      value: 100,
    });
    // Use a regex to avoid character encoding issues with symbols like $
    expect(result).toMatch(/\$100\.00/);
  });

  test('formatCurrency should format EUR correctly', () => {
    const result = formatCurrency({
      currencyCode: 'EUR',
      locale: 'fr-FR',
      value: 100,
    });
    // Non-breaking space might be used in French locale
    expect(result).toMatch(/100,00\s?€/);
  });

  test('formatCurrency should handle string values', () => {
    const result = formatCurrency({
      currencyCode: 'USD',
      locale: 'en-US',
      value: '50.5',
    });
    expect(result).toMatch(/\$50\.50/);
  });

  test.describe('formatAddress', () => {
    test('should format full address correctly', () => {
      const addr = {
        house_number: '12',
        road: 'Rue de Rivoli',
        city: 'Paris',
        county: 'Paris',
        country: 'France'
      };
      expect(formatAddress(addr)).toBe('12 Rue de Rivoli, Paris, Paris, France');
    });

    test('should handle missing house number', () => {
      const addr = {
        road: 'Avenue des Champs-Élysées',
        city: 'Paris',
        country: 'France'
      };
      expect(formatAddress(addr)).toBe('Avenue des Champs-Élysées, Paris, France');
    });

    test('should handle town/village instead of city', () => {
      const addr = {
        road: 'Main St',
        town: 'Smallville',
        country: 'USA'
      };
      expect(formatAddress(addr)).toBe('Main St, Smallville, USA');
    });

    test('should return empty string if no address object', () => {
      expect(formatAddress(null)).toBe('');
      expect(formatAddress(undefined)).toBe('');
    });
  });
});
