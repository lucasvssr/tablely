import { z } from 'zod';

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1),
    signUp: z.string().min(1),
    verifyMfa: z.string().min(1),
    callback: z.string().min(1),
    passwordReset: z.string().min(1),
    passwordUpdate: z.string().min(1),
  }),
  app: z.object({
    home: z.string().min(1),
    profileSettings: z.string().min(1),
    services: z.string().min(1),
    tables: z.string().min(1),
    team: z.string().min(1),
    restaurant: z.string().min(1),
    restaurants: z.string().min(1),
    booking: z.string().min(1),
    restaurantSettings: z.string().min(1),
    join: z.string().min(1),
  }),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyMfa: '/auth/verify',
    callback: '/auth/callback',
    passwordReset: '/auth/password-reset',
    passwordUpdate: '/update-password',
  },
  app: {
    home: '/home',
    profileSettings: '/home/settings',
    services: '/home/settings/services',
    tables: '/home/settings/tables',
    team: '/home/settings/team',
    restaurant: '/restaurant',
    restaurants: '/home/restaurants',
    booking: '/home/booking',
    restaurantSettings: '/home/settings/restaurant',
    join: '/join',
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
