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
}) {
  return (
    <div className={'flex items-center space-x-4'}>
      <AppLogo />

      <div className={'flex items-center space-x-2'}>
        <ModeToggle />
        <HomeMobileNavigation user={props.user} account={props.account} />
      </div>
    </div>
  );
}

function SidebarLayout({ children }: React.PropsWithChildren) {
  const sidebarMinimized = navigationConfig.sidebarCollapsed;
  const userPromise = requireUserInServerComponent();

  const [user, account] = use(
    Promise.all([
      userPromise,
      userPromise.then((user) => getPersonalAccount(user.id)),
    ]),
  );

  return (
    <SidebarProvider defaultOpen={sidebarMinimized}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <HomeSidebar user={user} account={account ?? undefined} />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <MobileNavigation user={user} account={account ?? undefined} />
        </PageMobileNavigation>

        {children}
      </Page>
    </SidebarProvider>
  );
}

function HeaderLayout({ children }: React.PropsWithChildren) {
  const userPromise = requireUserInServerComponent();

  const [user, account] = use(
    Promise.all([
      userPromise,
      userPromise.then((user) => getPersonalAccount(user.id)),
    ]),
  );

  return (
    <Page style={'header'}>
      <PageNavigation>
        <HomeMenuNavigation user={user} account={account ?? undefined} />
      </PageNavigation>

      <PageMobileNavigation className={'flex items-center justify-between'}>
        <MobileNavigation user={user} account={account ?? undefined} />
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
