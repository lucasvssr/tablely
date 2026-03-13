import { Suspense } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { getRestaurantsAction } from '~/lib/server/restaurant/restaurant-actions';
import { withI18n } from '~/lib/i18n/with-i18n';

// Use components from the public restaurants page
import { RestaurantSearchBar } from '~/(home)/restaurants/_components/restaurant-search-bar';
import { RestaurantCard } from '../_components/restaurant-card';

interface RestaurantsPageProps {
    searchParams: Promise<{ q?: string }>;
}

async function RestaurantsDashboardPage({ searchParams }: RestaurantsPageProps) {
    const { q } = await searchParams;
    const allRestaurants = await getRestaurantsAction();
    const i18n = await createI18nServerInstance();

    const query = q?.toLowerCase().trim() ?? '';
    const restaurants = query
        ? allRestaurants.filter(
            (r) =>
                r.name?.toLowerCase().includes(query) ||
                r.location?.toLowerCase().includes(query)
        )
        : allRestaurants;

    return (
        <>
            <PageHeader
                title={i18n.t('home:browseRestaurants')}
                description={i18n.t('home:browseRestaurantsSubtitle')}
            />

            <PageBody>
                <div className="flex flex-col gap-8">
                    {/* Search bar */}
                    <div className="max-w-xl">
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

                    {/* Grid */}
                    {restaurants.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {restaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-20 flex flex-col items-center gap-4 bg-muted/20 rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/10">
                            <p className="text-lg text-muted-foreground">
                                <Trans i18nKey="home:noRestaurantsAvailable" />
                            </p>
                        </div>
                    )}
                </div>
            </PageBody>
        </>
    );
}



export default withI18n(RestaurantsDashboardPage);
