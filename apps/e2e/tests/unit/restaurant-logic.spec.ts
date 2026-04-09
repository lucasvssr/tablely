import { test, expect } from '@playwright/test';
import { slugify } from '../../../../packages/shared/src/utils';

test.describe('Restaurant Logic Unit Tests', () => {
  
  test.describe('slugify', () => {
    test('should convert simple text to slug', () => {
      expect(slugify('My Restaurant')).toBe('my-restaurant');
    });

    test('should remove accents', () => {
      expect(slugify('Café du Port')).toBe('cafe-du-port');
      expect(slugify('À l\'école')).toBe('a-lecole');
    });

    test('should handle multiple spaces and special characters', () => {
      expect(slugify('Super   Restaurant!!!')).toBe('super-restaurant');
      expect(slugify('Hello & Goodbye')).toBe('hello-goodbye');
    });

    test('should trim hyphens', () => {
      expect(slugify('  - Hello World -  ')).toBe('hello-world');
    });

    test('should handle numbers', () => {
      expect(slugify('Restaurant 123')).toBe('restaurant-123');
    });
  });
});
