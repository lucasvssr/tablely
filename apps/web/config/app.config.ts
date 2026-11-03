import { z } from 'zod';

const production = process.env.NODE_ENV === 'production';

const AppConfigSchema = z
  .object({
    name: z
      .string({
        error:
          'Please provide the variable NEXT_PUBLIC_PRODUCT_NAME',
      })
      .min(1, {
        error:
          'Please provide the variable NEXT_PUBLIC_PRODUCT_NAME',
      })
      .describe(
        'This is the name of your SaaS. Ex. "Makerkit"',
      ),

    title: z
      .string({
        error:
          'Please provide the variable NEXT_PUBLIC_SITE_TITLE',
      })
      .min(1, {
        error:
          'Please provide the variable NEXT_PUBLIC_SITE_TITLE',
      })
      .describe(
        'This is the default title tag of your SaaS.',
      ),

    description: z
      .string({
        error:
          'Please provide the variable NEXT_PUBLIC_SITE_DESCRIPTION',
      })
      .min(1, {
        error:
          'Please provide the variable NEXT_PUBLIC_SITE_DESCRIPTION',
      })
      .describe(
        'This is the default description of your SaaS.',
      ),

    url: z
      .string({
        error:
          'Please provide the variable NEXT_PUBLIC_SITE_URL',
      })
      .url({
        error:
          "Please provide NEXT_PUBLIC_SITE_URL with a valid URL, such as 'https://example.com'.",
      })
      .describe('This is the public URL of your SaaS.'),

    locale: z
      .string({
        error:
          'Please provide the variable NEXT_PUBLIC_DEFAULT_LOCALE',
      })
      .default('en')
      .describe(
        'This is the default locale of your SaaS.',
      ),

    theme: z.enum(['light', 'dark', 'system'], {
      error:
        'Please provide a valid NEXT_PUBLIC_DEFAULT_THEME_MODE',
    }),

    production: z.boolean(),

    themeColor: z
      .string({
        error:
          'Please provide the variable NEXT_PUBLIC_THEME_COLOR',
      })
      .min(1),

    themeColorDark: z
      .string({
        error:
          'Please provide the variable NEXT_PUBLIC_THEME_COLOR_DARK',
      })
      .min(1),
  })
  .refine(
    (config) => {
      const isCI =
        process.env.NEXT_PUBLIC_CI === 'true';

      if (isCI || !config.production) {
        return true;
      }

      return config.url.startsWith('https:');
    },
    {
      message:
        "Please provide NEXT_PUBLIC_SITE_URL with a valid HTTPS URL, such as 'https://example.com'.",
      path: ['url'],
    },
  )
  .refine(
    (config) => {
      return config.themeColor !== config.themeColorDark;
    },
    {
      message:
        'Please provide different theme colors for light and dark themes.',
      path: ['themeColor'],
    },
  );

const appConfig = AppConfigSchema.parse({
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME,
  title: process.env.NEXT_PUBLIC_SITE_TITLE,
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_SITE_URL,
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  theme: process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE,
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR,
  themeColorDark:
    process.env.NEXT_PUBLIC_THEME_COLOR_DARK,
  production,
});

export default appConfig;