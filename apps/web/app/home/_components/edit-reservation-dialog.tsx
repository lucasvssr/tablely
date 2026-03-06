'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Loader2, Users, Clock, AlignLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@kit/ui/utils';
import { useTranslation } from 'react-i18next';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@kit/ui/dialog';
import { Button } from '@kit/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@kit/ui/form';
import { Textarea } from '@kit/ui/textarea';

import { UpdateReservationSchema, UpdateReservationSchemaType } from '~/lib/server/restaurant/restaurant.schema';
import { updateReservationDetailsAction, getAvailableSlotsAction, updateReservationStatusAction } from '~/lib/server/restaurant/restaurant-actions';

interface EditReservationDialogProps {
    reservation: {
        id: string;
        restaurant_id?: string;
        date?: string;
        client_name: string;
        guest_count: number;
        start_time: string;
        status: string;
        notes: string | null;
    };
}

const parseAllergiesAndNotes = (combinedText: string | null) => {
    if (!combinedText) return { allergies: [] as string[], pureNotes: '' };

    // Pattern: [Allergies: Gluten, Lactose] Rest of the notes
    const match = combinedText.match(/^\[Allergies: (.*?)\]\s*(.*)$/s);
    if (match) {
        const allergies = match[1] ? match[1].split(', ').filter(Boolean) : [];
        const pureNotes = match[2] || '';
        return { allergies, pureNotes };
    }

    return { allergies: [] as string[], pureNotes: combinedText };
};

export function EditReservationDialog({ reservation }: EditReservationDialogProps) {
    const { t } = useTranslation(['dashboard', 'public']);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [slots, setSlots] = useState<{
        available: boolean;
        service_id: string;
        service_name: string;
        slot_time: string;
    }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const router = useRouter();

    const ALLERGY_OPTIONS = [
        { id: 'allergyGluten', label: t('public:booking.allergyGluten') },
        { id: 'allergyLactose', label: t('public:booking.allergyLactose') },
        { id: 'allergyPeanuts', label: t('public:booking.allergyPeanuts') },
        { id: 'allergyShellfish', label: t('public:booking.allergyShellfish') },
        { id: 'allergyEggs', label: t('public:booking.allergyEggs') },
        { id: 'allergyFish', label: t('public:booking.allergyFish') },
        { id: 'allergySoy', label: t('public:booking.allergySoy') },
        { id: 'allergyNuts', label: t('public:booking.allergyNuts') },
    ];

    const { allergies: initialAllergies, pureNotes: initialNotes } = parseAllergiesAndNotes(reservation.notes);

    const form = useForm<UpdateReservationSchemaType>({
        resolver: zodResolver(UpdateReservationSchema),
        defaultValues: {
            id: reservation.id,
            guest_count: reservation.guest_count,
            start_time: reservation.start_time.substring(0, 5),
            notes: initialNotes,
            allergies: initialAllergies,
        },
    });

    const currentGuestCount = form.watch('guest_count');

    const fetchSlots = useCallback(async (guestCount: number) => {
        if (!reservation.restaurant_id || !reservation.date) return;
        setLoadingSlots(true);
        try {
            const data = await getAvailableSlotsAction({
                restaurantId: reservation.restaurant_id,
                date: reservation.date,
                guestCount,
                userId: null,
                clientEmail: null
            });
            setSlots(data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    }, [reservation.restaurant_id, reservation.date]);

    useEffect(() => {
        if (isOpen && reservation.restaurant_id) {
            fetchSlots(currentGuestCount);
        }
    }, [isOpen, reservation.restaurant_id, currentGuestCount, fetchSlots]);

    async function onSubmit(values: UpdateReservationSchemaType) {
        setIsPending(true);
        try {
            await updateReservationDetailsAction(values);
            toast.success(t('dashboard:editReservation.successUpdate'));
            setIsOpen(false);
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : t('dashboard:editReservation.error'));
        } finally {
            setIsPending(false);
        }
    }

    async function handleCancelReservation() {
        if (!window.confirm(t('dashboard:editReservation.cancelConfirm'))) return;
        
        setIsPending(true);
        try {
            await updateReservationStatusAction({ 
                reservationId: reservation.id, 
                status: 'cancelled' 
            });
            toast.success(t('dashboard:editReservation.successCancel'));
            setIsOpen(false);
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : t('dashboard:editReservation.error'));
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-brand-copper hover:bg-brand-copper/5 rounded-lg px-2"
                >
                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                    {t('dashboard:reservations.actions.edit')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-brand-copper/10 text-brand-copper">
                            <Edit2 className="w-5 h-5" />
                        </div>
                        {t('dashboard:editReservation.title')}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-sm leading-relaxed">
                        {t('dashboard:editReservation.description', { name: reservation.client_name })}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="guest_count"
                            render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" />
                                        {t('dashboard:editReservation.guests')}
                                    </FormLabel>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <Button
                                                key={num}
                                                type="button"
                                                variant={field.value === num ? "default" : "outline"}
                                                size="lg"
                                                className={cn(
                                                    "h-10 w-10 min-w-10 rounded-lg font-bold transition-all p-0 text-xs",
                                                    field.value === num
                                                        ? "bg-brand-copper text-white shadow-md shadow-brand-copper/10"
                                                        : "border-zinc-200 dark:border-white/5"
                                                )}
                                                onClick={() => field.onChange(num)}
                                            >
                                                {num}
                                            </Button>
                                        ))}
                                    </div>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="start_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        {t('dashboard:editReservation.time')}
                                    </FormLabel>
                                    <div className="relative">
                                        {loadingSlots ? (
                                            <div className="flex items-center justify-center h-20 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-white/5">
                                                <Loader2 className="w-5 h-5 animate-spin text-brand-copper" />
                                            </div>
                                        ) : slots.length > 0 ? (
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                                                {slots.map((slot) => {
                                                    const time = slot.slot_time.substring(0, 5);
                                                    const isSelected = field.value === time;
                                                    const isLockedInit = reservation.start_time.substring(0, 5) === time;

                                                    return (
                                                        <Button
                                                            key={slot.slot_time}
                                                            type="button"
                                                            variant={isSelected ? "default" : "outline"}
                                                            disabled={!slot.available && !isLockedInit}
                                                            onClick={() => field.onChange(time)}
                                                            className={cn(
                                                                "h-10 rounded-lg text-xs font-bold transition-all relative px-0",
                                                                isSelected
                                                                    ? "bg-brand-copper text-white shadow-md shadow-brand-copper/10"
                                                                    : "border-zinc-200 dark:border-white/5"
                                                            )}
                                                        >
                                                            {time}
                                                            {isSelected && <Check className="w-3 h-3 absolute top-0.5 right-0.5" />}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-xs text-zinc-500 italic bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-white/5">
                                                {t('dashboard:editReservation.noSlots')}
                                            </div>
                                        )}
                                    </div>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="allergies"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t('dashboard:editReservation.allergies')}</FormLabel>
                                    <div className="flex flex-wrap gap-2">
                                        {ALLERGY_OPTIONS.map((allergy) => {
                                            const isSelected = field.value?.includes(allergy.label);
                                            return (
                                                <Button
                                                    key={allergy.id}
                                                    type="button"
                                                    variant={isSelected ? "default" : "outline"}
                                                    size="sm"
                                                    className={cn(
                                                        "rounded-lg h-9 text-[10px] font-bold transition-all px-3",
                                                        isSelected
                                                            ? "bg-brand-copper text-white border-transparent"
                                                            : "border-zinc-200 dark:border-white/5 text-zinc-500"
                                                    )}
                                                    onClick={() => {
                                                        const current = field.value || [];
                                                        if (isSelected) {
                                                            field.onChange(current.filter((a: string) => a !== allergy.label));
                                                        } else {
                                                            field.onChange([...current, allergy.label]);
                                                        }
                                                    }}
                                                >
                                                    {allergy.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                        <AlignLeft className="w-3.5 h-3.5" />
                                        {t('dashboard:editReservation.notesLabel')}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            rows={4}
                                            placeholder={t('dashboard:editReservation.notesPlaceholder')}
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 rounded-xl focus:ring-brand-copper focus:border-brand-copper font-medium resize-none p-4"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        {reservation.status !== 'cancelled' && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancelReservation}
                                disabled={isPending}
                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold h-12 rounded-xl border border-dashed border-red-200 dark:border-red-900/30 mt-2"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard:editReservation.cancelMyBooking')}
                            </Button>
                        )}

                        <DialogFooter className="gap-3 sm:gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl h-14 flex-1 border-zinc-200 dark:border-white/10 font-bold transition-all hover:bg-zinc-50 dark:hover:bg-white/5"
                            >
                                {t('dashboard:editReservation.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-brand-copper hover:bg-brand-copper/90 text-white rounded-xl h-14 flex-[2] font-bold shadow-lg shadow-brand-copper/20 transition-all hover:-translate-y-0.5"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('dashboard:editReservation.saving')}
                                    </>
                                ) : (
                                    t('dashboard:editReservation.save')
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
