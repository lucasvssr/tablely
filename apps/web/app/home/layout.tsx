import { use } from 'react';

import { cookies } from 'next/headers';

import type { JwtPayload } from '@supabase/supabase-js';

import {
  Page,
  PageLayoutStyle,
  PageMobileNavigation,
  PageNavigation,
} from '@kit/ui/page';
import { SidebarProvider } from '@kit/ui/shadcn-sidebar';

import { ModeToggle } from '@kit/ui/mode-toggle';
import { AppLogo } from '~/components/app-logo';
import { navigationConfig } from '~/config/navigation.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { getPersonalAccount } from '~/lib/server/accounts/queries';

// home imports
import { HomeMenuNavigation } from './_components/home-menu-navigation';
import { HomeMobileNavigation } from './_components/home-mobile-navigation';
import { HomeSidebar } from './_components/home-sidebar';
import { AccountSwitcher } from './_components/account-switcher';
import { getActiveMembership, getMembershipsAction } from '~/lib/server/restaurant/restaurant-actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import pathsConfig from '~/config/paths.config';

interface Account {
  id: string;
  name: string;
  slug: string;
  role: string;
}

function HomeLayout({ children }: React.PropsWithChildren) {
  const style = use(getLayoutStyle());

  if (style === 'sidebar') {
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  return <HeaderLayout>{children}</HeaderLayout>;
}

export default withI18n(HomeLayout);

function MobileNavigation(props: {
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
  const accounts = props.accounts ?? [];
  const activeAccountId = props.activeAccountId ?? accounts[0]?.id;

  return (
    <div className={'flex w-full items-center justify-between gap-4'}>
      {isRestaurateur && accounts.length > 0 && activeAccountId ? (
        <div className="flex-1 min-w-0">
          <AccountSwitcher
            accounts={accounts}
            activeAccountId={activeAccountId as string}
            collapsed={false}
          />
        </div>
      ) : (
        <AppLogo href={pathsConfig.app.home} />
      )}

      <div className={'flex items-center justify-end space-x-2'}>
        <ModeToggle />
        <HomeMobileNavigation
          user={props.user}
          account={props.account}
          accounts={props.accounts}
          activeAccountId={props.activeAccountId}
        />
      </div>
    </div>
  );
}

function SidebarLayout({ children }: React.PropsWithChildren) {
  const sidebarMinimized = navigationConfig.sidebarCollapsed;
  const userPromise = requireUserInServerComponent();
  const supabase = getSupabaseServerClient();

  const [user, account, activeMembership, memberships] = use(
    Promise.all([
      userPromise,
      userPromise.then((user) => getPersonalAccount(user.id)),
      userPromise.then((user) => getActiveMembership(supabase, user.id)),
      getMembershipsAction({}),
    ]),
  );

  const sidebarAccount = account ? {
    id: account.id,
    name: account.name,
    picture_url: account.picture_url,
    role: account.role
  } : undefined;

  return (
    <SidebarProvider defaultOpen={sidebarMinimized}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <HomeSidebar
            user={user}
            account={sidebarAccount}
            accounts={memberships}
            activeAccountId={activeMembership?.account_id}
          />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <MobileNavigation
            user={user}
            account={sidebarAccount}
            accounts={memberships}
            activeAccountId={activeMembership?.account_id}
          />
        </PageMobileNavigation>

        {children}
      </Page>
    </SidebarProvider>
  );
}

function HeaderLayout({ children }: React.PropsWithChildren) {
  const userPromise = requireUserInServerComponent();
  const supabase = getSupabaseServerClient();

  const [user, account, activeMembership, memberships] = use(
    Promise.all([
      userPromise,
      userPromise.then((user) => getPersonalAccount(user.id)),
      userPromise.then((user) => getActiveMembership(supabase, user.id)),
      getMembershipsAction({}),
    ]),
  );

  const headerAccount = account ? {
    id: account.id,
    name: account.name,
    picture_url: account.picture_url,
    role: account.role
  } : undefined;

  return (
    <Page style={'header'}>
      <PageNavigation>
        <HomeMenuNavigation
          user={user}
          account={headerAccount}
          accounts={memberships as Account[]}
          activeAccountId={activeMembership?.account_id}
        />
      </PageNavigation>

      <PageMobileNavigation className={'flex items-center justify-between'}>
        <MobileNavigation
          user={user}
          account={headerAccount}
          accounts={memberships}
          activeAccountId={activeMembership?.account_id}
        />
      </PageMobileNavigation>

      {children}
    </Page>
  );
}

async function getLayoutStyle() {
  const cookieStore = await cookies();

  return (
    (cookieStore.get('layout-style')?.value as PageLayoutStyle) ??
    navigationConfig.style
  );
}
