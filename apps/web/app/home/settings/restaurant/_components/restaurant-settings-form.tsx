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

interface RestaurantSettingsFormProps {
    initialData: RestaurantSchemaType;
    readOnly?: boolean;
}

export function RestaurantSettingsForm({ initialData, readOnly }: RestaurantSettingsFormProps) {
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
                toast.success('Paramètres du restaurant mis à jour');
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
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
                            <FormLabel>Nom du restaurant</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Le Petit Bistro" disabled={readOnly} />
                            </FormControl>
                            <FormDescription>
                                Le nom affiché sur votre page publique et vos reçus.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Localisation / Adresse</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="123 Rue de la Paix, Paris" disabled={readOnly} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Numéro de téléphone</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="01 23 45 67 89" disabled={readOnly} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!readOnly && (
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isPending} className="px-8 bg-blue-600 hover:bg-blue-700">
                            {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
