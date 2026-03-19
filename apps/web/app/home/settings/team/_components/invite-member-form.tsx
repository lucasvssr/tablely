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
import { useMemo } from 'react';



interface InviteMemberFormProps {
    restaurants: Array<{ id: string; name: string }>;
    activeMembership?: {
        restaurant_id: string | null;
    } | null;
}

export function InviteMemberForm({ restaurants, activeMembership }: InviteMemberFormProps) {
    const { t } = useTranslation('teams');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // If active membership is restaurant-specific, lock to that restaurant
    const isRestaurantLocked = !!activeMembership?.restaurant_id;

    const inviteSchema = useMemo(() => z.object({
        email: z.string().email(t('errors.invalidEmail')),
        role: z.enum(['admin', 'member']),
        restaurant_id: z.string().uuid().optional().nullable(),
    }), [t]);

    type InviteSchemaType = z.infer<typeof inviteSchema>;

    const form = useForm<InviteSchemaType>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: '',
            role: 'member',
            restaurant_id: activeMembership?.restaurant_id || null,
        },
    });

    const onSubmit = (data: InviteSchemaType) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('email', data.email);
                formData.append('role', data.role);
                if (data.restaurant_id) {
                    formData.append('restaurant_id', data.restaurant_id);
                }

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

            <div className="space-y-2">
                <Label htmlFor="restaurant">{t('restaurantLabel')}</Label>
                <Select
                    defaultValue={activeMembership?.restaurant_id || 'all'}
                    onValueChange={(value) => form.setValue('restaurant_id', value === 'all' ? null : value)}
                    disabled={isRestaurantLocked}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('restaurantPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allRestaurantsLabel')}</SelectItem>
                        {restaurants.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">
                    {isRestaurantLocked 
                        ? "Vous ne pouvez inviter des membres que dans votre restaurant actuel."
                        : t('restaurantSelectionHint')}
                </p>
            </div>

            <Button type="submit" className="w-full bg-brand-copper hover:bg-brand-copper/90" disabled={isPending}>
                {isPending ? t('invitingMembers') : t('inviteMembersButton')}
            </Button>
        </form>
    );
}
