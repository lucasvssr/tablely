'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function RestaurantSearchBar({ defaultValue = '' }: { defaultValue?: string }) {
    const { t } = useTranslation('home');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(defaultValue);

    const handleSearch = useCallback(
        (newValue: string) => {
            setValue(newValue);
            const params = new URLSearchParams(searchParams.toString());
            if (newValue) {
                params.set('q', newValue);
            } else {
                params.delete('q');
            }
            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            });
        },
        [router, pathname, searchParams]
    );

    const handleClear = useCallback(() => {
        setValue('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('q');
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
    }, [router, pathname, searchParams]);

    return (
        <div className="relative w-full max-w-xl">
            <div className="relative flex items-center">
                <Search
                    className={`absolute left-4 h-5 w-5 transition-colors duration-200 ${isPending ? 'text-brand-copper animate-pulse' : 'text-zinc-400'
                        }`}
                />
                <input
                    type="search"
                    value={value}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full h-14 pl-12 pr-12 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-copper/40 focus:border-brand-copper transition-all duration-200 text-base shadow-sm hover:shadow-md"
                />
                {value && (
                    <button
                        onClick={handleClear}
                        type="button"
                        className="absolute right-4 flex items-center justify-center h-7 w-7 rounded-full text-brand-copper hover:text-white hover:bg-brand-copper bg-brand-copper/10 transition-all duration-200"
                        aria-label={t('searchClear')}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
