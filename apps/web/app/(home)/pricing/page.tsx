import { withI18n } from '~/lib/i18n/with-i18n';
import { Trans } from '@kit/ui/trans';
import { Heading } from '@kit/ui/heading';
import { Button } from '@kit/ui/button';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { SiteHeader } from '~/(home)/_components/site-header';

const plans = [
  {
    nameKey: 'home:pricingFreeName',
    price: '0',
    currency: '€',
    descriptionKey: 'home:pricingFreeDescription',
    features: [
      'home:pricingFreeFeature1',
      'home:pricingFreeFeature2',
      'home:pricingFreeFeature3',
      'home:pricingFreeFeature4',
    ],
    buttonTextKey: 'home:pricingFreeButton',
    href: '/auth/sign-up',
    featured: false,
  },
  {
    nameKey: 'home:pricingProName',
    price: '29',
    currency: '€',
    periodKey: 'home:pricingPeriod',
    descriptionKey: 'home:pricingProDescription',
    features: [
      'home:pricingProFeature1',
      'home:pricingProFeature2',
      'home:pricingProFeature3',
      'home:pricingProFeature4',
      'home:pricingProFeature5',
    ],
    buttonTextKey: 'home:pricingProButton',
    href: '/auth/sign-up',
    featured: true,
  },
  {
    nameKey: 'home:pricingEnterpriseName',
    priceKey: 'home:pricingOnQuote',
    descriptionKey: 'home:pricingEnterpriseDescription',
    features: [
      'home:pricingEnterpriseFeature1',
      'home:pricingEnterpriseFeature2',
      'home:pricingEnterpriseFeature3',
      'home:pricingEnterpriseFeature4',
    ],
    buttonTextKey: 'home:pricingEnterpriseButton',
    href: '/contact',
    featured: false,
  },
];

function PricingPage() {
  return (
    <div className={'flex flex-col min-h-screen'}>
      <SiteHeader />
      
      <div className={'container mx-auto px-4 py-24 flex-1 space-y-16'}>
        <div className="text-center space-y-4 pt-16">
          <Heading level={1} className="font-heading text-4xl md:text-6xl font-bold">
            <Trans i18nKey={'home:pricingTitle'} />
          </Heading>
          <p className="text-zinc-500 dark:text-zinc-400 text-xl max-w-2xl mx-auto">
            <Trans i18nKey={'home:pricingSubtitleFull'} />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.nameKey}
              className={`relative p-8 rounded-3xl border ${
                plan.featured 
                  ? 'border-brand-copper bg-zinc-50 dark:bg-zinc-900/50 shadow-xl scale-105 z-10' 
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
              } flex flex-col space-y-6`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-copper text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                  <Trans i18nKey={'home:pricingPopular'} />
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  <Trans i18nKey={plan.nameKey} />
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {plan.priceKey ? <Trans i18nKey={plan.priceKey} /> : (
                      <>
                        {plan.price}
                        <span className="text-2xl ml-0.5">{plan.currency}</span>
                      </>
                    )}
                  </span>
                  {plan.periodKey && <span className="text-muted-foreground"><Trans i18nKey={plan.periodKey} /></span>}
                </div>
                <p className="text-muted-foreground">
                   <Trans i18nKey={plan.descriptionKey} />
                </p>
              </div>

              <ul className="flex-1 space-y-4">
                {plan.features.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-brand-copper shrink-0" />
                    <span><Trans i18nKey={featureKey} /></span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.featured ? 'default' : 'outline'} 
                className={`w-full py-6 text-lg ${plan.featured ? 'bg-brand-copper hover:bg-brand-copper/90' : ''}`}
                asChild
              >
                <Link href={plan.href}>
                  <Trans i18nKey={plan.buttonTextKey} />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-12 text-center max-w-4xl mx-auto border border-dashed border-zinc-300 dark:border-zinc-700">
           <h3 className="text-2xl font-bold mb-4">
             <Trans i18nKey={'home:pricingDemoTitle'} />
           </h3>
           <p className="text-muted-foreground mb-8 text-lg">
             <Trans i18nKey={'home:pricingDemoSubtitle'} />
           </p>
           <Button variant="outline" size="lg" asChild>
             <Link href="/contact">
               <Trans i18nKey={'home:pricingDemoButton'} />
             </Link>
           </Button>
        </div>
      </div>
    </div>
  );
}

export default withI18n(PricingPage);
