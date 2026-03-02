import { SitePageHeader } from '~/(home)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('home:termsOfService'),
  };
}

async function TermsOfServicePage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t(`home:termsOfService`)}
        subtitle={t(`home:termsOfServiceDescription`)}
      />

      <div className={'container mx-auto py-12 max-w-4xl'}>
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
          <section className="space-y-4">
            <p className="text-right text-muted-foreground text-sm">{t('home:termsOfServiceLastUpdated', { date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) })}</p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t('home:termsOfServiceContent')}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('home:termsOfServicePresentationTitle')}</h2>
            <p>{t('home:termsOfServicePresentationContent')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('home:termsOfServiceAccessInscriptionTitle')}</h2>
            <p>{t('home:termsOfServiceAccessInscriptionContent')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('home:termsOfServiceReservationServiceTitle')}</h2>
            {(t('home:termsOfServiceReservationServiceContent', { returnObjects: true }) as string[]).map((item, i) => (
              <p key={i}>{item}</p>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('home:termsOfServiceNoShowPaymentTitle')}</h2>
            {(t('home:termsOfServiceNoShowPaymentContent', { returnObjects: true }) as string[]).map((item, i) => (
              <p key={i}>{item}</p>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('home:termsOfServiceResponsibilitiesTitle')}</h2>
            {(t('home:termsOfServiceResponsibilitiesContent', { returnObjects: true }) as string[]).map((item, i) => (
              <p key={i}>{item}</p>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('home:termsOfServiceRGPDTitle')}</h2>
            {(
              t('home:termsOfServiceRGPDContent', {
                returnObjects: true,
              }) as (string | string[])[]
            ).map((content, i) => {
              if (Array.isArray(content)) {
                return (
                  <ul key={i} className="list-disc pl-6 space-y-2">
                    {content.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i}>{content}</p>;
            })}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('home:termsOfServiceIPTitle')}</h2>
            <p>{t('home:termsOfServiceIPContent')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('home:termsOfServiceModificationTitle')}</h2>
            <p>{t('home:termsOfServiceModificationContent')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default withI18n(TermsOfServicePage);
