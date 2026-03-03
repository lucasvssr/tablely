import { PageBody, PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { DashboardDemo } from '~/home/_components/dashboard-demo';
import { PublicPageLinkCard } from './_components/public-page-link-card';
import { getDashboardStatsAction, getDailyReservationsAction, getActiveMembership } from '~/lib/server/restaurant/restaurant-actions';
import { ReservationsList, Reservation } from './_components/reservations-list';
import { format } from 'date-fns';
import { Button } from '@kit/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Utensils, Search } from 'lucide-react';
import { BookingFinalizer } from './_components/booking-finalizer';
import { Suspense } from 'react';

export default async function HomePage() {
  const user = await requireUserInServerComponent();
  const supabase = getSupabaseServerClient();

  // Get user profile for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'client';

  // Get user's active account (Organization/Restaurant)
  const membership = await getActiveMembership(supabase, user.id);

  const slug = (membership?.accounts as Record<string, string> | null)?.slug;

  if (role === 'client') {
    return (
      <>
        <PageHeader
          title="Bienvenue sur Tablely"
          description="Trouvez et réservez les meilleures tables près de chez vous."
        />
        <Suspense fallback={null}>
          <BookingFinalizer />
        </Suspense>
        <PageBody>
          <Card className="max-w-2xl border-none shadow-xl bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <CardTitle>Prêt pour une expérience culinaire ?</CardTitle>
              <CardDescription>
                Explorez nos restaurants partenaires et réservez votre table en quelques clics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/restaurants">
                  <Search className="mr-2 h-4 w-4" />
                  Parcourir les restaurants
                </Link>
              </Button>
            </CardContent>
          </Card>
        </PageBody>
      </>
    );
  }

  // If restaurateur but no organization yet
  if (!membership || !slug) {
    return (
      <>
        <PageHeader
          title="Configuration de votre restaurant"
          description="Commençons par créer votre premier établissement."
        />
        <PageBody>
          <Card className="max-w-2xl border-none shadow-xl bg-gradient-to-br from-background to-muted/20 border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-blue-600" />
                Créer votre restaurant
              </CardTitle>
              <CardDescription>
                Vous n&apos;avez pas encore de restaurant configuré. Créez votre établissement pour commencer à gérer vos services et réservations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/home/settings/restaurant/new">
                  Créer mon établissement
                </Link>
              </Button>
            </CardContent>
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
        title="Tableau de bord"
        description="Gérez votre restaurant et vos réservations en un coup d'œil."
      />
      <Suspense fallback={null}>
        <BookingFinalizer />
      </Suspense>

      <PageBody>
        <div className="flex flex-col gap-10">
          {slug && (
            <div className="max-w-xl">
              <PublicPageLinkCard slug={slug} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-10">
              <ReservationsList
                initialReservations={reservations as Reservation[]}
                accountId={membership.account_id}
              />
              <DashboardDemo stats={stats} />
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Secondary column for other widgets if needed */}
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
