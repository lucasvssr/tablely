import { getRestaurantsAction } from '~/lib/server/restaurant/restaurant-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import Link from 'next/link';
import { MapPin, Phone, Map as MapIcon, Utensils, ArrowRight } from 'lucide-react';
import { Trans } from '@kit/ui/trans';
import { withI18n } from '~/lib/i18n/with-i18n';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { RestaurantSearchBar } from './_components/restaurant-search-bar';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Suspense } from 'react';
import { RestaurantResultsClient } from './_components/restaurant-results-client';

interface RestaurantsPageProps {
    searchParams: Promise<{ q?: string }>;
}

async function RestaurantsPage({ searchParams }: RestaurantsPageProps) {
    const supabase = getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        return redirect('/home/restaurants');
    }

    const { q } = await searchParams;
    const allRestaurants = await getRestaurantsAction();
    const i18n = await createI18nServerInstance();

    // Filter client-side on the server — fast since data is already loaded
    const query = q?.toLowerCase().trim() ?? '';
    const restaurants = query
        ? allRestaurants.filter(
            (r) =>
                r.name?.toLowerCase().includes(query) ||
                r.location?.toLowerCase().includes(query)
        )
        : allRestaurants;

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    <Trans i18nKey="home:browseRestaurants" />
                </h1>
                <p className="text-xl text-muted-foreground">
                    <Trans i18nKey="home:browseRestaurantsSubtitle" />
                </p>
            </div>

            {/* Search bar */}
            <div className="mb-10 max-w-xl">
                <Suspense>
                    <RestaurantSearchBar defaultValue={q ?? ''} />
                </Suspense>

                {/* Result count */}
                {query && (
                    <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {restaurants.length === 0 ? (
                            <Trans i18nKey="home:noResultsFor" values={{ query: q }} />
                        ) : (
                            <span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                    {i18n.t('home:restaurantsFound', { count: restaurants.length })}
                                </span>{' '}
                                {i18n.t('home:resultsFor', { query: q })}
                            </span>
                        )}
                    </p>
                )}
            </div>

            <RestaurantResultsClient
                restaurants={restaurants}
                allRestaurantsEmpty={allRestaurants.length === 0}
            >
                {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} query={query} />
                ))}
            </RestaurantResultsClient>
        </div>
    );
}

/** Highlight matching text */
function Highlight({ text, query }: { text: string; query: string }) {
    if (!query || !text) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-brand-copper/20 text-brand-copper rounded px-0.5 not-italic">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

interface RestaurantItem {
    id: string;
    name: string;
    location: string;
    phone: string;
    slug: string;
    lat: number | null;
    lng: number | null;
}

function RestaurantCard({ restaurant, query }: { restaurant: RestaurantItem; query: string }) {
    return (
        <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-zinc-200/50 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm group">
            <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-copper/5 to-orange-500/5 group-hover:scale-110 transition-transform duration-500">
                    <Utensils className="h-16 w-16 text-brand-copper/10" />
                </div>
                <div className="absolute top-4 right-4 capitalize">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-zinc-200/50 dark:border-white/10">
                        <Trans i18nKey="home:restaurantType" />
                    </div>
                </div>
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-xl group-hover:text-brand-copper transition-colors">
                    <Highlight text={restaurant.name} query={query} />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <div className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-brand-copper/70" />
                    <span className="line-clamp-2">
                        <Highlight text={restaurant.location} query={query} />
                    </span>
                </div>
                {restaurant.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                        <Phone className="h-4 w-4 shrink-0 text-brand-copper/70" />
                        <span>{restaurant.phone}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0 pb-6 px-6">
                <div className="flex gap-2 w-full flex-wrap">
                    <Button asChild variant="outline" className="flex-1 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95">
                        <Link href={`?focus=${restaurant.id}`} scroll={false}>
                            <MapIcon className="mr-2 h-4 w-4" />
                            <Trans i18nKey="home:seeOnMap" />
                        </Link>
                    </Button>
                    <Button asChild className="flex-1 bg-brand-copper hover:bg-brand-copper/90 shadow-md shadow-brand-copper/10 transition-all active:scale-95">
                        <Link href={`/restaurant/${restaurant.slug}`}>
                            <Trans i18nKey="home:bookNow" />
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

export default withI18n(RestaurantsPage);
