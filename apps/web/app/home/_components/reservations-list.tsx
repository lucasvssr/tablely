'use client';

import { useState, useEffect, useTransition } from 'react';
import { format, addDays, subDays, isAfter, subMinutes, addMinutes, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@kit/ui/tooltip";
import {
    Users,
    Clock,
    Calendar as CalendarIcon,
    ArrowLeft,
    ArrowRight,
    RefreshCw,
    CheckCircle2,
    XCircle,
    HelpCircle,
    UserCheck,
    MoreHorizontal,
    AlertTriangle,
    Info
} from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@kit/ui/dropdown-menu';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { getDailyReservationsAction, updateReservationStatusAction } from '~/lib/server/restaurant/restaurant-actions';
import { toast } from 'sonner';
import { cn } from '@kit/ui/utils';
import { EditReservationDialog } from './edit-reservation-dialog';

export interface Reservation {
    id: string;
    client_name: string;
    client_email: string;
    guest_count: number;
    start_time: string;
    date: string;
    status: string;
    notes: string | null;
    account_id: string;
    restaurant_id: string;
}

export function ReservationsList({
    initialReservations,
    accountId
}: {
    initialReservations: Reservation[];
    accountId: string;
}) {
    const { t, i18n } = useTranslation('dashboard');
    const dateLocale = i18n.language.startsWith('fr') ? fr : enUS;
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [now, setNow] = useState(new Date());
    const [isPending, startTransition] = useTransition();
    const supabase = useSupabase();

    const formattedDate = format(currentDate, 'yyyy-MM-dd');

    // Keep "now" updated every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('reservations-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'reservations',
                    filter: `account_id=eq.${accountId}`,
                },
                () => {
                    // If the change is on the current date, we should refresh
                    // For simplicity, we trigger a refresh of the list
                    refreshReservations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId, formattedDate]);

    const refreshReservations = (dateToFetch = formattedDate) => {
        startTransition(async () => {
            try {
                const data = await getDailyReservationsAction({ date: dateToFetch });
                setReservations(data as Reservation[]);
            } catch (error) {
                console.error('Error refreshing reservations:', error);
                toast.error(t('reservations.toasts.refreshError'));
            }
        });
    };

    const handlePrevDay = () => {
        const prevDay = subDays(currentDate, 1);
        setCurrentDate(prevDay);
        refreshReservations(format(prevDay, 'yyyy-MM-dd'));
    };

    const handleNextDay = () => {
        const nextDay = addDays(currentDate, 1);
        setCurrentDate(nextDay);
        refreshReservations(format(nextDay, 'yyyy-MM-dd'));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        refreshReservations(format(today, 'yyyy-MM-dd'));
    };

    const handleStatusChange = (reservationId: string, status: 'confirmed' | 'cancelled' | 'arrived' | 'no-show') => {
        startTransition(async () => {
            try {
                await updateReservationStatusAction({ reservationId, status });
                toast.success(t('reservations.toasts.statusUpdated'));
                refreshReservations();
            } catch (error) {
                console.error('Error updating status:', error);
                toast.error(t('reservations.toasts.updateError'));
            }
        });
    };

    const hasAllergy = (notes: string | null) => {
        if (!notes) return false;
        if (notes.includes('[Allergies:')) return true;
        const normalized = notes.toLowerCase();
        const keywords = ['allergy', 'allergie', 'allergique', 'intolérance', 'gluten', 'arachide', 'coque', 'lactose', 'oeuf', 'fruit à coque', 'crustacé', 'poisson', 'soja', 'céleri', 'moutarde', 'sésame', 'sulfite', 'lupin', 'mollusque'];
        return keywords.some(keyword => normalized.includes(keyword));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> {t('reservations.status.confirmed')}</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0.5"><XCircle className="w-3 h-3 mr-1" /> {t('reservations.status.cancelled')}</Badge>;
            case 'arrived':
                return <Badge variant="secondary" className="bg-brand-copper/10 text-brand-copper hover:bg-brand-copper/20 border-none px-2 py-0.5"><UserCheck className="w-3 h-3 mr-1" /> {t('reservations.status.arrived')}</Badge>;
            case 'no-show':
                return <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-none px-2 py-0.5"><HelpCircle className="w-3 h-3 mr-1" /> {t('reservations.status.noshow')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-white/5 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2 font-heading">
                            <CalendarIcon className="w-6 h-6 text-brand-copper" />
                            {t('reservations.title')}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {format(currentDate, 'EEEE d MMMM yyyy', { locale: dateLocale })}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-zinc-100 dark:bg-black p-1 rounded-xl">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-none transition-all"
                                onClick={handlePrevDay}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-none font-bold transition-all"
                                onClick={handleToday}
                            >
                                {t('reservations.today')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-none transition-all"
                                onClick={handleNextDay}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn("h-11 w-11 rounded-xl border-zinc-200 dark:border-white/10 transition-all", isPending && "animate-spin")}
                            onClick={() => refreshReservations()}
                            disabled={isPending}
                        >
                            <RefreshCw className="w-4 h-4 text-zinc-600" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {reservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-950 rounded-full flex items-center justify-center mb-2">
                            <CalendarIcon className="w-10 h-10 text-zinc-300" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-zinc-900 dark:text-white">{t('reservations.noReservations')}</p>
                            <p className="text-zinc-500">{t('reservations.noReservationsDesc')}</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 dark:bg-black/20 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-white/5">
                                    <th className="px-6 py-4">{t('reservations.table.time')}</th>
                                    <th className="px-6 py-4">{t('reservations.table.client')}</th>
                                    <th className="px-6 py-4">{t('reservations.table.guests')}</th>
                                    <th className="px-6 py-4">{t('reservations.table.status')}</th>
                                    <th className="px-6 py-4 text-right">{t('reservations.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                {reservations.map((res) => (
                                    <tr key={res.id} className="group hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                                                <Clock className="w-4 h-4 text-brand-copper" />
                                                {res.start_time.substring(0, 5)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-zinc-900 dark:text-white">{res.client_name}</div>
                                                {hasAllergy(res.notes) && (
                                                    <TooltipProvider>
                                                        <Tooltip delayDuration={0}>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse cursor-help">
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-red-600 text-white border-none p-3 max-w-xs rounded-xl shadow-xl">
                                                                <p className="font-bold mb-1 flex items-center gap-2 text-xs uppercase tracking-wider">
                                                                    <AlertTriangle className="w-3 h-3" />
                                                                    {t('reservations.notes.allergyAlert')}
                                                                </p>
                                                                <p className="text-sm font-medium leading-relaxed">
                                                                    {res.notes}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {!hasAllergy(res.notes) && res.notes && (
                                                    <TooltipProvider>
                                                        <Tooltip delayDuration={300}>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-help">
                                                                    <Info className="w-3.5 h-3.5" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10 p-3 max-w-xs rounded-xl shadow-xl">
                                                                <p className="font-bold mb-1 text-xs uppercase tracking-wider text-zinc-500">
                                                                    {t('reservations.notes.clientNote')}
                                                                </p>
                                                                <p className="text-sm font-medium">
                                                                    {res.notes}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                            <div className="text-xs text-zinc-500 font-medium">{res.client_email}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <Users className="w-4 h-4 text-zinc-400" />
                                                {res.guest_count}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(res.status)}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg outline-none">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-zinc-200 dark:border-white/10">
                                                    <DropdownMenuLabel>{t('reservations.table.actions')}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                     {res.status !== 'cancelled' && (
                                                        <EditReservationDialog reservation={res} />
                                                     )}

                                                    <DropdownMenuSeparator />

                                                    <TooltipProvider>
                                                        {(() => {
                                                            const reservationTime = parseISO(`${res.date}T${res.start_time}`);
                                                            const canMarkArrived = isAfter(now, subMinutes(reservationTime, 30));
                                                            const canMarkNoShow = isAfter(now, addMinutes(reservationTime, 15));

                                                            return (
                                                                <>
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div>
                                                                                <DropdownMenuItem
                                                                                    className="gap-2 font-medium"
                                                                                    onClick={() => handleStatusChange(res.id, 'arrived')}
                                                                                    disabled={res.status === 'arrived' || !canMarkArrived}
                                                                                >
                                                                                    <UserCheck className={cn("w-4 h-4", canMarkArrived ? "text-brand-copper" : "text-zinc-300")} />
                                                                                    {t('reservations.actions.markArrived')}
                                                                                </DropdownMenuItem>
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        {!canMarkArrived && (
                                                                            <TooltipContent side="left">
                                                                                <p>{t('reservations.actions.arrivedRestriction')}</p>
                                                                            </TooltipContent>
                                                                        )}
                                                                    </Tooltip>

                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div>
                                                                                <DropdownMenuItem
                                                                                    className="gap-2 font-medium"
                                                                                    onClick={() => handleStatusChange(res.id, 'no-show')}
                                                                                    disabled={res.status === 'no-show' || !canMarkNoShow}
                                                                                >
                                                                                    <HelpCircle className={cn("w-4 h-4", canMarkNoShow ? "text-zinc-500" : "text-zinc-300")} />
                                                                                    {t('reservations.actions.markNoShow')}
                                                                                </DropdownMenuItem>
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        {!canMarkNoShow && (
                                                                            <TooltipContent side="left">
                                                                                <p>{t('reservations.actions.noshowRestriction')}</p>
                                                                            </TooltipContent>
                                                                        )}
                                                                    </Tooltip>
                                                                </>
                                                            );
                                                        })()}
                                                    </TooltipProvider>

                                                    <DropdownMenuItem
                                                        className="gap-2 font-medium"
                                                        onClick={() => handleStatusChange(res.id, 'confirmed')}
                                                        disabled={res.status === 'confirmed'}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        {t('reservations.actions.confirmReset')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        onClick={() => handleStatusChange(res.id, 'cancelled')}
                                                        disabled={res.status === 'cancelled'}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        {t('reservations.actions.cancel')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
