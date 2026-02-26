'use client';

import { useEffect, useState } from 'react';
import { getUserReservationsAction } from '~/lib/server/restaurant/restaurant-actions';
import { Card, CardContent } from '@kit/ui/card';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Calendar, Clock, Users, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@kit/ui/utils';

interface Reservation {
    id: string;
    date: string;
    start_time: string;
    guest_count: number;
    status: string;
}

export function UserReservations({
    restaurantId,
    userId,
    initialReservations
}: {
    restaurantId: string;
    userId: string;
    initialReservations?: Reservation[];
}) {
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations || []);
    const [loading, setLoading] = useState(!initialReservations);
    const { t, i18n } = useTranslation('public');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (initialReservations) return;

        async function fetchReservations() {
            setLoading(true);
            try {
                const data = await getUserReservationsAction({ restaurantId, userId });
                setReservations(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchReservations();
    }, [restaurantId, userId, initialReservations]);

    if (!isMounted || loading || reservations.length === 0) return null;

    const dateLocale = i18n.language === 'fr' ? fr : enUS;

    return (
        <div className="mt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col items-center mb-12">
                <div className="px-4 py-1 rounded-full bg-brand-copper/10 border border-brand-copper/20 mb-4">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-copper">
                        {t('public:booking.yourReservations')}
                    </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-zinc-900 dark:text-white text-center">
                    {t('public:booking.upcomingTitle')}
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {reservations.map((res) => (
                    <Card
                        key={res.id}
                        className="group relative overflow-hidden border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 backdrop-blur-xl shadow-2xl hover:shadow-brand-copper/10 hover:border-brand-copper/30 transition-all duration-500 rounded-[2.5rem]"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                            <Star className="w-32 h-32 fill-current text-brand-copper" />
                        </div>

                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 bg-brand-copper/10 rounded-[1.25rem] text-brand-copper group-hover:scale-110 transition-transform duration-500">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border",
                                    res.status === 'confirmed'
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : "bg-brand-copper/10 text-brand-copper border-brand-copper/20"
                                )}>
                                    {res.status}
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white capitalize tracking-tight group-hover:text-brand-copper transition-colors">
                                    {format(new Date(res.date), 'EEEE d MMMM', { locale: dateLocale })}
                                </p>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400 font-bold">
                                        <Clock className="h-5 w-5 text-brand-copper" />
                                        <span>{res.start_time.substring(0, 5)}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400 font-bold">
                                        <Users className="h-5 w-5 text-brand-copper" />
                                        <span>{t('public:booking.guestsCount', { count: res.guest_count })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{t('public:booking.viewDetails')}</span>
                                <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-copper group-hover:text-white transition-all duration-500">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
