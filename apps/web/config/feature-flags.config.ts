import { z } from 'zod';

const FeatureFlagsSchema = z.object({
  enableThemeToggle: z
    .boolean({
      error:
        'Provide the variable NEXT_PUBLIC_ENABLE_THEME_TOGGLE',
    })
    .describe(
      'Enable theme toggle in the user interface.',
    ),

  languagePriority: z
    .enum(['user', 'application'], {
      error:
        'Provide the variable NEXT_PUBLIC_LANGUAGE_PRIORITY',
    })
    .describe(
      "If set to user, use the user's preferred language. " +
        "If set to application, use the application's default language.",
    )
    .default('application'),

  enableVersionUpdater: z
    .boolean({
      error:
        'Provide the variable NEXT_PUBLIC_ENABLE_VERSION_UPDATER',
    })
    .describe('Enable version updater.'),

  enableCookieBanner: z
    .boolean({
      error:
        'Provide the variable NEXT_PUBLIC_ENABLE_COOKIE_BANNER',
    })
    .describe('Enable cookie banner.'),
});

export type FeatureFlagsConfig = z.output<
  typeof FeatureFlagsSchema
>;

const featuresFlagConfig = FeatureFlagsSchema.parse({
  enableThemeToggle: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_THEME_TOGGLE,
    true,
  ),

  languagePriority:
    process.env.NEXT_PUBLIC_LANGUAGE_PRIORITY,

  enableVersionUpdater: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_VERSION_UPDATER,
    false,
  ),

  enableCookieBanner: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_COOKIE_BANNER,
    false,
  ),
});

export default featuresFlagConfig;

function getBoolean(
  value: unknown,
  defaultValue: boolean,
): boolean {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return defaultValue;
}