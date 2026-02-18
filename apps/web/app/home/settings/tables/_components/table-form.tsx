'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TableSchema, TableSchemaType } from '~/lib/server/restaurant/restaurant.schema';
import { upsertTableAction } from '~/lib/server/restaurant/restaurant-actions';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { useTransition, useEffect } from 'react';
import { toast } from 'sonner';

export function TableForm({
    initialData,
    onSuccess
}: {
    initialData?: TableSchemaType & { id?: string },
    onSuccess?: () => void
}) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<TableSchemaType & { id?: string }>({
        resolver: zodResolver(TableSchema),
        defaultValues: initialData || {
            name: '',
            capacity: 2,
            is_active: true,
        },
    });

    // Update form when initialData changes (for editing)
    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        } else {
            form.reset({
                name: '',
                capacity: 2,
                is_active: true,
            });
        }
    }, [initialData, form]);

    const onSubmit = (data: TableSchemaType & { id?: string }) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                if (data.id) formData.append('id', data.id);
                formData.append('name', data.name);
                formData.append('capacity', data.capacity.toString());
                formData.append('is_active', data.is_active ? 'true' : 'false');

                await upsertTableAction(formData);

                toast.success(data.id ? 'Table mise à jour !' : 'Table ajoutée !');
                form.reset();
                if (onSuccess) onSuccess();
            } catch (error) {
                toast.error('Erreur lors de l\'enregistrement');
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom ou Numéro</Label>
                <Input
                    id="name"
                    placeholder="ex: Table 4, Carré A1"
                    {...form.register('name')}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="capacity">Capacité (personnes)</Label>
                <Input
                    id="capacity"
                    type="number"
                    {...form.register('capacity')}
                />
                {form.formState.errors.capacity && (
                    <p className="text-xs text-destructive">{form.formState.errors.capacity.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Enregistrement...' : initialData?.id ? 'Enregistrer les modifications' : 'Ajouter la table'}
            </Button>
        </form>
    );
}
