import { ModeToggle } from '@kit/ui/mode-toggle';

import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from '@kit/ui/bordered-navigation-menu';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { navigationConfig } from '~/config/navigation.config';

import type { JwtPayload } from '@supabase/supabase-js';

export function HomeMenuNavigation(props: {
  user: JwtPayload;
  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    role: string | null;
  };
}) {
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
    <div className={'flex w-full flex-1 justify-between'}>
      <div className={'flex items-center space-x-8'}>
        <AppLogo />

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
