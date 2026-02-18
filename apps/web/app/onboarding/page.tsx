import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import { createRestaurantAction } from '~/lib/server/restaurant/restaurant-actions';
import { withI18n } from '~/lib/i18n/with-i18n';

function OnboardingPage() {
    return (
        <PageBody className={'flex flex-col items-center justify-center min-h-[80vh]'}>
            <Card className={'w-full max-w-md border-primary/10 shadow-xl'}>
                <CardHeader className={'text-center'}>
                    <CardTitle className={'text-2xl font-bold'}>Bienvenue sur Bmad</CardTitle>
                    <CardDescription>
                        Configurons votre établissement pour commencer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createRestaurantAction} className={'grid gap-6'}>
                        <div className={'grid gap-2'}>
                            <Label htmlFor="name">Nom du Restaurant</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ex: Le Petit Bistro"
                                required
                            />
                        </div>

                        <div className={'grid gap-2'}>
                            <Label htmlFor="location">Localisation / Ville</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="Ex: Paris, 11ème"
                                required
                            />
                        </div>

                        <div className={'grid gap-2'}>
                            <Label htmlFor="total_capacity">Capacité Totale (Couverts)</Label>
                            <Input
                                id="total_capacity"
                                name="total_capacity"
                                type="number"
                                placeholder="Ex: 40"
                                required
                            />
                        </div>

                        <Button type="submit" className={'w-full'}>
                            Créer mon établissement
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </PageBody>
    );
}

export default withI18n(OnboardingPage);
