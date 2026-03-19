import { ModeToggle } from '@kit/ui/mode-toggle';

import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from '@kit/ui/bordered-navigation-menu';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { navigationConfig } from '~/config/navigation.config';

import type { JwtPayload } from '@supabase/supabase-js';
import { AccountSwitcher } from './account-switcher';

interface Account {
  id: string;
  name: string;
  slug: string;
  role: string;
  restaurants?: Array<{ id: string; name: string }>;
}

export function HomeMenuNavigation(props: {
  user: JwtPayload;
  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    role: string | null;
  };
  accounts?: Account[];
  activeAccountId?: string;
  activeRestaurantId?: string;
}) {
  const accounts = props.accounts ?? [];
  const isRestaurateur = props.account?.role === 'restaurateur';
  const activeAccountId = props.activeAccountId ?? accounts[0]?.id;

  const routes = navigationConfig.routes.reduce<
    Array<{
      path: string;
      label: string;
      Icon?: React.ReactNode;
      end?: boolean | ((path: string) => boolean);
      roles?: string[];
    }>
  >((acc, item) => {
    if ('children' in item) {
      const filteredChildren = item.children.filter((child) => {
        const role = props.account?.role || 'client';
        return !child.roles || child.roles.includes(role);
      });

      return [...acc, ...filteredChildren];
    }

    if ('divider' in item) {
      return acc;
    }

    return [...acc, item];
  }, []);

  return (
    <div className={'flex flex-1 items-center justify-between space-x-4'}>
      <div className={'flex items-center space-x-8'}>
        {isRestaurateur && accounts.length > 0 && activeAccountId ? (
          <div className="max-w-[200px]">
            <AccountSwitcher
              accounts={accounts}
              activeAccountId={activeAccountId as string}
              activeRestaurantId={props.activeRestaurantId}
            />
          </div>
        ) : (
          <AppLogo width={160} />
        )}

        <BorderedNavigationMenu>
          {routes.map((route) => (
            <BorderedNavigationMenuItem {...route} key={route.path} />
          ))}
        </BorderedNavigationMenu>
      </div>

      <div className={'flex items-center justify-end space-x-4'}>
        <ModeToggle />

        <ProfileAccountDropdownContainer
          user={props.user}
          account={props.account}
          showProfileName={false}
        />
      </div>
    </div>
  );
}
