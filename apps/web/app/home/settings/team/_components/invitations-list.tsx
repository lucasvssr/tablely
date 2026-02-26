'use client';

import { useTransition } from 'react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Trash2, Mail, Clock, Link as LinkIcon } from 'lucide-react';
import { deleteInvitationAction } from '~/lib/server/restaurant/team-actions';
import { toast } from 'sonner';
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

interface Invitation {
    id: string;
    email: string;
    role: string;
    created_at: string | null;
}

export function InvitationsList({
    initialInvitations,
    isAdmin
}: {
    initialInvitations: Invitation[];
    isAdmin: boolean;
}) {
    const { t } = useTranslation('teams');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const invitations = initialInvitations as Invitation[];

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteInvitationAction({ id });
                toast.success(t('deleteInvitationSuccessMessage'));
                router.refresh();
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
            }
        });
    };

    if (invitations.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('pendingInvitationsHeading')}
            </h3>
            <div className="divide-y border rounded-lg">
                {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <div className="font-medium flex items-center gap-2">
                                    {invitation.email}
                                    <Badge variant="outline" className="text-[10px] h-4 px-1 capitalize">
                                        {invitation.role}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t('sentOn', { date: new Date(invitation.created_at || '').toLocaleDateString() })}
                                </div>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-primary"
                                    onClick={() => {
                                        const url = `${window.location.origin}/join/${invitation.id}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success(t('copyInvitationLinkSuccess'));
                                    }}
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </Button>

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
                                            <AlertDialogTitle>{t('deleteInvitationModalHeading')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('deleteInvitationModalDescription')}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(invitation.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {t('deleteInvitationSubmitLabel')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
