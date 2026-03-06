'use client';

import { useTransition } from 'react';
import { removeMemberAction } from '~/lib/server/restaurant/team-actions';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@kit/ui/alert-dialog';

interface Profile {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
}

interface Member {
    id: string;
    role: string;
    user_id: string;
    account_id: string;
    profiles: Profile | null;
}

export function MembersList({
    initialMembers,
    isAdmin
}: {
    initialMembers: Member[];
    isAdmin: boolean;
}) {
    const { t } = useTranslation('teams');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const members = initialMembers as unknown as Member[];

    const handleRemove = (userId: string, accountId: string) => {
        startTransition(async () => {
            try {
                await removeMemberAction({ userId, accountId });
                toast.success(t('removeMemberSuccessMessage'));
                router.refresh();
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : t('errors.unknownError'));
            }
        });
    };

    return (
        <div className="divide-y border rounded-lg">
            {members.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    {t('noData')}
                </div>
            ) : (
                members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={member.profiles?.avatar_url || ''} />
                                <AvatarFallback>
                                    {member.profiles?.display_name?.charAt(0) || member.profiles?.email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium flex items-center gap-2">
                                    {member.profiles?.display_name || member.profiles?.email.split('@')[0]}
                                    <Badge variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'default' : 'secondary'} className={`text-[10px] h-4 px-1 ${member.role === 'owner' ? 'bg-brand-copper hover:bg-brand-copper' : ''}`}>
                                        {member.role === 'owner' ? t('roleLabels.owner') : member.role === 'admin' ? t('roleLabels.admin') : t('roleLabels.staff')}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">{member.profiles?.email}</div>
                            </div>
                        </div>

                        {isAdmin && member.role !== 'owner' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        disabled={isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('removeMemberModalHeading')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('removeMemberModalDescription')}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleRemove(member.user_id, member.account_id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {t('removeMemberSubmitLabel')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
