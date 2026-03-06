'use client';

import Link from 'next/link';
import { Trans } from '@kit/ui/trans';
import { AppLogo } from '~/components/app-logo';
import { ModeToggle } from '@kit/ui/mode-toggle';
import appConfig from '~/config/app.config';

export function PublicFooter() {
    return (
        <footer className="pt-32 pb-16 bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-copper/5 dark:bg-brand-copper/10 rounded-full blur-[150px]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                    <div className="md:col-span-2 space-y-8">
                        <AppLogo className="scale-125 origin-left w-min" />
                        <p className="text-zinc-600 dark:text-zinc-400 text-xl font-medium max-w-sm leading-relaxed mt-8">
                            <Trans i18nKey="home:footerDescription" />
                        </p>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                            <Trans i18nKey="home:product" />
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/pricing" className="text-zinc-600 dark:text-zinc-300 hover:text-brand-copper transition-colors text-lg font-medium">
                                    <Trans i18nKey="home:pricing" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
                            <Trans i18nKey="home:legal" />
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/terms-of-service" className="text-zinc-600 dark:text-zinc-300 hover:text-brand-copper transition-colors text-lg font-medium">
                                    <Trans i18nKey="home:termsOfService" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-zinc-600 dark:text-zinc-300 hover:text-brand-copper transition-colors text-lg font-medium">
                                    <Trans i18nKey="home:privacyPolicy" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookie-policy" className="text-zinc-600 dark:text-zinc-300 hover:text-brand-copper transition-colors text-lg font-medium">
                                    <Trans i18nKey="home:cookiePolicy" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-16 border-t border-zinc-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                        <Trans
                            i18nKey="home:copyright"
                            values={{
                                product: appConfig.name,
                                year: new Date().getFullYear(),
                            }}
                        />
                    </p>
                    <div className="flex items-center gap-8">
                        <ModeToggle className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" />
                        <Link href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Twitter</Link>
                        <Link href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">LinkedIn</Link>
                        <Link href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Instagram</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
