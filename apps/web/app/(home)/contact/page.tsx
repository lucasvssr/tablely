import { withI18n } from '~/lib/i18n/with-i18n';
import { Trans } from '@kit/ui/trans';
import { Heading } from '@kit/ui/heading';
import { Button } from '@kit/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { SiteHeader } from '~/(home)/_components/site-header';

function ContactPage() {
  return (
    <div className={'flex flex-col min-h-screen'}>
      <SiteHeader />
      
      <div className={'container mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center space-y-8'}>
        <div className="text-center space-y-4">
          <Heading level={1} className="font-heading text-4xl md:text-5xl font-bold">
            <Trans i18nKey={'common:contactUs'} />
          </Heading>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-lg mx-auto">
            <Trans i18nKey={'home:contactDescriptionFull'} />
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-brand-copper/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-brand-copper" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">
              <Trans i18nKey={'home:contactEmailTitle'} />
            </h3>
            <p className="text-muted-foreground">
              <Trans i18nKey={'home:contactEmailSubtitle'} />
            </p>
            <a 
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@project.com'}`} 
              className="text-brand-copper hover:underline text-lg font-medium block pt-2"
            >
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@project.com'}
            </a>
          </div>
        </div>

        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Trans i18nKey={'home:contactBackHome'} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default withI18n(ContactPage);
