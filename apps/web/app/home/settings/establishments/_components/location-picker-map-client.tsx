'use client';

import dynamic from 'next/dynamic';

import { useTranslation } from 'react-i18next';

function MapLoading() {
    const { t } = useTranslation('restaurant');
    return (
        <div className="h-[300px] w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg border-2 border-dashed">
            <p className="text-sm text-zinc-400">{t('map.loading')}</p>
        </div>
    );
}

export const LocationPickerMap = dynamic(
    () => import('./location-picker-map').then((mod) => mod.LocationPickerMap),
    {
        ssr: false,
        loading: MapLoading
    }
);
