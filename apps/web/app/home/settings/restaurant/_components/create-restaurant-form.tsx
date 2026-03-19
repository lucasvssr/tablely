'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { cn } from '@kit/ui/utils';
import { Input } from '@kit/ui/input';
import { Button } from '@kit/ui/button';
import { RestaurantSchema, RestaurantSchemaType } from '~/lib/server/restaurant/restaurant.schema';
import { createRestaurantAction } from '~/lib/server/restaurant/restaurant-actions';
import { geocodeAddressAction, reverseGeocodeAction } from '~/lib/server/restaurant/geocode-actions';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocationPickerMap } from '../../establishments/_components/location-picker-map-client';

export function CreateRestaurantForm() {
    const { t } = useTranslation('restaurant');
    const router = useRouter();
    const searchParams = useSearchParams();
    const accountIdFromUrl = searchParams.get('account_id');
    const [isPending, startTransition] = useTransition();
    const [isGeocoding, startGeocodeTransition] = useTransition();

    const form = useForm<RestaurantSchemaType>({
        resolver: zodResolver(RestaurantSchema),
        defaultValues: {
            account_id: accountIdFromUrl || undefined,
            name: '',
            location: '',
            phone: '',
            lat: undefined, // Initialize lat as undefined
            lng: undefined, // Initialize lng as undefined
        },
    });

    const onSubmit = (data: RestaurantSchemaType) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value.toString());
                    }
                });

                await createRestaurantAction(formData);
                toast.success(t('create.form.success'));

                router.push('/home');
                router.refresh();
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : t('settings.form.errorUnknown'));
            }
        });
    };

    const onGeocode = () => {
        const address = form.getValues('location');
        if (!address || address.length < 5) {
            toast.error(t('validation.locationMin5'));
            return;
        }

        startGeocodeTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('address', address);
                const result = await geocodeAddressAction(formData);

                form.setValue('lat', result.lat);
                form.setValue('lng', result.lng);

                // Si une adresse formatée est retournée, on corrige le champ pour éviter les fautes
                if (result.display_name) {
                    form.setValue('location', result.display_name);
                }

                toast.success(t('settings.form.geocodeSuccess'));
            } catch {
                toast.error(t('settings.form.geocodeError'));
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
                                <Input {...field} placeholder={t('settings.form.namePlaceholder')} />
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
                            <div className="flex gap-2">
                                <FormControl>
                                    <Input {...field} placeholder={t('settings.form.locationPlaceholder')} className="flex-grow" />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={onGeocode}
                                    disabled={isGeocoding}
                                    title={t('settings.form.geocode')}
                                >
                                    <MapPin className={cn("h-4 w-4", isGeocoding && "animate-pulse")} />
                                </Button>
                            </div>
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
                                <Input {...field} placeholder={t('settings.form.phonePlaceholder')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <div className="space-y-2">
                    <FormLabel>{t('settings.form.pickerLabel')}</FormLabel>
                    <FormDescription>{t('settings.form.pickerDescription')}</FormDescription>
                    <LocationPickerMap
                        lat={form.watch('lat')}
                        lng={form.watch('lng')}
                        onChange={async (lat, lng) => {
                            form.setValue('lat', lat);
                            form.setValue('lng', lng);

                            // Autocorrection de l'adresse par clic sur la carte
                            try {
                                const result = await reverseGeocodeAction({ lat, lng });
                                if (result.display_name) {
                                    form.setValue('location', result.display_name);
                                }
                            } catch {
                                // On ignore silencieusement les erreurs de reverse geocoding au clic
                            }
                        }}
                        className="h-[300px] w-full"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isPending} className="px-8 bg-brand-copper hover:bg-brand-copper/90">
                        {isPending ? t('create.form.submitting') : t('create.form.submit')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
