import Link from 'next/link';

import { ArrowRight, ChevronDown } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@kit/ui/card';

import { SitePageHeader } from '~/(home)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('home:faq'),
  };
};

async function FAQPage() {
  const { t } = await createI18nServerInstance();

  // replace this content with translations
  const faqItems = [
    {
      question: t('home:faqQ1'),
      answer: t('home:faqA1'),
    },
    {
      question: t('home:faqQ2'),
      answer: t('home:faqA2'),
    },
    {
      question: t('home:faqQ3'),
      answer: t('home:faqA3'),
    },
    {
      question: t('home:faqQ4'),
      answer: t('home:faqA4'),
    },
    {
      question: t('home:faqQ5'),
      answer: t('home:faqA5'),
    },
    {
      question: t('home:faqQ6'),
      answer: t('home:faqA6'),
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => {
      return {
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      };
    }),
  };

  return (
    <>
      <script
        key={'ld:json'}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={'flex flex-col space-y-4 xl:space-y-8'}>
        <SitePageHeader
          title={t('home:faq')}
          subtitle={t('home:faqSubtitle')}
        />

        <div className={'container pt-8 xl:pt-12'}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 pb-16">
            <div className="lg:col-span-2 flex flex-col space-y-8">
              <div className="flex w-full flex-col">
                {faqItems.map((item, index) => {
                  return <FaqItem key={index} item={item} />;
                })}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-white/5">
                <CardHeader>
                  <CardTitle className="text-xl">
                    <Trans i18nKey={'home:contact'} />
                  </CardTitle>
                  <CardDescription>
                    <Trans i18nKey={'home:faqSubtitle'} />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <Trans i18nKey={'home:contactFaq'} />
                  </p>
                  <Button asChild className="w-full">
                    <Link href={'/contact'}>
                      <span>
                        <Trans i18nKey={'home:contact'} />
                      </span>
                      <ArrowRight className={'ml-2 w-4'} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withI18n(FAQPage);

function FaqItem({
  item,
}: React.PropsWithChildren<{
  item: {
    question: string;
    answer: string;
  };
}>) {
  return (
    <details
      name="faq"
      className={'group border-b px-2 py-4 last:border-b-transparent'}
    >
      <summary
        className={
          'flex items-center justify-between hover:cursor-pointer hover:underline'
        }
      >
        <h2
          className={
            'hover:underline-none cursor-pointer font-sans font-medium'
          }
        >
          {item.question}
        </h2>

        <div>
          <ChevronDown
            className={'h-5 transition duration-300 group-open:-rotate-180'}
          />
        </div>
      </summary>

      <div className={'text-muted-foreground flex flex-col space-y-2 py-1'}>
        {item.answer}
      </div>
    </details>
  );
}
