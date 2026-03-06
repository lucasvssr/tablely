'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Button } from '@kit/ui/button';
import { RestaurantSchema, RestaurantSchemaType } from '~/lib/server/restaurant/restaurant.schema';
import { updateRestaurantAction } from '~/lib/server/restaurant/restaurant-actions';

import { useTranslation } from 'react-i18next';

interface RestaurantSettingsFormProps {
    initialData: RestaurantSchemaType;
    readOnly?: boolean;
}

export function RestaurantSettingsForm({ initialData, readOnly }: RestaurantSettingsFormProps) {
    const { t } = useTranslation('restaurant');
    const [isPending, startTransition] = useTransition();

    const form = useForm<RestaurantSchemaType>({
        resolver: zodResolver(RestaurantSchema),
        defaultValues: initialData,
    });

    const onSubmit = (data: RestaurantSchemaType) => {
        if (readOnly) return;
        startTransition(async () => {
            try {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value.toString());
                    }
                });

                await updateRestaurantAction(formData);
                toast.success(t('settings.form.success'));
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : t('settings.form.errorUnknown'));
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('settings.form.nameLabel')}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t('settings.form.namePlaceholder')} disabled={readOnly} />
                            </FormControl>
                            <FormDescription>
                                {t('settings.form.nameDescription')}
                            </FormDescription>
                            {form.formState.errors.name && (
                                <p className="text-xs text-destructive">{t(form.formState.errors.name.message as string)}</p>
                            )}
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('settings.form.locationLabel')}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t('settings.form.locationPlaceholder')} disabled={readOnly} />
                            </FormControl>
                            {form.formState.errors.location && (
                                <p className="text-xs text-destructive">{t(form.formState.errors.location.message as string)}</p>
                            )}
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('settings.form.phoneLabel')}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t('settings.form.phonePlaceholder')} disabled={readOnly} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!readOnly && (
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isPending} className="px-8 bg-brand-copper hover:bg-brand-copper/90">
                            {isPending ? t('settings.form.submitting') : t('settings.form.submit')}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
