import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

export function AuthLayoutShell({
  children,
  Logo,
}: React.PropsWithChildren<{
  Logo?: React.ComponentType;
}>) {
  return (
    <div
      className={
        'flex min-h-screen flex-col items-center justify-center' +
        ' bg-background lg:bg-muted/30 gap-y-10 lg:gap-y-8 px-4 py-8' +
        ' animate-in fade-in slide-in-from-top-16 zoom-in-95 duration-1000' +
        ' relative'
      }
    >
      <div className={'absolute left-4 top-4 lg:left-8 lg:top-8'}>
        <Button asChild variant={'ghost'} size={'sm'}>
          <Link href={'/'} className={'flex items-center gap-2'}>
            <ChevronLeft className={'h-4 w-4'} />
            <Trans i18nKey={'common:goBack'} />
          </Link>
        </Button>
      </div>

      {Logo ? <Logo /> : null}

      <div
        className={`bg-background flex w-full max-w-[28rem] flex-col gap-y-6 rounded-lg px-6 md:w-8/12 md:px-8 md:py-6 lg:w-5/12 lg:px-8 xl:w-5/12 xl:gap-y-8 xl:py-8`}
      >
        {children}
      </div>
    </div>
  );
}
