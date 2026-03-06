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
import { useRouter } from 'next/navigation';

import { useTranslation } from 'react-i18next';

const formatTimeToHHMM = (time?: string) => {
    if (!time) return '';
    return time.split(':').slice(0, 2).join(':');
};

export function ServiceForm({
    initialData,
    onSuccess
}: {
    initialData?: ServiceSchemaType,
    onSuccess?: () => void
}) {
    const { t } = useTranslation('restaurant');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const DAYS = [
        { label: t('services.days.1'), value: 1 },
        { label: t('services.days.2'), value: 2 },
        { label: t('services.days.3'), value: 3 },
        { label: t('services.days.4'), value: 4 },
        { label: t('services.days.5'), value: 5 },
        { label: t('services.days.6'), value: 6 },
        { label: t('services.days.7'), value: 7 },
    ];

    const form = useForm<ServiceSchemaType>({
        resolver: zodResolver(ServiceSchema),
        defaultValues: initialData ? {
            ...initialData,
            start_time: formatTimeToHHMM(initialData.start_time),
            end_time: formatTimeToHHMM(initialData.end_time),
        } : {
            name: '',
            start_time: '12:00',
            end_time: '14:30',
            duration_minutes: 90,
            buffer_minutes: 15,
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
                duration_minutes: 90,
                buffer_minutes: 15,
                days_of_week: [1, 2, 3, 4, 5, 6, 7],
            });
        }
    }, [initialData, form]);

    const onSubmit = (data: ServiceSchemaType) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                if (data.id) formData.append('id', data.id);
                formData.append('name', data.name);
                formData.append('start_time', data.start_time);
                formData.append('end_time', data.end_time);
                formData.append('days_of_week', JSON.stringify(data.days_of_week));
                formData.append('duration_minutes', data.duration_minutes.toString());
                formData.append('buffer_minutes', (data.buffer_minutes ?? 15).toString());

                await upsertServiceAction(formData);

                toast.success(data.id ? t('services.form.successUpdate') : t('services.form.successCreate'));
                form.reset();
                router.refresh();
                if (onSuccess) onSuccess();
            } catch {
                toast.error(t('services.form.error'));
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">{t('services.form.nameLabel')}</Label>
                <Input
                    id="name"
                    placeholder={t('services.form.namePlaceholder')}
                    {...form.register('name')}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{t(form.formState.errors.name.message as string)}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_time">{t('services.form.startTimeLabel')}</Label>
                    <Input
                        id="start_time"
                        type="time"
                        {...form.register('start_time')}
                    />
                    {form.formState.errors.start_time && (
                        <p className="text-xs text-destructive">{t(form.formState.errors.start_time.message as string)}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end_time">{t('services.form.endTimeLabel')}</Label>
                    <Input
                        id="end_time"
                        type="time"
                        {...form.register('end_time')}
                    />
                    {form.formState.errors.end_time && (
                        <p className="text-xs text-destructive">{t(form.formState.errors.end_time.message as string)}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duration_minutes">{t('services.form.durationLabel')}</Label>
                    <Input
                        id="duration_minutes"
                        type="number"
                        min="15"
                        step="15"
                        {...form.register('duration_minutes')}
                    />
                    {form.formState.errors.duration_minutes && (
                        <p className="text-xs text-destructive">{t(form.formState.errors.duration_minutes.message as string)}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="buffer_minutes">{t('services.form.bufferLabel')}</Label>
                    <Input
                        id="buffer_minutes"
                        type="number"
                        min="0"
                        step="5"
                        {...form.register('buffer_minutes')}
                    />
                    {form.formState.errors.buffer_minutes && (
                        <p className="text-xs text-destructive">{t(form.formState.errors.buffer_minutes.message as string)}</p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <Label>{t('services.form.daysLabel')}</Label>
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
                    <p className="text-xs text-destructive">{t(form.formState.errors.days_of_week.message as string)}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? t('services.form.submitting') : initialData?.id ? t('services.form.submitUpdate') : t('services.form.submitCreate')}
            </Button>
        </form>
    );
}
