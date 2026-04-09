import { test, expect } from '@playwright/test';

test.describe('Sitemap Logic Unit Tests', () => {
  const originalFetch = global.fetch;

  test.afterAll(() => {
    global.fetch = originalFetch;
  });

  test('sitemap should return static paths always', async () => {
    // Mock environment variables for appConfig
    process.env.NEXT_PUBLIC_PRODUCT_NAME = 'Tablely';
    process.env.NEXT_PUBLIC_SITE_TITLE = 'Tablely';
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION = 'Tablely';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_DEFAULT_LOCALE = 'fr';
    process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE = 'system';
    process.env.NEXT_PUBLIC_THEME_COLOR = '#ffffff';
    process.env.NEXT_PUBLIC_THEME_COLOR_DARK = '#000000';
    process.env.NEXT_PUBLIC_CI = 'true'; // To skip HTTPS check

    // Suppress console.warn/error during sitemap call to keep output clean 
    // especially for the expected next/cache resolution failure.
    const originalWarn = console.warn;
    const originalError = console.error;
    console.warn = () => { };
    console.error = () => { };

    try {
      const { default: sitemap } = await import('../../../../apps/web/app/sitemap');
      const result = await sitemap();

      // Static paths count (from the file: '', '/restaurants', '/faq', '/cookie-policy', '/terms-of-service', '/privacy-policy')
      expect(result.length).toBeGreaterThanOrEqual(6);

      const urls = result.map(p => p.url);
      // Absolute URLs
      expect(urls).toContain('http://localhost:3000/restaurants');
      expect(urls).toContain('http://localhost:3000/faq');
      expect(urls).toContain('http://localhost:3000');
    } catch (e: any) {
      // Restore console to report real errors
      console.warn = originalWarn;
      console.error = originalError;
      console.error('Sitemap test failed:', e?.message || e);
      throw e;
    } finally {
      console.warn = originalWarn;
      console.error = originalError;
    }
  });
});
