/**
 * Resolves the translation file for a given language and namespace.
 *
 */
export async function i18nResolver(language: string, namespace: string) {
  try {
    const data = await import(
      `../../public/locales/${language}/${namespace}.json`
    );

    return data as Record<string, string>;
  } catch (e) {
    console.warn(`Could not find i18n file: ${language}/${namespace}.json`, e);
    return {};
  }
}
