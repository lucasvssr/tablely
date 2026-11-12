import 'server-only';

import { redirect } from 'next/navigation';

import type { JwtPayload } from '@supabase/supabase-js';

import { z } from 'zod';

import { verifyCaptchaToken } from '@kit/auth/captcha/server';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { zodParseFactory } from '../utils';

type ActionParams<Config, Args> = Config extends {
  schema?: infer Schema;
}
  ? Schema extends z.ZodType
    ? z.output<Schema>
    : Args
  : Args;

type ActionInput<Config, Args> = Config extends {
  schema?: infer Schema;
}
  ? Schema extends z.ZodType
    ? z.input<Schema>
    : Args
  : Args;

/**
 * @name enhanceAction
 * @description Enhance an action with captcha, schema and auth checks
 */
export function enhanceAction<
  Args,
  Response,
  Config extends {
    auth?: boolean;
    captcha?: boolean;
    schema?: z.ZodType<
      unknown,
      Config['captcha'] extends true
        ? Args & { captchaToken: string }
        : Args
    >;
  },
>(
  fn: (
    params: ActionParams<Config, Args>,
    user: Config['auth'] extends false ? undefined : JwtPayload,
  ) => Response | Promise<Response>,
  config: Config,
) {
  return async (params: ActionInput<Config, Args>) => {
    type UserParam = Config['auth'] extends false
      ? undefined
      : JwtPayload;

    type ParsedParams = ActionParams<Config, Args>;

    const requireAuth = config.auth ?? true;
    let user: UserParam = undefined as UserParam;

    const data = (
      config.schema
        ? zodParseFactory(config.schema)(params)
        : params
    ) as ParsedParams;

    const verifyCaptcha = config.captcha ?? false;

    if (verifyCaptcha) {
      const token = (
        data as Args & {
          captchaToken: string;
        }
      ).captchaToken;

      await verifyCaptchaToken(token);
    }

    if (requireAuth) {
      const auth = await requireUser(getSupabaseServerClient());

      if (!auth.data) {
        redirect(auth.redirectTo);
      }

      user = auth.data as UserParam;
    }

    return fn(data, user);
  };
}