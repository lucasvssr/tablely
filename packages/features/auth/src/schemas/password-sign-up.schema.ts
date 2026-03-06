import { z } from 'zod';
import { RefinedPasswordSchema, refineRepeatPassword } from './password.schema';

export const PasswordSignUpSchema = z
  .object({
    email: z.string().email(),
    password: RefinedPasswordSchema,
    repeatPassword: RefinedPasswordSchema,
    firstName: z.string().min(1, 'common:fieldRequired'),
    lastName: z.string().min(1, 'common:fieldRequired'),
  })
  .superRefine(refineRepeatPassword);
