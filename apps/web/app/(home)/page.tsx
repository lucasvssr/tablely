import Image from 'next/image';
import Link from 'next/link';

import { LayoutDashboard } from 'lucide-react';


import {
  CtaButton,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  Pill,
} from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

import { MainCallToActionButton } from './_components/main-cta-button';

import DualExperienceSection from './_components/dual-experience-section';
import HowItWorksSection from './_components/how-it-works-section';

function Home() {
  return (
    <div className={'flex flex-col space-y-16 md:space-y-24 pb-24 pt-16'}>
      <div className={'container mx-auto px-4 md:px-6'}>
        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-8 md:p-16 border border-zinc-200 dark:border-white/5 shadow-sm">
          {/* Decorative background elements */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(var(--brand-copper-rgb),0.15)_0%,transparent_70%)]" />
          <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(113,113,122,0.1)_0%,transparent_70%)]" />

          <div className="relative grid gap-8 md:gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col space-y-6 md:space-y-8">
              <div>
                <Pill label={'Tablely'} className="bg-zinc-300/50 dark:bg-zinc-900 text-white dark:text-zinc-50 border-zinc-500">
                  <Trans i18nKey={'home:heroPill'} />
                </Pill>
              </div>

              <div className="space-y-4">
                <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-6xl text-balance">
                  <Trans i18nKey={'home:title'} />
                </h1>
                <p className="max-w-xl text-base sm:text-lg text-muted-foreground">
                  <Trans i18nKey={'home:subtitle'} />
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <MainCallToActionButton />
              </div>
            </div>

            <div className="relative w-full mt-4 lg:mt-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-copper/20 to-transparent blur-2xl" />
              <div className="relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-2 shadow-2xl shadow-zinc-400 dark:shadow-white/10 backdrop-blur-sm overflow-hidden">
                <Image
                  priority
                  fetchPriority="high"
                  className={'rounded-xl border border-white/5 shadow-inner w-full h-auto'}
                  width={3558}
                  height={2222}
                  src="/images/dashboard.webp"
                  alt="Tablely Dashboard"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={'container mx-auto px-4 md:px-6 space-y-16'}>
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <Trans i18nKey={'home:dualExperienceHeading'} />
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            <Trans i18nKey={'home:dualExperienceSubtitle'} />
          </p>
        </div>
        <DualExperienceSection />
      </div>

      <div id={'features'} className={'container mx-auto px-4 md:px-6'}>
        <div
          className={'flex flex-col space-y-16 xl:space-y-32 2xl:space-y-36'}
        >
          <FeatureShowcase
            heading={
              <>
                <b className="font-heading font-semibold text-zinc-900 dark:text-white">
                  <Trans i18nKey={'home:featuresHeading'} />
                </b>
                .{' '}
                <span className="text-muted-foreground font-normal font-sans">
                  <Trans i18nKey={'home:featuresSubtitle'} />
                </span>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <LayoutDashboard className="h-5 text-brand-copper" />
                <span className="font-heading font-medium">
                  <Trans i18nKey={'home:featuresPill'} />
                </span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              <FeatureCard
                className={'relative col-span-2 overflow-hidden border-stone-300 bg-white dark:border-zinc-700 dark:bg-zinc-900/50'}
                label={<span className="font-heading text-lg"><Trans i18nKey={'home:feature1Label'} /></span>}
                description={<Trans i18nKey={'home:feature1Description'} />}
              />

              <FeatureCard
                className={'relative col-span-2 w-full overflow-hidden border-stone-300 bg-white lg:col-span-1 dark:border-zinc-700 dark:bg-zinc-900/50'}
                label={<span className="font-heading text-lg"><Trans i18nKey={'home:feature2Label'} /></span>}
                description={<Trans i18nKey={'home:feature2Description'} />}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden border-stone-300 bg-white lg:col-span-1 dark:border-zinc-700 dark:bg-zinc-900/50'}
                label={<span className="font-heading text-lg"><Trans i18nKey={'home:feature3Label'} /></span>}
                description={<Trans i18nKey={'home:feature3Description'} />}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden border-stone-300 bg-white dark:border-zinc-700 dark:bg-zinc-900/50'}
                label={<span className="font-heading text-lg"><Trans i18nKey={'home:feature4Label'} /></span>}
                description={<Trans i18nKey={'home:feature4Description'} />}
              />
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>

      <div className={'container mx-auto px-4 md:px-6 space-y-16'}>
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <Trans i18nKey={'home:howItWorksHeading'} />
          </h2>
        </div>
        <HowItWorksSection />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-950 p-8 md:p-16 text-center text-zinc-900 dark:text-white shadow-2xl shadow-brand-copper-foreground/20">
          <h2 className="font-heading text-3xl font-bold md:text-5xl mb-6">
            <Trans i18nKey={'home:title'} />
          </h2>
          <p className="text-zinc-900 dark:text-white text-lg mb-10 max-w-2xl mx-auto opacity-100">
            <Trans i18nKey={'home:subtitle'} />
          </p>
          <div className="flex justify-center">
            <CtaButton className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-none px-8 py-6 text-lg">
              <Link href={'/auth/sign-up'}>
                <Trans i18nKey={'common:getStarted'} />
              </Link>
            </CtaButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);
