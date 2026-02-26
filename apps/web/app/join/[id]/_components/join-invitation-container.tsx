'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { acceptInvitationAction } from '~/lib/server/restaurant/team-actions';

export function JoinInvitationContainer({ invitationId }: { invitationId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const onAccept = () => {
        startTransition(async () => {
            try {
                await acceptInvitationAction({ invitationId });
                setSuccess(true);
                toast.success('Invitation acceptée !');
                setTimeout(() => {
                    router.push('/home');
                }, 2000);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : 'Erreur inconnue';
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
                    <CardTitle className="text-2xl mb-2">Bienvenue dans l&apos;équipe !</CardTitle>
                    <CardDescription>
                        Vous avez rejoint l&apos;organisation avec succès. Redirection en cours...
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
                    <CardTitle className="text-2xl mb-2">Oups !</CardTitle>
                    <CardDescription className="text-red-600">
                        {error}
                    </CardDescription>
                </CardContent>
                <CardFooter className="justify-center pb-10">
                    <Button onClick={() => router.push('/')} variant="outline">
                        Retour à l&apos;accueil
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto border-none shadow-2xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
            <div className="h-2 w-full bg-blue-600" />
            <CardHeader className="text-center pt-10">
                <CardTitle className="text-3xl font-bold tracking-tight">Rejoindre l&apos;équipe</CardTitle>
                <CardDescription className="text-lg">
                    Vous avez été invité à rejoindre un établissement sur Tablely.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-10 text-center">
                <p className="text-muted-foreground mb-8">
                    En acceptant cette invitation, vous aurez accès aux outils de gestion du restaurant selon votre rôle.
                </p>
                <Button
                    onClick={onAccept}
                    disabled={isPending}
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-[1.02]"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Acceptation...
                        </>
                    ) : (
                        'Accepter l\'invitation'
                    )}
                </Button>
            </CardContent>
            <CardFooter className="justify-center pb-10">
                <p className="text-xs text-muted-foreground">
                    Connecté en tant qu&apos;utilisateur actuel.
                </p>
            </CardFooter>
        </Card>
    );
}
