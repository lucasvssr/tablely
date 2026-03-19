import { PageBody, PageHeader } from '@kit/ui/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { CreateRestaurantForm } from '../_components/create-restaurant-form';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export async function generateMetadata() {
    const i18n = await createI18nServerInstance();

    return {
        title: i18n.t('restaurant:create.pageTitle'),
    };
}

export default async function NewRestaurantPage() {
    await requireUserInServerComponent();
    const i18n = await createI18nServerInstance();

    return (
        <>
            <PageHeader
                title={i18n.t('restaurant:create.pageTitle')}
                description={i18n.t('restaurant:create.pageDescription')}
                displaySidebarTrigger={false}
            />

            <PageBody>
                <div className="max-w-4xl mx-auto pb-16">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/20 overflow-hidden">
                        <div className="h-2 w-full bg-brand-copper" />
                        <CardHeader>
                            <CardTitle>{i18n.t('restaurant:create.cardTitle')}</CardTitle>
                            <CardDescription>
                                {i18n.t('restaurant:create.cardDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <CreateRestaurantForm />
                        </CardContent>
                    </Card>
                </div>
            </PageBody>
        </>
    );
}
