import 'server-only';

import { redirect } from 'next/navigation';
import type { NextRequest, NextResponse } from 'next/server';

import type { JwtPayload } from '@supabase/supabase-js';

import { z } from 'zod';

import { verifyCaptchaToken } from '@kit/auth/captcha/server';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { zodParseFactory } from '../utils';

interface Config<Schema extends z.ZodType | undefined> {
  auth?: boolean;
  captcha?: boolean;
  schema?: Schema;
}

type RouteBody<
  Params extends Config<z.ZodType | undefined>,
> = Params['schema'] extends z.ZodType
  ? z.output<Params['schema']>
  : undefined;

interface HandlerParams<
  Schema extends z.ZodType | undefined,
  RequireAuth extends boolean | undefined,
> {
  request: NextRequest;
  user: RequireAuth extends false ? undefined : JwtPayload;
  body: Schema extends z.ZodType ? z.output<Schema> : undefined;
  params: Record<string, string>;
}

type RouteHandlerResponse =
  | NextResponse
  | Response
  | Promise<NextResponse | Response>;

/**
 * Enhanced route handler function.
 *
 * This function takes a request and parameters object as arguments
 * and returns a route handler function.
 *
 * Usage:
 * export const POST = enhanceRouteHandler(
 *   ({ body }) => {
 *     return new Response(`Hello, ${body.name}!`);
 *   },
 *   {
 *     schema: z.object({
 *       name: z.string(),
 *     }),
 *   },
 * );
 */
export const enhanceRouteHandler = <
  Params extends Config<z.ZodType | undefined>,
>(
  handler: (
    params: HandlerParams<Params['schema'], Params['auth']>,
  ) => RouteHandlerResponse,
  params?: Params,
) => {
  return async function routeHandler(
    request: NextRequest,
    routeParams: {
      params: Promise<Record<string, string>>;
    },
  ) {
    type UserParam = Params['auth'] extends false
      ? undefined
      : JwtPayload;

    type BodyParam = RouteBody<Params>;

    let user: UserParam = undefined as UserParam;

    const shouldVerifyCaptcha = params?.captcha ?? false;

    if (shouldVerifyCaptcha) {
      const token = captchaTokenGetter(request);

      if (!token) {
        return new Response('Captcha token is required', {
          status: 400,
        });
      }

      await verifyCaptchaToken(token);
    }

    const shouldVerifyAuth = params?.auth ?? true;

    if (shouldVerifyAuth) {
      const client = getSupabaseServerClient();
      const auth = await requireUser(client);

      if (auth.error) {
        return redirect(auth.redirectTo);
      }

      user = auth.data as UserParam;
    }

    let body: BodyParam = undefined as BodyParam;

    if (params?.schema) {
      const json: unknown = await request.clone().json();

      body = zodParseFactory(params.schema)(json) as BodyParam;
    }

    return handler({
      request,
      body,
      user,
      params: await routeParams.params,
    });
  };
};

/**
 * Get the captcha token from the request headers.
 */
function captchaTokenGetter(request: NextRequest) {
  return request.headers.get('x-captcha-token');
}