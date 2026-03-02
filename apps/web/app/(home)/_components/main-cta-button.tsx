import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { CtaButton } from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

export function MainCallToActionButton() {
    return (
        <div className={'flex flex-wrap items-center gap-3'}>
            <CtaButton>
                <Link href={'/auth/sign-up'}>
                    <span className={'flex items-center space-x-0.5'}>
                        <span>
                            <Trans i18nKey={'common:getStarted'} />
                        </span>

                        <ArrowRightIcon
                            className={
                                'animate-in fade-in slide-in-from-left-8 h-4' +
                                ' zoom-in fill-mode-both delay-1000 duration-1000'
                            }
                        />
                    </span>
                </Link>
            </CtaButton>

            <CtaButton variant={'link'} className="text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                <Link href={'/contact'}>
                    <Trans i18nKey={'common:contactUs'} />
                </Link>
            </CtaButton>
        </div>
    );
}
