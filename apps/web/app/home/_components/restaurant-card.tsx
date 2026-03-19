'use client';

import { MapPin, Utensils, Map as MapIcon, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import pathsConfig from '~/config/paths.config';
import Link from 'next/link';
import { Trans } from '@kit/ui/trans';

interface Restaurant {
    id: string;
    name: string;
    location: string | null;
    slug: string;
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    const bookingPath = `${pathsConfig.app.booking}/${restaurant.slug}`;
    const focusPath = `?focus=${restaurant.id}`;

    return (
        <Card
            className="overflow-hidden flex flex-row items-center hover:shadow-lg transition-all duration-300 border-zinc-200/50 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm group/restaurant rounded-xl h-28 hover:border-brand-copper/30 active:scale-[0.98]"
        >
            <div className="w-24 h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <div className="bg-gradient-to-br from-brand-copper/5 to-orange-500/5 w-full h-full flex items-center justify-center group-hover/restaurant:bg-brand-copper/10 transition-colors">
                    <Utensils className="h-8 w-8 text-brand-copper/15" />
                </div>
            </div>
            <div className="flex flex-col flex-1 p-4 min-w-0">
                <CardHeader className="p-0 mb-1">
                    <CardTitle className="text-base font-bold group-hover/restaurant:text-brand-copper transition-colors truncate">
                        {restaurant.name}
                    </CardTitle>
                </CardHeader>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-3 font-medium">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-copper/70" />
                    <span className="truncate">{restaurant.location}</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-medium"
                    >
                        <Link href={focusPath} scroll={false}>
                            <MapIcon className="mr-1.5 h-3.5 w-3.5 text-zinc-500" />
                            <Trans i18nKey="home:seeOnMap" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        className="bg-brand-copper hover:bg-brand-copper/90 shadow-md shadow-brand-copper/10 text-xs h-7 px-3 font-semibold"
                    >
                        <Link href={bookingPath}>
                            <Trans i18nKey="home:bookNow" />
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-white/90" />
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
