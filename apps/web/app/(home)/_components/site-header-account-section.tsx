'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';

import Link from 'next/link';

import type { JwtPayload } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

import { ModeToggle } from '@kit/ui/mode-toggle';

const paths = {
  home: pathsConfig.app.home,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function SiteHeaderAccountSection({
  user,
}: React.PropsWithChildren<{
  user: JwtPayload | null;
}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <div className="flex items-center space-x-2">
      <If condition={isMounted && features.enableThemeToggle}>
        <Suspense fallback={null}>
          <ModeToggle />
        </Suspense>
      </If>

      {user ? (
        <SuspendedPersonalAccountDropdown user={user} />
      ) : (
        <AuthButtons />
      )}
    </div>
  );
}

function SuspendedPersonalAccountDropdown(props: { user: JwtPayload | null }) {
  const signOut = useSignOut();
  const user = useUser(props.user);
  const rawUserData = user.data ?? props.user ?? null;

  const userData = useMemo(() => {
    if (!rawUserData) return null;
    return {
      ...rawUserData,
      id: (rawUserData as Record<string, unknown>).id as string ?? (rawUserData as Record<string, unknown>).sub as string,
    } as JwtPayload & { id: string };
  }, [rawUserData]);

  if (userData) {
    return (
      <PersonalAccountDropdown
        showProfileName={false}
        paths={paths}
        features={features}
        user={userData}
        account={{
          id: userData.id,
          name:
            (userData as JwtPayload & { profile?: { display_name?: string } }).profile?.display_name ??
            (userData.user_metadata?.full_name as string) ??
            (userData.user_metadata?.name as string) ??
            null,
          picture_url: (userData.user_metadata?.avatar_url as string) ?? null,
        }}
        signOutRequested={() => signOut.mutateAsync()}
      />
    );
  }

  return <AuthButtons />;
}

function AuthButtons() {
  return (
    <div className={'flex items-center space-x-1 sm:space-x-2'}>
      <Button asChild variant={'ghost'} size={'sm'} className="px-2 sm:px-4">
        <Link href={pathsConfig.auth.signIn}>
          <Trans i18nKey={'auth:signIn'} />
        </Link>
      </Button>

      <Button asChild className="group hidden xs:flex h-9 sm:h-10" variant={'default'}>
        <Link href={pathsConfig.auth.signUp}>
          <Trans i18nKey={'auth:signUp'} />
        </Link>
      </Button>

      <Button asChild className="group flex xs:hidden h-8 px-3 text-xs" variant={'default'}>
        <Link href={pathsConfig.auth.signUp}>
          <Trans i18nKey={'auth:signUp'} />
        </Link>
      </Button>
    </div>
  );
}
