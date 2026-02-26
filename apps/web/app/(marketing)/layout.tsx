import { Suspense } from 'react';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';
import { withI18n } from '~/lib/i18n/with-i18n';

async function SiteLayout(props: React.PropsWithChildren) {
  return (
    <div className={'flex min-h-[100vh] flex-col'}>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeaderContainer />
      </Suspense>

      <main className="flex-1 pt-20">
        {props.children}
      </main>

      <SiteFooter />
    </div>
  );
}

async function SiteHeaderContainer() {
  const client = getSupabaseServerClient();
  const { data } = await client.auth.getClaims();

  return <SiteHeader user={data?.claims} />;
}

function SiteHeaderSkeleton() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-white/5 h-20" />
  );
}

export default withI18n(SiteLayout);
