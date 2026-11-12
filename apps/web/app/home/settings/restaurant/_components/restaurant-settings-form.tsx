'use client';

import { useTransition } from 'react';

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
  geocodeAddressAction,
  reverseGeocodeAction,
} from '~/lib/server/restaurant/geocode-actions';
import { updateRestaurantAction } from '~/lib/server/restaurant/restaurant-actions';
import {
  RestaurantSchema,
  type RestaurantSchemaInput,
  type RestaurantSchemaType,
} from '~/lib/server/restaurant/restaurant.schema';

import { LocationPickerMap } from '../../establishments/_components/location-picker-map-client';

interface RestaurantSettingsFormProps {
  initialData: RestaurantSchemaType;
  readOnly?: boolean;
}

export function RestaurantSettingsForm({
  initialData,
  readOnly = false,
}: RestaurantSettingsFormProps) {
  const { t } = useTranslation('restaurant');

  const [isPending, startTransition] = useTransition();
  const [isGeocoding, startGeocodeTransition] =
    useTransition();

  const form = useForm<
    RestaurantSchemaInput,
    unknown,
    RestaurantSchemaType
  >({
    resolver: zodResolver(RestaurantSchema),
    defaultValues: initialData,
  });

  /*
   * Le prétraitement Zod donne à lat et lng un type d'entrée
   * unknown. On les normalise avant de les transmettre à la carte.
   */
  const watchedLat = form.watch('lat');
  const watchedLng = form.watch('lng');

  const latitude =
    typeof watchedLat === 'number' ? watchedLat : undefined;

  const longitude =
    typeof watchedLng === 'number' ? watchedLng : undefined;

  const onSubmit = (data: RestaurantSchemaType) => {
    if (readOnly) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        await updateRestaurantAction(formData);

        toast.success(t('settings.form.success'));
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
    if (readOnly) {
      return;
    }

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

        if (result.display_name) {
          form.setValue('location', result.display_name, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }

        toast.success(t('settings.form.geocodeSuccess'));
      } catch {
        toast.error(t('settings.form.geocodeError'));
      }
    });
  };

  const onLocationChange = async (
    lat: number,
    lng: number,
  ) => {
    if (readOnly) {
      return;
    }

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
      // Le géocodage inversé ne doit pas bloquer
      // la sélection d'une position sur la carte.
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
                  disabled={readOnly}
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
                    disabled={readOnly}
                    className="flex-grow"
                    placeholder={t(
                      'settings.form.locationPlaceholder',
                    )}
                  />
                </FormControl>

                {!readOnly && (
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
                )}
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
                  disabled={readOnly}
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

          {!readOnly && (
            <FormDescription>
              {t('settings.form.pickerDescription')}
            </FormDescription>
          )}

          <LocationPickerMap
            lat={latitude}
            lng={longitude}
            onChange={onLocationChange}
            className={cn(
              'h-[300px] w-full',
              readOnly && 'pointer-events-none opacity-80',
            )}
          />
        </div>

        {!readOnly && (
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isPending || isGeocoding}
              className="bg-brand-copper hover:bg-brand-copper/90 px-8"
            >
              {isPending
                ? t('settings.form.submitting')
                : t('settings.form.submit')}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}