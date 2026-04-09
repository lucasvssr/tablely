import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { createAuthCallbackService } from '@kit/supabase/auth';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

export async function GET(request: NextRequest) {
  const service = createAuthCallbackService(getSupabaseServerClient());

  const { nextPath: resultPath } = await service.exchangeCodeForSession(request, {
    redirectPath: request.nextUrl.searchParams.get('next') || pathsConfig.app.home,
  });

  let nextPath = resultPath;

  // Security: Ensure the redirect path is local to prevent Open Redirect attacks
  if (nextPath.includes('://') || nextPath.startsWith('//')) {
    console.warn(`Prevented suspicious cross-domain redirect attempt: ${nextPath}`);
    nextPath = pathsConfig.app.home;
  }

  return redirect(nextPath);
}
