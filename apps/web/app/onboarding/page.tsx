import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import { createRestaurantAction } from '~/lib/server/restaurant/restaurant-actions';
import { withI18n } from '~/lib/i18n/with-i18n';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export async function generateMetadata() {
    const i18n = await createI18nServerInstance();
    return {
        title: i18n.t('onboarding:title'),
    };
}

async function OnboardingPage() {
    const i18n = await createI18nServerInstance();

    return (
        <PageBody className={'flex flex-col items-center justify-center min-h-[80vh]'}>
            <Card className={'w-full max-w-md border-primary/10 shadow-xl'}>
                <CardHeader className={'text-center'}>
                    <CardTitle className={'text-2xl font-bold'}>{i18n.t('onboarding:title')}</CardTitle>
                    <CardDescription>
                        {i18n.t('onboarding:description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createRestaurantAction} className={'grid gap-6'}>
                        <div className={'grid gap-2'}>
                            <Label htmlFor="name">{i18n.t('onboarding:form.restaurantName')}</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={i18n.t('onboarding:form.restaurantNamePlaceholder')}
                                required
                            />
                        </div>

                        <div className={'grid gap-2'}>
                            <Label htmlFor="location">{i18n.t('onboarding:form.location')}</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder={i18n.t('onboarding:form.locationPlaceholder')}
                                required
                            />
                        </div>


                        <Button type="submit" className={'w-full'}>
                            {i18n.t('onboarding:form.submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </PageBody>
    );
}

export default withI18n(OnboardingPage);
