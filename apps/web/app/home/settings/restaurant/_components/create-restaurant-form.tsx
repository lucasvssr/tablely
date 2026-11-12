'use client';

import { useTransition } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { cn } from '@kit/ui/utils';

import {
  createRestaurantAction,
} from '~/lib/server/restaurant/restaurant-actions';
import {
  geocodeAddressAction,
  reverseGeocodeAction,
} from '~/lib/server/restaurant/geocode-actions';
import {
  RestaurantSchema,
  type RestaurantSchemaInput,
  type RestaurantSchemaType,
} from '~/lib/server/restaurant/restaurant.schema';

import { LocationPickerMap } from '../../establishments/_components/location-picker-map-client';

export function CreateRestaurantForm() {
  const { t } = useTranslation('restaurant');
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountIdFromUrl = searchParams.get('account_id');

  const [isPending, startTransition] = useTransition();
  const [isGeocoding, startGeocodeTransition] =
    useTransition();

  const form = useForm<
    RestaurantSchemaInput,
    unknown,
    RestaurantSchemaType
  >({
    resolver: zodResolver(RestaurantSchema),
    defaultValues: {
      account_id: accountIdFromUrl || undefined,
      name: '',
      location: '',
      phone: '',
      lat: undefined,
      lng: undefined,
    },
  });

  /*
   * OptionalCoordinateSchema uses preprocessing, so the input
   * types of lat and lng are unknown.
   *
   * LocationPickerMap only accepts numbers, null or undefined.
   * We therefore normalize the watched values before passing
   * them to the component.
   */
  const watchedLat = form.watch('lat');
  const watchedLng = form.watch('lng');

  const latitude =
    typeof watchedLat === 'number' ? watchedLat : undefined;

  const longitude =
    typeof watchedLng === 'number' ? watchedLng : undefined;

  const onSubmit = (data: RestaurantSchemaType) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        await createRestaurantAction(formData);

        toast.success(t('create.form.success'));

        router.push('/home');
        router.refresh();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : t('settings.form.errorUnknown'),
        );
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

        form.setValue('lat', result.lat, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });

        form.setValue('lng', result.lng, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });

        /*
         * If the geocoding service returns a formatted address,
         * use it to correct and normalize the entered address.
         */
        if (result.display_name) {
          form.setValue('location', result.display_name, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }

        toast.success(
          t('settings.form.geocodeSuccess'),
        );
      } catch {
        toast.error(t('settings.form.geocodeError'));
      }
    });
  };

  const onLocationChange = async (
    lat: number,
    lng: number,
  ) => {
    form.setValue('lat', lat, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    form.setValue('lng', lng, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    /*
     * Reverse geocoding is optional. A failure must not prevent
     * the user from selecting a position on the map.
     */
    try {
      const result = await reverseGeocodeAction({
        lat,
        lng,
      });

      if (result.display_name) {
        form.setValue('location', result.display_name, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    } catch {
      // Ignore reverse-geocoding errors.
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('settings.form.nameLabel')}
              </FormLabel>

              <FormControl>
                <Input
                  {...field}
                  placeholder={t(
                    'settings.form.namePlaceholder',
                  )}
                />
              </FormControl>

              <FormDescription>
                {t('settings.form.nameDescription')}
              </FormDescription>

              <FormMessage>
                {form.formState.errors.name?.message
                  ? t(
                      String(
                        form.formState.errors.name.message,
                      ),
                    )
                  : null}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('settings.form.locationLabel')}
              </FormLabel>

              <div className="flex gap-2">
                <FormControl>
                  <Input
                    {...field}
                    className="flex-grow"
                    placeholder={t(
                      'settings.form.locationPlaceholder',
                    )}
                  />
                </FormControl>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onGeocode}
                  disabled={isGeocoding}
                  title={t('settings.form.geocode')}
                >
                  <MapPin
                    className={cn(
                      'h-4 w-4',
                      isGeocoding && 'animate-pulse',
                    )}
                  />

                  <span className="sr-only">
                    {t('settings.form.geocode')}
                  </span>
                </Button>
              </div>

              <FormMessage>
                {form.formState.errors.location?.message
                  ? t(
                      String(
                        form.formState.errors.location
                          .message,
                      ),
                    )
                  : null}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('settings.form.phoneLabel')}
              </FormLabel>

              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder={t(
                    'settings.form.phonePlaceholder',
                  )}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>
            {t('settings.form.pickerLabel')}
          </FormLabel>

          <FormDescription>
            {t('settings.form.pickerDescription')}
          </FormDescription>

          <LocationPickerMap
            lat={latitude}
            lng={longitude}
            onChange={onLocationChange}
            className="h-[300px] w-full"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isPending || isGeocoding}
            className="bg-brand-copper hover:bg-brand-copper/90 px-8"
          >
            {isPending
              ? t('create.form.submitting')
              : t('create.form.submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
}