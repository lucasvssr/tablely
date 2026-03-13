import type { JwtPayload } from '@supabase/supabase-js';
import { ModeToggle } from '@kit/ui/mode-toggle';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
} from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { navigationConfig } from '~/config/navigation.config';
import { AccountSwitcher } from './account-switcher';
import pathsConfig from '~/config/paths.config';

interface Account {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function HomeSidebar(props: {
  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    role: string | null;
  };
  user: JwtPayload;
  accounts?: Account[];
  activeAccountId?: string;
}) {
  const accounts = props.accounts ?? [];
  const isRestaurateur = props.account?.role === 'restaurateur';
  const activeAccountId = props.activeAccountId ?? accounts[0]?.id;

  return (
    <Sidebar collapsible={'icon'}>
      <SidebarHeader className={'h-16 justify-center'}>
        {isRestaurateur && accounts.length > 0 && activeAccountId ? (
          <AccountSwitcher
            accounts={accounts}
            activeAccountId={activeAccountId as string}
          />
        ) : (
          <AppLogo href={pathsConfig.app.home} className='w-full h-full' />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation
          config={{
            ...navigationConfig,
            routes: navigationConfig.routes.map((group) => {
              if ('children' in group) {
                return {
                  ...group,
                  children: group.children.filter((child) => {
                    const role = props.account?.role || 'client';
                    return (
                      !child.roles || child.roles.includes(role)
                    );
                  }),
                };
              }

              return group;
            }),
          }}
        />
      </SidebarContent>

      <SidebarFooter className={'flex flex-col gap-2 p-4'}>
        <div className={'flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4'}>
          <ModeToggle />
          <ProfileAccountDropdownContainer
            user={props.user}
            account={props.account}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
