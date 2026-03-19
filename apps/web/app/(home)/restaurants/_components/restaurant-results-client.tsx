'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Map as MapIcon, Utensils, SearchX } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { Trans } from '@kit/ui/trans';
import { RestaurantsMap } from './restaurants-map-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface RestaurantItem {
    id: string;
    name: string;
    location: string;
    phone: string;
    slug: string;
    lat: number | null;
    lng: number | null;
}

interface RestaurantResultsClientProps {
    restaurants: RestaurantItem[];
    allRestaurantsEmpty: boolean;
    children: React.ReactNode;
}

export function RestaurantResultsClient({ 
    restaurants, 
    allRestaurantsEmpty, 
    children 
}: RestaurantResultsClientProps) {
    const [view, setView] = useState<'list' | 'map'>('list');
    const { t } = useTranslation('restaurant');
    const searchParams = useSearchParams();
    const focusId = searchParams.get('focus');

    const [prevFocusId, setPrevFocusId] = useState<string | null>(null);

    // Auto-switch to map view ONLY when a NEW focus is selected
    useEffect(() => {
        if (focusId && focusId !== prevFocusId) {
            setView('map');
            setPrevFocusId(focusId);
        } else if (!focusId) {
            setPrevFocusId(null);
        }
    }, [focusId, prevFocusId]);

    const handleViewChange = (newView: string) => {
        setView(newView as 'list' | 'map');
    };

    // Scroll to map when focusId is present and view is map
    useEffect(() => {
        if (view === 'map' && focusId) {
            const timer = setTimeout(() => {
                document.getElementById('establishments-map-container')?.scrollIntoView({ behavior: 'smooth' });
            }, 400); // Increased a bit for more stability
            return () => clearTimeout(timer);
        }
    }, [view, focusId]);

    if (allRestaurantsEmpty) {
        return (
            <div className="text-center py-20 flex flex-col items-center gap-4 bg-muted/20 rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/10">
                <Utensils className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                    <Trans i18nKey="home:noRestaurantsAvailable" />
                </p>
            </div>
        );
    }

    if (restaurants.length === 0) {
        return (
            <div className="text-center py-20 flex flex-col items-center gap-4 bg-muted/20 rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/10">
                <SearchX className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-1">
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                        <Trans i18nKey="home:noMatchingRestaurant" />
                    </p>
                    <p className="text-muted-foreground">
                        <Trans i18nKey="home:tryAnotherName" />
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-center sm:justify-end">
                <Tabs value={view} onValueChange={handleViewChange} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-2 sm:w-[300px] h-11 p-1 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 rounded-full">
                        <TabsTrigger 
                            value="list" 
                            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">{t('switcher.list')}</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="map" 
                            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                        >
                            <MapIcon className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">{t('switcher.map')}</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {view === 'list' ? (
                        <motion.div
                            key="list-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {children}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="map-view"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="h-[600px] w-full"
                            id="establishments-map-container"
                        >
                            <RestaurantsMap restaurants={restaurants} className="h-full w-full border-none shadow-2xl overflow-hidden rounded-3xl" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
