'use client';

import { useEffect, useMemo, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import { upsertServiceAction } from '~/lib/server/restaurant/restaurant-actions';
import {
  ServiceSchema,
  type ServiceSchemaType,
} from '~/lib/server/restaurant/restaurant.schema';

function formatTimeToHHMM(time?: string) {
  if (!time) {
    return '';
  }

  return time.split(':').slice(0, 2).join(':');
}

function getDefaultValues(
  initialData?: ServiceSchemaType,
): ServiceSchemaType {
  if (initialData) {
    return {
      ...initialData,
      start_time: formatTimeToHHMM(
        initialData.start_time,
      ),
      end_time: formatTimeToHHMM(initialData.end_time),
    };
  }

  return {
    name: '',
    start_time: '12:00',
    end_time: '14:30',
    duration_minutes: 90,
    buffer_minutes: 15,
    days_of_week: [1, 2, 3, 4, 5, 6, 7],
  };
}

interface ServiceFormProps {
  initialData?: ServiceSchemaType;
  onSuccess?: () => void;
}

export function ServiceForm({
  initialData,
  onSuccess,
}: ServiceFormProps) {
  const { t } = useTranslation('restaurant');
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const days = useMemo(
    () => [
      {
        label: t('services.days.1'),
        value: 1,
      },
      {
        label: t('services.days.2'),
        value: 2,
      },
      {
        label: t('services.days.3'),
        value: 3,
      },
      {
        label: t('services.days.4'),
        value: 4,
      },
      {
        label: t('services.days.5'),
        value: 5,
      },
      {
        label: t('services.days.6'),
        value: 6,
      },
      {
        label: t('services.days.7'),
        value: 7,
      },
    ],
    [t],
  );

  const form = useForm<ServiceSchemaType>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const selectedDays = form.watch('days_of_week');

  useEffect(() => {
    form.reset(getDefaultValues(initialData));
  }, [initialData, form]);

  const onSubmit = (data: ServiceSchemaType) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        if (data.id) {
          formData.append('id', data.id);
        }

        if (data.restaurant_id) {
          formData.append(
            'restaurant_id',
            data.restaurant_id,
          );
        }

        formData.append('name', data.name);
        formData.append('start_time', data.start_time);
        formData.append('end_time', data.end_time);

        formData.append(
          'days_of_week',
          JSON.stringify(data.days_of_week),
        );

        formData.append(
          'duration_minutes',
          String(data.duration_minutes),
        );

        formData.append(
          'buffer_minutes',
          String(data.buffer_minutes ?? 15),
        );

        await upsertServiceAction(formData);

        toast.success(
          data.id
            ? t('services.form.successUpdate')
            : t('services.form.successCreate'),
        );

        form.reset(getDefaultValues());

        router.refresh();
        onSuccess?.();
      } catch (error: unknown) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : t('services.form.error'),
        );
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name">
          {t('services.form.nameLabel')}
        </Label>

        <Input
          id="name"
          placeholder={t(
            'services.form.namePlaceholder',
          )}
          {...form.register('name')}
        />

        {form.formState.errors.name?.message && (
          <p className="text-xs text-destructive">
            {t(form.formState.errors.name.message)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">
            {t('services.form.startTimeLabel')}
          </Label>

          <Input
            id="start_time"
            type="time"
            {...form.register('start_time')}
          />

          {form.formState.errors.start_time?.message && (
            <p className="text-xs text-destructive">
              {t(
                form.formState.errors.start_time.message,
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">
            {t('services.form.endTimeLabel')}
          </Label>

          <Input
            id="end_time"
            type="time"
            {...form.register('end_time')}
          />

          {form.formState.errors.end_time?.message && (
            <p className="text-xs text-destructive">
              {t(form.formState.errors.end_time.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_minutes">
            {t('services.form.durationLabel')}
          </Label>

          <Input
            id="duration_minutes"
            type="number"
            min={15}
            step={15}
            {...form.register('duration_minutes', {
              valueAsNumber: true,
            })}
          />

          {form.formState.errors.duration_minutes
            ?.message && (
            <p className="text-xs text-destructive">
              {t(
                form.formState.errors.duration_minutes
                  .message,
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="buffer_minutes">
            {t('services.form.bufferLabel')}
          </Label>

          <Input
            id="buffer_minutes"
            type="number"
            min={0}
            step={5}
            {...form.register('buffer_minutes', {
              setValueAs: (value) => {
                if (
                  value === '' ||
                  value === null ||
                  value === undefined
                ) {
                  return undefined;
                }

                return Number(value);
              },
            })}
          />

          {form.formState.errors.buffer_minutes
            ?.message && (
            <p className="text-xs text-destructive">
              {t(
                form.formState.errors.buffer_minutes
                  .message,
              )}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label>{t('services.form.daysLabel')}</Label>

        <div className="flex flex-wrap gap-3">
          {days.map((day) => {
            const isSelected =
              selectedDays?.includes(day.value) ?? false;

            return (
              <div
                key={day.value}
                className="flex items-center gap-2"
              >
                <Checkbox
                  id={`day-${day.value}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const currentDays =
                      form.getValues('days_of_week') ?? [];

                    const nextDays =
                      checked === true
                        ? Array.from(
                            new Set([
                              ...currentDays,
                              day.value,
                            ]),
                          ).sort(
                            (first, second) =>
                              first - second,
                          )
                        : currentDays.filter(
                            (value) =>
                              value !== day.value,
                          );

                    form.setValue(
                      'days_of_week',
                      nextDays,
                      {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      },
                    );
                  }}
                />

                <Label
                  htmlFor={`day-${day.value}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {day.label}
                </Label>
              </div>
            );
          })}
        </div>

        {form.formState.errors.days_of_week
          ?.message && (
          <p className="text-xs text-destructive">
            {t(
              form.formState.errors.days_of_week.message,
            )}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending
          ? t('services.form.submitting')
          : initialData?.id
            ? t('services.form.submitUpdate')
            : t('services.form.submitCreate')}
      </Button>
    </form>
  );
}