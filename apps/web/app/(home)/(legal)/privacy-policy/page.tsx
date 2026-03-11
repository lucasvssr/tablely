import { SitePageHeader } from '~/(home)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('home:privacyPolicy'),
  };
}

async function PrivacyPolicyPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t('home:privacyPolicy')}
        subtitle={t('home:privacyPolicyDescription')}
      />

      <div className={'container mx-auto py-12 max-w-4xl'}>
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
          <section className="space-y-4">
            <p className="text-right text-muted-foreground text-sm">
              {t('home:privacyPolicyLastUpdated', {
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
              {t('home:privacyPolicyResponsibilityDataTreatmentTitle')}
            </h2>
            <p>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('home:privacyPolicyResponsibilityDataTreatmentContent'),
                }}
              />
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('home:privacyPolicyDataCollectedTitle')}
            </h2>
            {(
              t('home:privacyPolicyDataCollectedContent', {
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
              {t('home:privacyPolicyTreatmentPurposeTitle')}
            </h2>
            {(
              t('home:privacyPolicyTreatmentPurposeContent', {
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
              {t('home:privacyPolicyShareDataTitle')}
            </h2>
            {(
              t('home:privacyPolicyShareDataContent', {
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
              {t('home:privacyPolicyDataRetentionTitle')}
            </h2>
            <p>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('home:privacyPolicyDataRetentionContent'),
                }}
              />
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('home:privacyPolicyUserRightsTitle')}
            </h2>
            {(
              t('home:privacyPolicyUserRightsContent', {
                returnObjects: true,
                email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
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
              {t('home:privacyPolicySecurityTitle')}
            </h2>
            <p>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('home:privacyPolicySecurityContent'),
                }}
              />
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default withI18n(PrivacyPolicyPage);
