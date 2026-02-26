'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { inviteMemberAction } from '~/lib/server/restaurant/team-actions';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

const InviteSchema = z.object({
    email: z.string().email('Email invalide'),
    role: z.enum(['admin', 'member']),
});

type InviteSchemaType = z.infer<typeof InviteSchema>;

export function InviteMemberForm() {
    const { t } = useTranslation('teams');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<InviteSchemaType>({
        resolver: zodResolver(InviteSchema),
        defaultValues: {
            email: '',
            role: 'member',
        },
    });

    const onSubmit = (data: InviteSchemaType) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('email', data.email);
                formData.append('role', data.role);

                await inviteMemberAction(formData);

                toast.success(t('inviteMembersSuccessMessage'));
                form.reset();
                router.refresh();
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : t('inviteMembersErrorMessage'));
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                    id="email"
                    placeholder={t('emailPlaceholder')}
                    {...form.register('email')}
                />
                {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">{t('roleLabel')}</Label>
                <Select
                    defaultValue="member"
                    onValueChange={(value) => form.setValue('role', value as 'admin' | 'member')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('roleLabel')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="member">{t('common:roles.member.label')}</SelectItem>
                        <SelectItem value="admin">{t('common:roles.admin.label')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending ? t('invitingMembers') : t('inviteMembersButton')}
            </Button>
        </form>
    );
}
