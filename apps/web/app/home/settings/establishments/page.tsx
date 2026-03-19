import { Plus } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Button } from '@kit/ui/button';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { getMembershipsAction, getUserRoleAction } from '~/lib/server/restaurant/restaurant-actions';
import { withI18n } from '~/lib/i18n/with-i18n';

import { EstablishmentManagementCard } from './_components/establishment-management-card';
import { EstablishmentsMap } from './_components/establishments-map-client';

async function EstablishmentsPage() {
    const i18n = await createI18nServerInstance();
    const memberships = await getMembershipsAction({});
    const role = await getUserRoleAction({});
    const cookieStore = await cookies();
    const activeAccountId = cookieStore.get('active_account_id')?.value;

    const isAdmin = role === 'owner' || role === 'admin';
    const t = i18n.getFixedT(null, 'restaurant');

    // Convert memberships to simpler establishment objects
    const activeRestId = cookieStore.get('active_restaurant_id')?.value;

    const establishments = memberships.map(m => ({
        id: m.id,
        name: m.name || 'N/A',
        slug: m.slug || '',
        restaurants: m.restaurants || [],
        isActive: m.id === activeAccountId,
        activeRestaurantId: activeRestId
    }));

    // Flatten restaurants for the map
    const mapEstablishments = establishments.flatMap(e =>
        e.restaurants.map((r) => ({
            id: r.id,
            name: r.name,
            location: r.location,
            phone: r.phone,
            lat: r.lat,
            lng: r.lng,
            isActive: e.isActive && e.activeRestaurantId === r.id
        }))
    );

    return (
        <>
            <PageHeader
                title={t('manage.pageTitle')}
                description={t('manage.pageDescription')}
            >
                {isAdmin && (
                    <Button asChild className="bg-brand-copper hover:bg-brand-copper/90">
                        <Link href="/home/settings/restaurant/new" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            {t('manage.newRestaurant')}
                        </Link>
                    </Button>
                )}
            </PageHeader>

            <PageBody className="space-y-8">
                {mapEstablishments.length > 0 && (
                    <div id="establishments-map-container">
                        <EstablishmentsMap
                            establishments={mapEstablishments}
                            className="h-[400px] w-full"
                        />
                    </div>
                )}

                {establishments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {establishments.map((establishment) => (
                            <EstablishmentManagementCard
                                key={establishment.id}
                                establishment={establishment}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed rounded-xl gap-4">
                        <p className="text-muted-foreground">{t('manage.noRestaurants')}</p>
                        {isAdmin && (
                            <Button asChild variant="outline">
                                <Link href="/home/settings/restaurant/new">
                                    {t('manage.newRestaurant')}
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageBody>
        </>
    );
}

export default withI18n(EstablishmentsPage);
