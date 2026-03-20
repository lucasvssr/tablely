import { PageBody, PageHeader } from '@kit/ui/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { RestaurantSettingsForm } from './_components/restaurant-settings-form';
import { notFound } from 'next/navigation';
import { Database } from '~/lib/database.types';
import { getUserRoleAction, getActiveMembership, getActiveRestaurant } from '~/lib/server/restaurant/restaurant-actions';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export async function generateMetadata() {
    const i18n = await createI18nServerInstance();

    return {
        title: i18n.t('restaurant:settings.pageTitle'),
    };
}

export default async function RestaurantSettingsPage() {
    const user = await requireUserInServerComponent();
    const supabase = getSupabaseServerClient<Database>();
    const i18n = await createI18nServerInstance();

    const [activeMembership, role, activeRestaurantId] = await Promise.all([
        getActiveMembership(supabase, user.id),
        getUserRoleAction({}),
        getActiveRestaurant(supabase, user.id)
    ]);

    const accountId = activeMembership?.account_id;

    if (!accountId || !activeRestaurantId) return notFound();

    const isAdmin = role === 'owner' || role === 'admin';

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name, location, phone, lat, lng')
        .eq('id', activeRestaurantId)
        .eq('account_id', accountId)
        .single();

    if (!restaurant) return notFound();

    const initialData = {
        id: restaurant.id,
        name: restaurant.name,
        location: restaurant.location || '',
        phone: restaurant.phone || '',
        lat: restaurant.lat || undefined,
        lng: restaurant.lng || undefined,
    };

    return (
        <>
            <PageHeader
                title={i18n.t('restaurant:settings.pageTitle')}
                description={i18n.t('restaurant:settings.pageDescription')}
                displaySidebarTrigger={false}
            />

            <PageBody>
                <div className="max-w-4xl mx-auto pb-16">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/20 overflow-hidden">
                        <div className="h-2 w-full bg-brand-copper" />
                        <CardHeader>
                            <CardTitle>{i18n.t('restaurant:settings.cardTitle')}</CardTitle>
                            <CardDescription>
                                {isAdmin
                                    ? i18n.t('restaurant:settings.cardDescriptionAdmin')
                                    : i18n.t('restaurant:settings.cardDescriptionStaff')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <RestaurantSettingsForm key={activeRestaurantId} initialData={initialData} readOnly={!isAdmin} />
                        </CardContent>
                    </Card>
                </div>
            </PageBody>
        </>
    );
}
