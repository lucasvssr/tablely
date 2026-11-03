import type { Provider } from '@supabase/supabase-js';

import { z } from 'zod';

const providers = getProviders();

const AuthConfigSchema = z.object({
  captchaTokenSiteKey: z
    .string()
    .describe('The reCAPTCHA site key.')
    .optional(),

  displayTermsCheckbox: z
    .boolean()
    .describe(
      'Whether to display the terms checkbox during sign-up.',
    )
    .optional(),

  providers: z.object({
    password: z
      .boolean()
      .describe('Enable password authentication.'),

    magicLink: z
      .boolean()
      .describe('Enable magic link authentication.'),

    oAuth: providers.array(),
  }),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

const authConfig = AuthConfigSchema.parse({
  // This is a public key, so it is safe to expose.
  // Copy the value from the Supabase dashboard.
  captchaTokenSiteKey:
    process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,

  // Whether to display the terms checkbox during sign-up.
  displayTermsCheckbox:
    process.env
      .NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX ===
    'true',

  // Enable these providers in the Supabase dashboard
  // for the production project.
  providers: {
    password:
      process.env.NEXT_PUBLIC_AUTH_PASSWORD === 'true',

    magicLink:
      process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK === 'true',

    oAuth: ['google'],
  },
} satisfies z.input<typeof AuthConfigSchema>);

export default authConfig;

function getProviders() {
  return z.enum([
    'apple',
    'azure',
    'bitbucket',
    'discord',
    'facebook',
    'figma',
    'github',
    'gitlab',
    'google',
    'kakao',
    'keycloak',
    'linkedin',
    'linkedin_oidc',
    'notion',
    'slack',
    'spotify',
    'twitch',
    'twitter',
    'workos',
    'zoom',
    'fly',
  ] satisfies readonly Provider[]);
}