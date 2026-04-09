import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { zodParseFactory } from '../../../../packages/next/src/utils/index';

test.describe('Next Utils Unit Tests', () => {
  test('zodParseFactory should parse valid data', () => {
    const schema = z.object({ name: z.string() });
    const parse = zodParseFactory(schema);
    const result = parse({ name: 'John' });
    expect(result).toEqual({ name: 'John' });
  });

  test('zodParseFactory should throw error on invalid data', () => {
    const schema = z.object({ name: z.string() });
    const parse = zodParseFactory(schema);
    
    // Suppress console.error during test
    const originalError = console.error;
    console.error = () => {};
    
    expect(() => parse({ name: 123 })).toThrow(/Invalid data/);
    
    console.error = originalError;
  });
});
