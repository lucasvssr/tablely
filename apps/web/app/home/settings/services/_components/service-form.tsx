'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceSchema, ServiceSchemaType } from '~/lib/server/restaurant/restaurant.schema';
import { upsertServiceAction } from '~/lib/server/restaurant/restaurant-actions';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Checkbox } from '@kit/ui/checkbox';
import { useTransition, useEffect } from 'react';
import { toast } from 'sonner';

const DAYS = [
    { label: 'Lun', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Mer', value: 3 },
    { label: 'Jeu', value: 4 },
    { label: 'Ven', value: 5 },
    { label: 'Sam', value: 6 },
    { label: 'Dim', value: 7 },
];

const formatTimeToHHMM = (time?: string) => {
    if (!time) return '';
    return time.split(':').slice(0, 2).join(':');
};

export function ServiceForm({
    initialData,
    onSuccess
}: {
    initialData?: ServiceSchemaType & { id?: string },
    onSuccess?: () => void
}) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<ServiceSchemaType & { id?: string }>({
        resolver: zodResolver(ServiceSchema),
        defaultValues: initialData ? {
            ...initialData,
            start_time: formatTimeToHHMM(initialData.start_time),
            end_time: formatTimeToHHMM(initialData.end_time),
        } : {
            name: '',
            start_time: '12:00',
            end_time: '14:30',
            days_of_week: [1, 2, 3, 4, 5, 6, 7],
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                start_time: formatTimeToHHMM(initialData.start_time),
                end_time: formatTimeToHHMM(initialData.end_time),
            });
        } else {
            form.reset({
                name: '',
                start_time: '12:00',
                end_time: '14:30',
                days_of_week: [1, 2, 3, 4, 5, 6, 7],
            });
        }
    }, [initialData, form]);

    const onSubmit = (data: ServiceSchemaType & { id?: string }) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                if (data.id) formData.append('id', data.id);
                formData.append('name', data.name);
                formData.append('start_time', data.start_time);
                formData.append('end_time', data.end_time);
                formData.append('days_of_week', JSON.stringify(data.days_of_week));

                await upsertServiceAction(formData);

                toast.success(data.id ? 'Service mis à jour !' : 'Service enregistré !');
                form.reset();
                if (onSuccess) onSuccess();
            } catch (error) {
                toast.error('Erreur lors de l\'enregistrement');
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Nom du service</Label>
                <Input
                    id="name"
                    placeholder="ex: Midi, Soir, Brunch"
                    {...form.register('name')}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_time">Début</Label>
                    <Input
                        id="start_time"
                        type="time"
                        {...form.register('start_time')}
                    />
                    {form.formState.errors.start_time && (
                        <p className="text-xs text-destructive">{form.formState.errors.start_time.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end_time">Fin</Label>
                    <Input
                        id="end_time"
                        type="time"
                        {...form.register('end_time')}
                    />
                    {form.formState.errors.end_time && (
                        <p className="text-xs text-destructive">{form.formState.errors.end_time.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <Label>Jours d'ouverture</Label>
                <div className="flex flex-wrap gap-3">
                    {DAYS.map((day) => (
                        <div key={day.value} className="flex items-center gap-2">
                            <Checkbox
                                id={`day-${day.value}`}
                                checked={form.watch('days_of_week')?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                    const current = form.getValues('days_of_week') || [];
                                    if (checked) {
                                        form.setValue('days_of_week', [...current, day.value]);
                                    } else {
                                        form.setValue('days_of_week', current.filter(v => v !== day.value));
                                    }
                                }}
                            />
                            <Label htmlFor={`day-${day.value}`} className="text-sm font-normal cursor-pointer">
                                {day.label}
                            </Label>
                        </div>
                    ))}
                </div>
                {form.formState.errors.days_of_week && (
                    <p className="text-xs text-destructive">{form.formState.errors.days_of_week.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Enregistrement...' : initialData?.id ? 'Enregistrer les modifications' : 'Ajouter le service'}
            </Button>
        </form>
    );
}
