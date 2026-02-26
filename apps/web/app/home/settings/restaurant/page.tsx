import { PageBody, PageHeader } from '@kit/ui/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { RestaurantSettingsForm } from './_components/restaurant-settings-form';
import { notFound } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { getUserRoleAction } from '~/lib/server/restaurant/restaurant-actions';

export const metadata = {
    title: 'Paramètres du Restaurant',
};

async function getUserAccount(supabase: SupabaseClient<Database>, userId: string) {
    const { data: membership } = await supabase
        .from('memberships')
        .select('account_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

    return membership?.account_id;
}

export default async function RestaurantSettingsPage() {
    const user = await requireUserInServerComponent();
    const supabase = getSupabaseServerClient<Database>();

    const [accountId, role] = await Promise.all([
        getUserAccount(supabase, user.id),
        getUserRoleAction({})
    ]);

    if (!accountId) return notFound();

    const isAdmin = role === 'owner' || role === 'admin';

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name, location, phone')
        .eq('account_id', accountId)
        .single();

    if (!restaurant) return notFound();

    const initialData = {
        name: restaurant.name,
        location: restaurant.location || '',
        phone: restaurant.phone || '',
    };

    return (
        <>
            <PageHeader
                title="Paramètres du Restaurant"
                description="Gérez les informations générales de votre établissement."
            />

            <PageBody>
                <div className="max-w-4xl mx-auto">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/20 overflow-hidden">
                        <div className="h-2 w-full bg-blue-600" />
                        <CardHeader>
                            <CardTitle>Informations de l&apos;établissement</CardTitle>
                            <CardDescription>
                                {isAdmin
                                    ? "Ces informations seront visibles par vos clients sur la page de réservation."
                                    : "Consultez les informations générales de votre établissement."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <RestaurantSettingsForm initialData={initialData} readOnly={!isAdmin} />
                        </CardContent>
                    </Card>
                </div>
            </PageBody>
        </>
    );
}
