'use client';

import dynamic from 'next/dynamic';
import { Utensils } from 'lucide-react';

import { useTranslation } from 'react-i18next';

function MapLoading() {
    const { t } = useTranslation('restaurant');
    return (
        <div className="h-full w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-2 border-dashed">
            <div className="text-zinc-400 flex flex-col items-center gap-2">
                <Utensils className="h-8 w-8 animate-pulse" />
                <p className="text-sm font-medium">{t('map.loading')}</p>
            </div>
        </div>
    );
}

export const RestaurantsMap = dynamic(
    () => import('./restaurants-map').then((mod) => mod.RestaurantsMap),
    {
        ssr: false,
        loading: MapLoading
    }
);
