import { test, expect } from '@playwright/test';
import { createI18nSettings } from '../../../../packages/i18n/src/create-i18n-settings';

test.describe('i18n Utils Unit Tests', () => {
  test('createI18nSettings should return correct settings', () => {
    const settings = createI18nSettings({
      languages: ['en', 'fr'],
      language: 'fr',
      namespaces: 'common'
    });

    expect(settings.lng).toBe('fr');
    expect(settings.fallbackLng).toBe('en');
    expect(settings.supportedLngs).toEqual(['en', 'fr']);
    expect(settings.ns).toBe('common');
  });

  test('createI18nSettings should handle multiple namespaces', () => {
    const settings = createI18nSettings({
      languages: ['en'],
      language: 'en',
      namespaces: ['common', 'auth']
    });

    expect(settings.ns).toEqual(['common', 'auth']);
  });
});
