'use client';

import { SiteHeaderAccountSection } from '~/(home)/_components/site-header-account-section';

import type { JwtPayload } from '@supabase/supabase-js';

interface RestaurantHeaderProps {
    account: {
        name: string;
    };
    user: JwtPayload | null;
}

export function RestaurantHeader({ account, user }: RestaurantHeaderProps) {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <div className="w-10 h-10 bg-brand-copper rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-copper/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        {account.name.charAt(0)}
                    </div>
                    <span className="font-heading text-xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-brand-copper transition-colors">
                        {account.name}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <SiteHeaderAccountSection user={user} />
                </div>
            </div>
        </header>
    );
}
