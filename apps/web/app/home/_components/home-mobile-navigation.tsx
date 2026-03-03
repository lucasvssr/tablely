'use client';

import Link from 'next/link';

import { LogOut, Menu as MenuIcon } from 'lucide-react';
import type { JwtPayload } from '@supabase/supabase-js';
import { AccountSwitcher } from './account-switcher';

interface Account {
  id: string;
  name: string;
  slug: string;
  role: string;
}

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';

import { navigationConfig } from '~/config/navigation.config';

/**
 * Mobile navigation for the home page
 * @constructor
 */
export function HomeMobileNavigation(props: {
  user: JwtPayload;
  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    role: string | null;
  };
  accounts?: Account[];
  activeAccountId?: string;
}) {
  const isRestaurateur = props.account?.role === 'restaurateur';
  const signOut = useSignOut();
  const accounts = props.accounts ?? [];
  const activeAccountId = props.activeAccountId ?? accounts[0]?.id;

  const Links = navigationConfig.routes.map((item, index) => {
    if ('children' in item) {
      return item.children
        .filter((child) => {
          const role = props.account?.role || 'client';
          return !child.roles || child.roles.includes(role);
        })
        .map((child) => {
          return (
            <DropdownLink
              key={child.path}
              Icon={child.Icon}
              path={child.path}
              label={child.label}
            />
          );
        });
    }

    if ('divider' in item) {
      return <DropdownMenuSeparator key={index} />;
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon className={'h-9'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={10} className={'w-screen rounded-none p-4'}>
        {isRestaurateur && accounts.length > 0 && activeAccountId && (
          <div className="mb-4 px-2">
            <AccountSwitcher
              accounts={accounts}
              activeAccountId={activeAccountId as string}
            />
          </div>
        )}
        <DropdownMenuGroup>{Links}</DropdownMenuGroup>

        <DropdownMenuSeparator />

        <SignOutDropdownItem onSignOut={() => signOut.mutateAsync()} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>,
) {
  return (
    <DropdownMenuItem asChild key={props.path}>
      <Link
        href={props.path}
        className={'flex h-12 w-full items-center space-x-4'}
      >
        {props.Icon}

        <span>
          <Trans i18nKey={props.label} defaults={props.label} />
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutDropdownItem(
  props: React.PropsWithChildren<{
    onSignOut: () => unknown;
  }>,
) {
  return (
    <DropdownMenuItem
      className={'flex h-12 w-full items-center space-x-4'}
      onClick={props.onSignOut}
    >
      <LogOut className={'h-6'} />

      <span>
        <Trans i18nKey={'common:signOut'} defaults={'Sign out'} />
      </span>
    </DropdownMenuItem>
  );
}
