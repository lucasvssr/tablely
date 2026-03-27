import { PageBody, PageHeader } from '@kit/ui/page';
import pathsConfig from '~/config/paths.config';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '~/lib/database.types';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { DashboardDemo } from '~/home/_components/dashboard-demo';
import { PublicPageLinkCard } from './_components/public-page-link-card';
import { getDashboardStatsAction, getDailyReservationsAction, getActiveMembership, getActiveRestaurant } from '~/lib/server/restaurant/restaurant-actions';
import { ReservationsList, Reservation } from './_components/reservations-list';
import { format } from 'date-fns';
import { Button } from '@kit/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Utensils, Search } from 'lucide-react';
import { BookingFinalizer } from './_components/booking-finalizer';
import { Suspense } from 'react';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { getClientReservationsAction, getRestaurantsAction } from '~/lib/server/restaurant/restaurant-actions';
import { ClientReservationsList } from './_components/client-reservations-list';
import { RestaurantCard } from './_components/restaurant-card';

export default async function HomePage() {
  const user = await requireUserInServerComponent();
  const supabase = getSupabaseServerClient<Database>();
  const i18n = await createI18nServerInstance();

  // Get user profile for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'client';

  const membership = await getActiveMembership(supabase, user.id);
  const activeRestaurantId = await getActiveRestaurant(supabase, user.id);
  const restaurants = (membership?.accounts as unknown as { restaurants: { id: string; slug: string }[] })?.restaurants || [];
  const activeRestaurant = restaurants.find((r) => r.id === activeRestaurantId) || restaurants[0];
  
  // Use restaurant slug if available
  const restaurantSlug = activeRestaurant?.slug;

  if (role === 'client') {
    const [clientReservations, allRestaurants] = await Promise.all([
      getClientReservationsAction(user.id),
      getRestaurantsAction()
    ]);

    // Set page headers

    return (
      <>
        <PageHeader
          title={i18n.t('dashboard:welcome.title')}
          description={i18n.t('dashboard:welcome.description')}
        />
        <Suspense fallback={null}>
          <BookingFinalizer />
        </Suspense>
        <PageBody>
          <div className="flex flex-col gap-10 w-full">
            <div className="w-full">
              <ClientReservationsList reservations={clientReservations} />
            </div>

            <div className="w-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xl font-bold font-heading">{i18n.t('dashboard:welcome.readyTitle')}</h3>
                <Button asChild variant="link" size="sm" className="text-brand-copper h-auto p-0 text-sm">
                  <Link href={pathsConfig.app.restaurants} className="flex items-center gap-1.5 font-semibold">
                    {i18n.t('dashboard:welcome.browseButton')}
                    <Search className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allRestaurants.slice(0, 6).map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </div>
          </div>
        </PageBody>
      </>
    );
  }

  // If restaurateur but no organization yet
  if (!membership || !restaurantSlug) {
    const isMember = role === 'member';

    return (
      <>
        <PageHeader
          title={i18n.t('dashboard:setup.title')}
          description={i18n.t('dashboard:setup.description')}
        />
        <PageBody>
          <Card className="max-w-2xl shadow-xl bg-gradient-to-br from-background to-muted/20 border-0 border-l-4 border-l-brand-copper">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-brand-copper" />
                {isMember
                  ? i18n.t('dashboard:setup.noAccessTitle')
                  : i18n.t('dashboard:setup.createTitle')}
              </CardTitle>
              <CardDescription>
                {isMember
                  ? i18n.t('dashboard:setup.noAccessDescription')
                  : i18n.t('dashboard:setup.createDescription')}
              </CardDescription>
            </CardHeader>
            {!isMember && (
              <CardContent>
                <Button asChild size="lg" className="bg-brand-copper hover:bg-brand-copper/90">
                  <Link href="/home/settings/restaurant/new">
                    {i18n.t('dashboard:setup.createButton')}
                  </Link>
                </Button>
              </CardContent>
            )}
          </Card>
        </PageBody>
      </>
    );
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const [stats, reservations] = await Promise.all([
    getDashboardStatsAction({}),
    getDailyReservationsAction({ date: today })
  ]);

  return (
    <>
      <PageHeader
        title={i18n.t('dashboard:main.title')}
        description={i18n.t('dashboard:main.description')}
      />
      <Suspense fallback={null}>
        <BookingFinalizer />
      </Suspense>

      <PageBody>
        <div className="flex flex-col gap-10">
          {restaurantSlug && (
            <div className="max-w-xl px-6">
              <PublicPageLinkCard slug={restaurantSlug} />
            </div>
          )}

          <div className="flex flex-col gap-10" id="reservations-section">
            <div className="flex flex-col gap-10 px-6 py-6">
              <ReservationsList
                key={activeRestaurantId}
                initialReservations={reservations as Reservation[]}
                accountId={membership.account_id}
              />
              <DashboardDemo key={activeRestaurantId} stats={stats} />
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
