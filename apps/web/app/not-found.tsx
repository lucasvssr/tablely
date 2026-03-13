import { BackButton } from '~/components/back-button';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import { SiteHeader } from '~/(home)/_components/site-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('common:notFound');

  return {
    title,
  };
};

const NotFoundPage = async () => {
  const client = getSupabaseServerClient();

  const { data } = await client.auth.getClaims();

  return (
    <div className={'flex h-screen flex-1 flex-col'}>
      <SiteHeader user={data?.claims} />

      <div
        className={
          'container m-auto flex w-full flex-1 flex-col items-center justify-center'
        }
      >
        <div className={'flex flex-col items-center space-y-12'}>
          <div>
            <h1 className={'font-heading text-8xl font-extrabold xl:text-9xl'}>
              <Trans i18nKey={'common:pageNotFoundHeading'} />
            </h1>
          </div>

          <div className={'flex flex-col items-center space-y-8'}>
            <div className={'flex flex-col items-center space-y-2.5'}>
              <div>
                <Heading level={1}>
                  <Trans i18nKey={'common:pageNotFound'} />
                </Heading>
              </div>

              <p className={'text-muted-foreground'}>
                <Trans i18nKey={'common:pageNotFoundSubHeading'} />
              </p>
            </div>

            <BackButton variant={'outline'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withI18n(NotFoundPage);
