'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { acceptInvitationAction } from '~/lib/server/restaurant/team-actions';

export function JoinInvitationContainer({ invitationId }: { invitationId: string }) {
    const { t } = useTranslation('teams');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const onAccept = () => {
        startTransition(async () => {
            try {
                await acceptInvitationAction({ invitationId });
                setSuccess(true);
                toast.success(t('join.toastSuccess'));
                setTimeout(() => {
                    router.push('/home');
                }, 2000);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : t('join.unknownError');
                setError(message);
                toast.error(message);
            }
        });
    };

    if (success) {
        return (
            <Card className="w-full max-w-md mx-auto text-center border-green-100 bg-green-50/30">
                <CardContent className="pt-10">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl mb-2">{t('join.successTitle')}</CardTitle>
                    <CardDescription>
                        {t('join.successDescription')}
                    </CardDescription>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full max-w-md mx-auto text-center border-red-100 bg-red-50/30">
                <CardContent className="pt-10">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl mb-2">{t('join.errorTitle')}</CardTitle>
                    <CardDescription className="text-red-600">
                        {error}
                    </CardDescription>
                </CardContent>
                <CardFooter className="justify-center pb-10">
                    <Button onClick={() => router.back()} variant="outline">
                        {t('join.goBack')}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto border-none shadow-2xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
            <div className="h-2 w-full bg-brand-copper" />
            <CardHeader className="text-center pt-10">
                <CardTitle className="text-3xl font-bold tracking-tight">{t('join.title')}</CardTitle>
                <CardDescription className="text-lg">
                    {t('join.description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-10 text-center">
                <p className="text-muted-foreground mb-8">
                    {t('join.info')}
                </p>
                <Button
                    onClick={onAccept}
                    disabled={isPending}
                    className="w-full h-12 text-lg bg-brand-copper hover:bg-brand-copper/90 transition-all transform hover:scale-[1.02]"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t('join.accepting')}
                        </>
                    ) : (
                        t('join.acceptButton')
                    )}
                </Button>
            </CardContent>
            <CardFooter className="justify-center pb-10">
                <p className="text-xs text-muted-foreground">
                    {t('join.connectedAs')}
                </p>
            </CardFooter>
        </Card>
    );
}
