'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { Calendar } from '@kit/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, Users, Clock, Check, ChevronRight, ArrowLeft, Star } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { getAvailableSlotsAction, createReservationAction } from '~/lib/server/restaurant/restaurant-actions';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import type { ReservationSchemaType } from '~/lib/server/restaurant/restaurant.schema';
import type { JwtPayload } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

interface Slot {
    service_id: string;
    service_name: string;
    slot_time: string;
    available: boolean;
}

type Step = 'selection' | 'details' | 'success';

export function BookingContainer({
    restaurantId,
    user
}: {
    restaurantId: string;
    user: (JwtPayload & { id: string }) | null;
}) {
    const [step, setStep] = useState<Step>('selection');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [guests, setGuests] = useState(2);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [slotsCache, setSlotsCache] = useState<Record<string, Slot[]>>({});
    const [loading, setLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const lastRequestedKeyRef = useRef<string>('');

    const { t, i18n } = useTranslation('public');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (user) {
            if (!name) setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
            if (!email) setEmail(user.email || '');
            if (!phone) setPhone(user.phone || user.user_metadata?.phone || '');
        }
    }, [user, name, email, phone]);

    const handleConfirm = useCallback(async (manualPayload?: unknown) => {

        // If it's a click event or non-payload object, manualPayload will be something else
        const isManual = !!(manualPayload && typeof manualPayload === 'object' && 'restaurant_id' in manualPayload);

        const payload: ReservationSchemaType = isManual ? (manualPayload as ReservationSchemaType) : {
            restaurant_id: restaurantId,
            date: date ? format(date, 'yyyy-MM-dd') : '',
            start_time: selectedSlot?.slot_time || '',
            service_id: selectedSlot?.service_id || '',
            guest_count: guests,
            client_name: name,
            client_email: email,
            client_phone: phone || '',
            notes: notes,
            user_id: user?.id,
        };

        if (!payload.date || !payload.start_time || !payload.service_id) {
            return;
        }

        if (!user && !isManual) {
            const bookingData = {
                ...payload,
                date: payload.date,
            };
            localStorage.setItem('pending_booking', JSON.stringify(bookingData));

            // Per user request: redirect to home instead of back here
            const currentUrl = '/home?confirm_booking=true';
            router.push(`/auth/sign-up?next=${encodeURIComponent(currentUrl)}&email=${encodeURIComponent(email)}`);
            return;
        }

        setSubmitting(true);
        try {
            await createReservationAction(payload);
            setStep('success');
            toast.success(t('public:booking.successTitle'));
        } catch (error: unknown) {
            console.error('createReservationAction error:', error);
            toast.error(error instanceof Error ? error.message : t('public:booking.errorGeneric'));
        } finally {
            setSubmitting(false);
        }
    }, [restaurantId, date, selectedSlot, guests, name, email, phone, notes, user, router, t]);



    const selectedSlotRef = useRef(selectedSlot);
    selectedSlotRef.current = selectedSlot;

    const slotsRef = useRef(slots);
    slotsRef.current = slots;

    const tRef = useRef(t);
    tRef.current = t;


    // Handle return from auth to complete booking
    const processedRedirectionRef = useRef(false);
    useEffect(() => {
        const confirmBooking = searchParams.get('confirm_booking');

        if (confirmBooking === 'true' && user && !processedRedirectionRef.current) {
            const pending = localStorage.getItem('pending_booking');
            if (pending) {
                try {
                    const data = JSON.parse(pending);

                    processedRedirectionRef.current = true;

                    // Populate state for UI consistency
                    if (data.date) setDate(new Date(data.date));
                    if (data.guest_count) setGuests(Number(data.guest_count));
                    if (data.client_name) setName(data.client_name || '');
                    if (data.client_email) setEmail(data.client_email || '');
                    if (data.client_phone) setPhone(data.client_phone || '');
                    if (data.notes) setNotes(data.notes || '');

                    if (data.start_time && data.service_id) {
                        setSelectedSlot({
                            slot_time: data.start_time,
                            service_id: data.service_id,
                            service_name: '',
                            available: true
                        });
                    }

                    // Clean up: Remove param from URL and clear storage
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('confirm_booking');
                    const queryString = params.toString();
                    const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');
                    router.replace(newUrl, { scroll: false });

                    localStorage.removeItem('pending_booking');

                    // Trigger confirmation
                    const payload = {
                        restaurant_id: restaurantId,
                        date: data.date,
                        start_time: data.start_time,
                        service_id: data.service_id,
                        guest_count: Number(data.guest_count),
                        client_name: data.client_name,
                        client_email: data.client_email,
                        client_phone: data.client_phone || '',
                        notes: data.notes || '',
                        user_id: user.id,
                    };

                    setTimeout(() => {
                        handleConfirm(payload);
                    }, 800);
                } catch (e) {
                    console.error('Error restoring pending booking', e);
                }
            }
        }
    }, [user, searchParams, restaurantId, router, handleConfirm]);

    const fetchSlots = useCallback(async (isBackground = false) => {
        const currentDate = date;
        const currentGuests = guests;

        if (!currentDate) return;

        // We use a fixed locale for the cache key to ensure consistency
        const currentCacheKey = `${format(currentDate, 'yyyy-MM-dd')}-${currentGuests}-${user?.id || ''}-${email || ''}`;

        // Don't refetch if already in progress for this key unless it's a background update from external
        if (!isBackground && loading && lastRequestedKeyRef.current === currentCacheKey) return;

        if (!isBackground) {
            if (slotsRef.current.length > 0) {
                setIsRefetching(true);
            } else {
                setLoading(true);
            }
        }

        try {
            const formattedDate = format(currentDate, 'yyyy-MM-dd');
            const data = await getAvailableSlotsAction({
                restaurantId,
                date: formattedDate,
                guestCount: currentGuests,
                userId: user?.id ?? null,
                clientEmail: email || null
            });

            // Update cache and current slots
            setSlotsCache(prev => ({ ...prev, [currentCacheKey]: data }));
            setSlots(data);

            const currentSelected = selectedSlotRef.current;
            if (currentSelected) {
                const stillAvailable = data.find(s => s.slot_time === currentSelected.slot_time && s.available);
                if (!stillAvailable) setSelectedSlot(null);
            }
        } catch (error) {
            console.error(error);
            if (!isBackground) toast.error(tRef.current('common:genericError'));
        } finally {
            setLoading(false);
            setIsRefetching(false);
        }
    }, [date, guests, restaurantId, loading, user, email]);

    useEffect(() => {
        if (date && guests && step === 'selection') {
            const cacheKey = `${format(date, 'yyyy-MM-dd')}-${guests}-${user?.id || ''}-${email || ''}`;
            const cachedData = slotsCache[cacheKey];

            // If we have cached data, only background refresh if we haven't requested this key yet in this view session
            if (cachedData) {
                setSlots(cachedData);
                if (lastRequestedKeyRef.current !== cacheKey) {
                    lastRequestedKeyRef.current = cacheKey;
                    fetchSlots(true);
                }
            } else if (lastRequestedKeyRef.current !== cacheKey) {
                lastRequestedKeyRef.current = cacheKey;
                fetchSlots(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, guests, step, fetchSlots, slotsCache]);

    const services = slots.reduce((acc, slot) => {
        const serviceId = slot.service_id;
        if (!acc[serviceId]) {
            acc[serviceId] = {
                name: slot.service_name,
                slots: []
            };
        }
        acc[serviceId]?.slots.push(slot);
        return acc;
    }, {} as Record<string, { name: string; slots: Slot[] }>);

    if (!isMounted) return null;

    const dateLocale = i18n.language === 'fr' ? fr : enUS;

    if (step === 'success') {
        return (
            <Card className="max-w-2xl mx-auto shadow-3xl border-none bg-white dark:bg-zinc-900 overflow-hidden animate-in zoom-in-95 duration-500 rounded-[2.5rem]">
                <div className="h-2 w-full bg-brand-copper" />
                <CardHeader className="text-center pt-12">
                    <div className="w-20 h-20 bg-brand-copper/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-brand-copper shadow-inner">
                        <Check className="h-10 w-10" />
                    </div>
                    <CardTitle className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">
                        {t('public:booking.successTitle')}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {t('public:booking.successSubtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 text-center">
                    <div className="bg-zinc-50 dark:bg-zinc-950/50 p-8 rounded-[2rem] mb-8 border border-zinc-200 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Star className="w-24 h-24 fill-current text-brand-copper" />
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 relative z-10 mb-4 font-medium">
                            {t('public:booking.successText', { email })}
                        </p>
                        <div className="mt-4 flex flex-col items-center gap-4 relative z-10">
                            <p className="text-zinc-900 dark:text-white font-bold text-xl capitalize">
                                {format(date!, 'EEEE d MMMM', { locale: dateLocale })}
                            </p>
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2 font-bold text-brand-copper bg-brand-copper/10 px-4 py-2 rounded-xl">
                                    <Clock className="h-5 w-5" /> {selectedSlot?.slot_time.substring(0, 5)}
                                </span>
                                <span className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200/50 dark:bg-zinc-800/50 px-4 py-2 rounded-xl">
                                    <Users className="h-5 w-5" /> {guests} couverts
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="rounded-2xl h-14 px-8 font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 transition-all"
                        onClick={() => window.location.reload()}
                    >
                        {t('public:booking.ctaHome')}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-4xl mx-auto shadow-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden">
            {step === 'selection' ? (
                <>
                    <CardHeader className="text-center pb-2 pt-12">
                        <CardTitle className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">
                            {t('public:booking.title')}
                        </CardTitle>
                        <CardDescription className="text-lg text-zinc-600 dark:text-zinc-400">{t('public:booking.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-8 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    {t('public:booking.dateLabel')}
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-bold h-16 rounded-2xl border-zinc-200 dark:border-white/10 hover:border-brand-copper dark:hover:border-brand-copper transition-all text-base",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5 text-brand-copper" />
                                            {date ? format(date, 'PPP', { locale: dateLocale }) : <span>{t('public:booking.chooseDate')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-3xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            locale={dateLocale}
                                            className="p-4"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                    <Users className="w-3.5 h-3.5" />
                                    {t('public:booking.guestsLabel')}
                                </label>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                        <Button
                                            key={num}
                                            variant={guests === num ? "default" : "outline"}
                                            className={cn(
                                                "min-w-12 h-16 flex-1 rounded-2xl font-bold transition-all text-lg",
                                                guests === num
                                                    ? "bg-brand-copper text-white hover:bg-brand-copper/90 shadow-xl shadow-brand-copper/20 scale-105 border-transparent"
                                                    : "border-zinc-200 dark:border-white/10 hover:border-brand-copper text-zinc-700 dark:text-zinc-300"
                                            )}
                                            onClick={() => setGuests(num)}
                                        >
                                            {num}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10 relative">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-brand-copper/10 rounded-full" />
                                        <div className="absolute top-0 w-20 h-20 border-4 border-brand-copper border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <p className="text-zinc-600 dark:text-zinc-400 font-bold animate-pulse text-lg tracking-widest uppercase">{t('public:booking.loading')}</p>
                                </div>
                            ) : (
                                <div className={cn("transition-opacity duration-500", isRefetching ? "opacity-40 pointer-events-none" : "opacity-100")}>
                                    {Object.entries(services).map(([id, service]) => (
                                        <div key={id} className="space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-white/5 pb-4">
                                                <div className="p-2 bg-brand-copper/10 rounded-xl">
                                                    <Clock className="h-5 w-5 text-brand-copper" />
                                                </div>
                                                <h3 className="font-heading font-bold text-2xl text-zinc-900 dark:text-white">
                                                    {service.name}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                                {service.slots.map((slot) => (
                                                    <Button
                                                        key={slot.slot_time}
                                                        variant={selectedSlot?.slot_time === slot.slot_time ? "default" : "outline"}
                                                        disabled={!slot.available}
                                                        className={cn(
                                                            "h-16 rounded-2xl text-base font-bold transition-all relative overflow-hidden",
                                                            slot.available
                                                                ? "border-zinc-200 dark:border-white/10 hover:border-brand-copper hover:bg-brand-copper/5 dark:hover:bg-brand-copper/10 shadow-sm text-zinc-700 dark:text-zinc-200"
                                                                : "opacity-20 bg-zinc-100 dark:bg-zinc-800/50 grayscale cursor-not-allowed",
                                                            selectedSlot?.slot_time === slot.slot_time && "bg-brand-copper text-white hover:bg-brand-copper/90 ring-4 ring-brand-copper/20 shadow-2xl scale-105 border-transparent"
                                                        )}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        {slot.slot_time.substring(0, 5)}
                                                        {selectedSlot?.slot_time === slot.slot_time && (
                                                            <div className="absolute top-1 right-1">
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isRefetching && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-zinc-950/20 backdrop-blur-[2px] z-10 rounded-3xl">
                                    <div className="bg-white dark:bg-zinc-800 px-6 py-3 rounded-2xl shadow-3xl border border-zinc-200 dark:border-white/10 flex items-center gap-4">
                                        <div className="w-5 h-5 border-2 border-brand-copper border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tracking-wider uppercase">{t('public:booking.loading')}</span>
                                    </div>
                                </div>
                            )}

                            {!loading && Object.keys(services).length === 0 && (
                                <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-950/50 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-white/5 mx-4">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CalendarIcon className="h-8 w-8 text-zinc-300" />
                                    </div>
                                    <p className="text-zinc-900 dark:text-white text-xl font-bold">{t('public:booking.noSlots')}</p>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-base mt-2">{t('public:booking.tryAnother')}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 md:mt-16 bg-zinc-100 dark:bg-black p-5 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 border border-white/10 shadow-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Star className="w-32 h-32 fill-current text-brand-copper" />
                            </div>
                            <div className="text-center md:text-left relative z-10">
                                <p className="text-[10px] font-bold text-brand-copper-foreground uppercase tracking-[0.3em] mb-2">{t('public:booking.summary')}</p>
                                <p className="text-zinc-900 dark:text-white font-bold text-lg sm:text-2xl md:text-3xl tracking-tight text-center md:text-left">
                                    {selectedSlot
                                        ? t('public:booking.summaryText', {
                                            guests,
                                            date: date ? format(date, 'd MMMM', { locale: dateLocale }) : '',
                                            time: selectedSlot.slot_time.substring(0, 5)
                                        })
                                        : date
                                            ? t('public:booking.summaryTextNoTime', {
                                                guests,
                                                date: format(date, 'd MMMM', { locale: dateLocale })
                                            })
                                            : ''
                                    }
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="w-full md:w-auto h-12 md:h-16 px-8 md:px-12 text-base md:text-xl font-bold rounded-2xl bg-brand-copper hover:bg-brand-copper/90 shadow-2xl shadow-brand-copper/30 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 text-white active:bg-brand-copper/80 border-none relative z-10"
                                disabled={!selectedSlot || loading}
                                onClick={() => setStep('details')}
                            >
                                {t('public:booking.ctaContinue')}
                                <ChevronRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                            </Button>
                        </div>
                    </CardContent>
                </>
            ) : (
                <>
                    <CardHeader className="text-center pb-2 pt-12 animate-in fade-in duration-500">
                        <CardTitle className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">
                            {t('public:booking.formTitle')}
                        </CardTitle>
                        <CardDescription className="text-lg text-zinc-600 dark:text-zinc-400">{t('public:booking.formSubtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest px-1">
                                    {t('public:booking.nameLabel')}
                                </label>
                                <Input
                                    className="h-16 rounded-2xl border-zinc-200 dark:border-white/10 focus-visible:ring-brand-copper text-base font-medium px-6"
                                    placeholder={t('public:booking.namePlaceholder')}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest px-1">
                                    {t('public:booking.emailLabel')}
                                </label>
                                <Input
                                    type="email"
                                    className="h-16 rounded-2xl border-zinc-200 dark:border-white/10 focus-visible:ring-brand-copper text-base font-medium px-6"
                                    placeholder={t('public:booking.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest px-1">
                                    {t('public:booking.phoneLabel')}
                                </label>
                                <Input
                                    className="h-16 rounded-2xl border-zinc-200 dark:border-white/10 focus-visible:ring-brand-copper text-base font-medium px-6"
                                    placeholder={t('public:booking.phonePlaceholder')}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest px-1">
                                    {t('public:booking.notesLabel')}
                                </label>
                                <Textarea
                                    className="rounded-[2rem] border-zinc-200 dark:border-white/10 focus-visible:ring-brand-copper text-base font-medium px-6 py-4 min-h-[120px]"
                                    placeholder={t('public:booking.notesPlaceholder')}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 flex-1 rounded-2xl font-bold border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-300"
                                onClick={() => setStep('selection')}
                                disabled={submitting}
                            >
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                {t('public:booking.ctaBack')}
                            </Button>
                            <Button
                                size="lg"
                                className="h-16 flex-[2] rounded-2xl font-bold bg-brand-copper hover:bg-brand-copper/90 shadow-2xl shadow-brand-copper/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-white border-none"
                                onClick={handleConfirm}
                                disabled={submitting || !name || !email}
                            >
                                {submitting ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {t('public:booking.ctaConfirm')}
                                        <Check className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
