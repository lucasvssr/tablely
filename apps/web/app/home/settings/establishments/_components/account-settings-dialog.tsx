'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@kit/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Button } from '@kit/ui/button';

import { AccountSchema, AccountSchemaType } from '~/lib/server/restaurant/restaurant.schema';
import { updateAccountAction } from '~/lib/server/restaurant/restaurant-actions';
import { useTranslation } from 'react-i18next';

interface AccountSettingsDialogProps {
    account: {
        id: string;
        name: string;
    };
    children?: React.ReactNode;
}

export function AccountSettingsDialog({ account, children }: AccountSettingsDialogProps) {
    const { t } = useTranslation('restaurant');
    const [isPending, startTransition] = useTransition();

    const form = useForm<AccountSchemaType>({
        resolver: zodResolver(AccountSchema),
        defaultValues: {
            id: account.id,
            name: account.name,
        },
    });

    const onSubmit = (data: AccountSchemaType) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('id', data.id);
                formData.append('name', data.name);

                await updateAccountAction(formData);
                toast.success(t('settings.account.success') || 'Établissement mis à jour');
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
            }
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('settings.account.title') || 'Modifier l\'établissement'}</DialogTitle>
                    <DialogDescription>
                        {t('settings.account.description') || 'Modifiez les informations de votre établissement.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('settings.form.nameLabel')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? t('common:submitting') : t('common:save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
