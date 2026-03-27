import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, ArrowLeft } from 'lucide-react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '~/lib/database.types';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Button } from '@kit/ui/button';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import pathsConfig from '~/config/paths.config';

import { BookingContainer, type UserWithProfile } from '../../../restaurant/[slug]/_components/booking-container';
import { getRestaurantBySlugAction, getUserReservationsAction } from '~/lib/server/restaurant/restaurant-actions';
import { UserReservations } from '../../../restaurant/[slug]/_components/user-reservations';

interface BookingPageProps {
    params: Promise<{
        slug: string;
    }>;
}

async function BookingDashboardPage({ params }: BookingPageProps) {
    const { slug } = await params;
    const user = await requireUserInServerComponent();
    const supabase = getSupabaseServerClient<Database>();
    const { t } = await createI18nServerInstance();

    // Fetch restaurant data
    const restaurantData = await getRestaurantBySlugAction(slug);

    if (!restaurantData) {
        return notFound();
    }

    const { restaurant } = restaurantData;

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const reservations = await getUserReservationsAction({
        restaurantId: restaurant.id,
        userId: user.id,
    });

    return (
        <>
            <PageHeader
                title={
                    <div className="flex flex-col gap-2">
                        <Button asChild variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground hover:text-brand-copper transition-colors">
                            <Link href={pathsConfig.app.restaurants} className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t('home:viewAllRestaurants')}
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
                    </div>
                }
                description={
                    <div className="flex flex-col gap-3 mt-1">
                        <div className="flex flex-wrap gap-4 text-sm font-medium">
                            {restaurant.location && (
                                <div className="flex items-center gap-1.5 text-zinc-500">
                                    <MapPin className="w-4 h-4 text-brand-copper/70" />
                                    <span>{restaurant.location}</span>
                                </div>
                            )}
                            {restaurant.phone && (
                                <div className="flex items-center gap-1.5 text-zinc-500">
                                    <Phone className="w-4 h-4 text-brand-copper/70" />
                                    <span>{restaurant.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                }
            />

            <PageBody>
                <div className="flex flex-col gap-12 max-w-5xl mx-auto mb-12">
                    {/* Reservations Section */}
                    {reservations.length > 0 && (
                        <div className="bg-muted/30 rounded-3xl border border-zinc-200 dark:border-white/10 p-6 md:p-10">
                            <UserReservations
                                restaurantId={restaurant.id}
                                userId={user.id}
                                initialReservations={reservations}
                            />
                        </div>
                    )}

                    {/* Booking Section */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-copper/10 via-zinc-500/5 to-transparent blur-3xl opacity-50 pointer-events-none" />
                        <div className="relative">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                                    {t('public:landing.readyToJoin')}
                                </h2>
                                <p className="text-muted-foreground">
                                    {t('public:landing.readyDescription')}
                                </p>
                            </div>
                            <BookingContainer
                                restaurantId={restaurant.id}
                                user={{
                                    ...user,
                                    profile: profile || null,
                                } as unknown as UserWithProfile}
                            />
                        </div>
                    </div>
                </div>
            </PageBody>
        </>
    );
}

export default withI18n(BookingDashboardPage);
