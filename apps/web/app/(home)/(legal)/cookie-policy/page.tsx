import { SitePageHeader } from '~/(home)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('home:cookiePolicy'),
  };
}

async function CookiePolicyPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t(`home:cookiePolicy`)}
        subtitle={t(`home:cookiePolicyDescription`)}
      />

      <div className={'container mx-auto py-12 max-w-4xl'}>
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
          <section className="space-y-4">
            <p className="text-right text-muted-foreground text-sm">
              {t('home:cookiePolicyLastUpdated', {
                date: new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              })}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('home:cookiePolicyWhatIsACookieTitle')}
            </h2>
            <p>
              <span dangerouslySetInnerHTML={{ __html: t('home:cookiePolicyWhatIsACookieContent') }} />
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('home:cookiePolicyWhyDoWeUseCookiesTitle')}
            </h2>
            <p>
              <span dangerouslySetInnerHTML={{ __html: t('home:cookiePolicyWhyDoWeUseCookiesContent') }} />
            </p>

            <div className="space-y-8 mt-6">
              {[
                'home:cookiePolicyNecessaryList',
                'home:cookiePolicyFunctionalityList',
                'home:cookiePolicyAnalyticsList',
              ].map((key) => {
                const content = t(key, {
                  returnObjects: true,
                }) as (string | string[])[];

                return (
                  <div key={key} className="space-y-2">
                    {content.map((item, i) => {
                      if (Array.isArray(item)) {
                        return (
                          <ul key={i} className="list-disc pl-6 space-y-2">
                            {item.map((li, j) => (
                              <li key={j}>
                                <span dangerouslySetInnerHTML={{ __html: li }} />
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <h3 key={i} className="text-lg font-semibold">
                          <span dangerouslySetInnerHTML={{ __html: item }} />
                        </h3>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('home:cookiePolicyChoiceTitle')}
            </h2>
            {(
              t('home:cookiePolicyChoiceContent', {
                returnObjects: true,
              }) as (string | string[])[]
            ).map((content, i) => {
              if (Array.isArray(content)) {
                return (
                  <ul key={i} className="list-disc pl-6 space-y-2">
                    {content.map((item, j) => (
                      <li key={j}>
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i}>
                  <span dangerouslySetInnerHTML={{ __html: content }} />
                </p>
              );
            })}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('home:cookiePolicyParametrageNavigateurTitle')}
            </h2>
            {(
              t('home:cookiePolicyParametrageNavigateurContent', {
                returnObjects: true,
              }) as (string | string[])[]
            ).map((content, i) => {
              if (Array.isArray(content)) {
                return (
                  <ul key={i} className="list-disc pl-6 space-y-2">
                    {content.map((item, j) => (
                      <li key={j}>
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i}>
                  <span dangerouslySetInnerHTML={{ __html: content }} />
                </p>
              );
            })}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('home:cookiePolicyContactTitle')}
            </h2>
            <p>
              <span dangerouslySetInnerHTML={{ __html: t('home:cookiePolicyContactContent', { email: process.env.NEXT_PUBLIC_CONTACT_EMAIL }) }} />
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default withI18n(CookiePolicyPage);
