import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '~/lib/database.types';
import { MapPin, Phone, Users, ChevronRight, Star } from 'lucide-react';
import { Metadata } from 'next';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { BookingContainer } from './_components/booking-container';
import { getRestaurantBySlugAction, getUserReservationsAction } from '~/lib/server/restaurant/restaurant-actions';
import { UserReservations } from './_components/user-reservations';
import { SiteHeader } from '~/(marketing)/_components/site-header';
import { PublicFooter } from '~/(marketing)/_components/public-footer';
import {
    CtaButton,
    FeatureCard,
    FeatureGrid,
    Pill,
} from '@kit/ui/marketing';

interface RestaurantPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = getSupabaseServerClient<Database>();
    const { t } = await createI18nServerInstance();

    const { data: account } = await supabase
        .from('accounts')
        .select('name')
        .eq('slug', slug)
        .single();

    if (!account) return { title: 'Restaurant non trouvé' };

    return {
        title: t('public:metadata.bookingTitle', { name: account.name }),
        description: t('public:metadata.bookingDescription', { name: account.name }),
    };
}

export default async function RestaurantPublicPage({ params }: RestaurantPageProps) {
    const { slug } = await params;
    const supabase = getSupabaseServerClient<Database>();
    const { t } = await createI18nServerInstance();

    // Fetch restaurant data and capacity using server action
    const restaurantData = await getRestaurantBySlugAction(slug);

    if (!restaurantData) {
        return notFound();
    }

    const { account, restaurant, totalCapacity } = restaurantData;

    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    const reservations = userId
        ? await getUserReservationsAction({
            restaurantId: restaurant.id,
            userId,
        })
        : [];

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col font-sans selection:bg-brand-copper/30 overflow-x-hidden">
            <SiteHeader user={claimsData?.claims ? {
                ...claimsData.claims,
                id: claimsData.claims.sub as string
            } : null} />

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="relative">
                    <div className="container mx-auto px-4 py-6 md:py-12">
                        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3.5rem] bg-zinc-900 border border-white/10 shadow-3xl flex items-center py-12 md:py-0 md:aspect-[21/9] min-h-[320px] md:min-h-[500px] group/hero">
                            {/* Background Image with overlay */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="/images/restaurant-hero.png"
                                    alt={account.name}
                                    fill
                                    className="object-cover opacity-60 scale-105 group-hover/hero:scale-110 transition-transform duration-[10s] ease-out"
                                    priority
                                    fetchPriority="high"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1500px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/40 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                            </div>

                            <div className="relative z-10 w-full px-6 md:px-20 max-w-4xl">
                                <div className="space-y-5 md:space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
                                    <Pill label={t('public:landing.exclusiveExperience')} className="dark:bg-zinc-900/70 bg-zinc-400/70 text-brand-copper">
                                        <span className="flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-current text-brand-copper" />
                                            <span className="font-bold text-white">{t('public:landing.topRated')}</span>
                                        </span>
                                    </Pill>

                                    <h1 className="font-heading text-4xl sm:text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.95]">
                                        {account.name}
                                    </h1>

                                    <p className="text-base sm:text-xl md:text-2xl text-zinc-300 font-medium leading-relaxed max-w-2xl">
                                        {t('public:landing.heroSubtitle')}
                                    </p>

                                    <div className="flex flex-wrap gap-4 pt-2 md:pt-6">
                                        <CtaButton className="h-12 md:h-16 px-6 md:px-10 text-base md:text-xl rounded-2xl shadow-2xl bg-brand-copper text-white shadow-brand-copper/30 hover:scale-105 transition-transform active:scale-95">
                                            <a href="#booking" className="flex items-center font-bold">
                                                {t('public:landing.ctaBooking')}
                                                <ChevronRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
                                            </a>
                                        </CtaButton>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative blur circle */}
                            <div className="absolute -right-20 top-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(var(--brand-copper-rgb),0.15)_0%,transparent_70%)] pointer-events-none animate-pulse" />
                        </div>
                    </div>
                </section>

                {/* Info & Booking */}
                <section className="container mx-auto px-4 py-8 relative overflow-hidden md:overflow-visible">
                    {/* Background decoration */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full h-[1000px] bg-zinc-50 dark:bg-zinc-900/20 -z-10 rounded-[5rem] border border-zinc-100 dark:border-white/5" />

                    <div className="flex flex-col gap-24">
                        {/* Info Cards */}
                        <FeatureGrid className="grid-cols-1 md:grid-cols-3 gap-8 !mt-0">
                            <FeatureCard
                                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 shadow-2xl shadow-zinc-200/50 dark:shadow-none p-10 rounded-[2.5rem] hover:border-brand-copper/30 transition-all duration-500 group"
                                label={
                                    <span className="flex items-center gap-4">
                                        <span className="p-3 bg-brand-copper/10 rounded-[1.25rem] group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-brand-copper" />
                                        </span>
                                        <span className="font-heading text-2xl font-bold tracking-tight">{t('public:landing.locationTitle')}</span>
                                    </span>
                                }
                                description={
                                    <div className="space-y-2 mt-6">
                                        <p className="text-zinc-600 dark:text-zinc-200 text-lg font-medium leading-relaxed">
                                            {restaurant.location || t('public:landing.addressNotSet')}
                                        </p>
                                    </div>
                                }
                            />

                            <FeatureCard
                                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 shadow-2xl shadow-zinc-200/50 dark:shadow-none p-10 rounded-[2.5rem] hover:border-brand-copper/30 transition-all duration-500 group"
                                label={
                                    <span className="flex items-center gap-4">
                                        <span className="p-3 bg-brand-copper/10 rounded-[1.25rem] group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-brand-copper" />
                                        </span>
                                        <span className="font-heading text-2xl font-bold tracking-tight">{t('public:landing.contactTitle')}</span>
                                    </span>
                                }
                                description={
                                    <div className="space-y-2 mt-6">
                                        <p className="text-zinc-600 dark:text-zinc-200 text-lg font-medium leading-relaxed">
                                            {restaurant.phone || t('public:landing.phoneNotSet')}
                                        </p>
                                    </div>
                                }
                            />

                            <FeatureCard
                                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 shadow-2xl shadow-zinc-200/50 dark:shadow-none p-10 rounded-[2.5rem] hover:border-brand-copper/30 transition-all duration-500 group"
                                label={
                                    <span className="flex items-center gap-4">
                                        <span className="p-3 bg-brand-copper/10 rounded-[1.25rem] group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-brand-copper" />
                                        </span>
                                        <span className="font-heading text-2xl font-bold tracking-tight">{t('public:landing.capacityTitle')}</span>
                                    </span>
                                }
                                description={
                                    <div className="space-y-2 mt-6">
                                        <p className="text-zinc-600 dark:text-zinc-200 text-lg font-medium leading-relaxed">
                                            {t('public:landing.capacityText', { count: totalCapacity })}
                                        </p>
                                    </div>
                                }
                            />
                        </FeatureGrid>

                        {/* Reservations Section */}
                        {userId && reservations.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-[4rem] border border-zinc-200 dark:border-white/10 p-8 md:p-16 overflow-hidden relative shadow-inner">
                                    <div className="relative z-10">
                                        <UserReservations
                                            restaurantId={restaurant.id}
                                            userId={userId}
                                            initialReservations={reservations}
                                        />
                                    </div>
                                    <div className="absolute right-[-5%] top-[-5%] w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(var(--brand-copper-rgb),0.1)_0%,transparent_70%)] animate-pulse" />
                                    <div className="absolute left-[-5%] bottom-[-5%] w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(113,113,122,0.05)_0%,transparent_70%)]" />
                                </div>
                            </div>
                        )}

                        {/* Booking Section */}
                        <div id="booking" className="scroll-mt-32">
                            <div className="flex flex-col items-center space-y-8 text-center mb-16 animate-in fade-in duration-1000">
                                <div className="px-4 py-1 rounded-full bg-brand-copper/10 border border-brand-copper/20">
                                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-copper">{t('public:landing.reservation')}</span>
                                </div>
                                <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                                    {t('public:landing.readyToJoin')}
                                </h2>
                                <p className="max-w-2xl text-xl text-zinc-600 dark:text-zinc-200 font-medium leading-relaxed">
                                    {t('public:landing.readyDescription')}
                                </p>
                            </div>

                            <div className="relative group max-w-5xl mx-auto">
                                <div className="absolute -inset-8 bg-gradient-to-tr from-brand-copper/20 via-zinc-500/5 to-transparent blur-3xl opacity-50 transition-opacity group-hover:opacity-75 duration-1000" />
                                <div className="relative">
                                    <BookingContainer
                                        restaurantId={restaurant.id}
                                        user={claimsData?.claims ? {
                                            ...claimsData.claims,
                                            id: claimsData.claims.sub as string
                                        } : null}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <PublicFooter />

            {/* Global decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-20 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(var(--brand-copper-rgb),0.03)_0%,transparent_70%)]" />
                <div className="absolute bottom-[5%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(113,113,122,0.03)_0%,transparent_70%)]" />
            </div>
        </div>
    );
}
