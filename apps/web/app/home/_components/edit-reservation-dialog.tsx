'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Loader2, Users, Clock, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

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
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

import { UpdateReservationSchema, UpdateReservationSchemaType } from '~/lib/server/restaurant/restaurant.schema';
import { updateReservationDetailsAction } from '~/lib/server/restaurant/restaurant-actions';

interface EditReservationDialogProps {
    reservation: {
        id: string;
        client_name: string;
        guest_count: number;
        start_time: string;
        notes: string | null;
    };
}

export function EditReservationDialog({ reservation }: EditReservationDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const form = useForm<UpdateReservationSchemaType>({
        resolver: zodResolver(UpdateReservationSchema),
        defaultValues: {
            id: reservation.id,
            guest_count: reservation.guest_count,
            start_time: reservation.start_time.substring(0, 5),
            notes: reservation.notes || '',
        },
    });

    async function onSubmit(values: UpdateReservationSchemaType) {
        setIsPending(true);
        try {
            const result = await updateReservationDetailsAction(values);
            if (result.success) {
                toast.success('Réservation mise à jour');
                setIsOpen(false);
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
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
                    Modifier
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-brand-copper/10 text-brand-copper">
                            <Edit2 className="w-5 h-5" />
                        </div>
                        Modifier la réservation
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-sm leading-relaxed">
                        Ajustez le nombre de couverts, l&apos;heure ou les notes pour <span className="font-bold text-zinc-900 dark:text-zinc-200">{reservation.client_name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="guest_count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5" />
                                            Couverts
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 rounded-xl focus:ring-brand-copper focus:border-brand-copper font-medium"
                                            />
                                        </FormControl>
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
                                            Heure
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 rounded-xl focus:ring-brand-copper focus:border-brand-copper font-medium"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                        <AlignLeft className="w-3.5 h-3.5" />
                                        Notes du restaurateur
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            rows={4}
                                            placeholder="Allergies, table préférée, etc."
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 rounded-xl focus:ring-brand-copper focus:border-brand-copper font-medium resize-none p-4"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl h-11 border-zinc-200 dark:border-white/10 font-bold transition-all hover:bg-zinc-50 dark:hover:bg-white/5"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-brand-copper hover:bg-brand-copper/90 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-brand-copper/20 transition-all hover:-translate-y-0.5"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Mise à jour...
                                    </>
                                ) : (
                                    'Enregistrer'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
