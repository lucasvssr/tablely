'use client';

import { useState } from 'react';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Clock, Users, ChevronRight, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@kit/ui/tabs';
import Link from 'next/link';
import { EditReservationDialog } from './edit-reservation-dialog';

import pathsConfig from '~/config/paths.config';

interface ClientReservation {
    id: string;
    date: string;
    start_time: string;
    guest_count: number;
    status: string;
    restaurant_name: string;
    restaurant_location: string;
    restaurant_slug: string;
    restaurant_id: string;
    notes: string | null;
    client_name: string;
}

export function ClientReservationsList({ reservations }: { reservations: ClientReservation[] }) {
    const { t, i18n } = useTranslation('dashboard');
    const dateLocale = i18n.language.startsWith('fr') ? fr : enUS;
    const [activeTab, setActiveTab] = useState('upcoming');

    const now = new Date();
    const today = startOfDay(now);

    const upcomingReservations = reservations.filter(res => {
        const resDate = parseISO(res.date);
        return isAfter(resDate, today) || res.date === format(today, 'yyyy-MM-dd');
    }).sort((a, b) => a.date.localeCompare(b.date));

    const pastReservations = reservations.filter(res => {
        const resDate = parseISO(res.date);
        return isBefore(resDate, today) && res.date !== format(today, 'yyyy-MM-dd');
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5 text-[10px]">{t('reservations.status.confirmed')}</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[10px]">{t('reservations.status.cancelled')}</Badge>;
            case 'arrived':
                return <Badge variant="secondary" className="bg-brand-copper/10 text-brand-copper hover:bg-brand-copper/20 border-none px-2 py-0.5 text-[10px]">{t('reservations.status.arrived')}</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] px-2 py-0.5">{status}</Badge>;
        }
    };

    const ReservationItem = ({ res }: { res: ClientReservation }) => {
        const bookingPath = `${pathsConfig.app.booking}/${res.restaurant_slug}`;

        return (
            <div
                key={res.id}
                className="group/reservation flex items-center justify-between p-4 px-6 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-t border-zinc-100 dark:border-white/5 first:border-t-0"
            >
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                            {res.restaurant_name}
                        </h4>
                        {getStatusBadge(res.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5 shrink-0">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {format(parseISO(res.date), 'd MMMM yyyy', { locale: dateLocale })}
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            {res.start_time.substring(0, 5)}
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                            <Users className="w-3.5 h-3.5" />
                            {res.guest_count}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {res.status !== 'cancelled' && (
                        <EditReservationDialog reservation={{
                            id: res.id,
                            restaurant_id: res.restaurant_id,
                            date: res.date,
                            client_name: res.client_name || '',
                            guest_count: res.guest_count,
                            start_time: res.start_time,
                            status: res.status,
                            notes: res.notes
                        }} />
                    )}
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0 hover:bg-brand-copper/10 hover:text-brand-copper">
                        <Link href={bookingPath}>
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Card className="border-none shadow-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden w-full">
            <CardHeader className="pb-0 pt-4 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-brand-copper" />
                    {t('reservations.title')}
                </CardTitle>

                <Tabs value={activeTab} className="w-auto" onValueChange={setActiveTab}>
                    <TabsList className="bg-zinc-100 dark:bg-zinc-800 h-8 p-1">
                        <TabsTrigger value="upcoming" className="text-xs h-6 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 shadow-sm transition-all font-semibold">
                            {t('reservations.upcoming')}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="text-xs h-6 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 shadow-sm transition-all font-semibold">
                            {t('reservations.history')}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="p-0 mt-4">
                {activeTab === 'upcoming' ? (
                    upcomingReservations.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <CalendarIcon className="w-8 h-8 text-zinc-200" />
                            <p className="text-sm">{t('reservations.noUpcoming')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {upcomingReservations.map((res) => (
                                <ReservationItem key={res.id} res={res} />
                            ))}
                        </div>
                    )
                ) : (
                    pastReservations.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <History className="w-8 h-8 text-zinc-200" />
                            <p className="text-sm">{t('reservations.noPast')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {pastReservations.map((res) => (
                                <ReservationItem key={res.id} res={res} />
                            ))}
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}
