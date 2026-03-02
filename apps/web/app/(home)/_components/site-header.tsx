'use client';

import type { JwtPayload } from '@supabase/supabase-js';
import { AppLogo } from '~/components/app-logo';
import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';

export function SiteHeader(props: { user?: JwtPayload | null }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          <AppLogo />
          <nav className="hidden lg:block">
            <SiteNavigation />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SiteHeaderAccountSection user={props.user ?? null} />
        </div>
      </div>
    </header>
  );
}
