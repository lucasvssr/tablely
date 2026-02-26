import { PageBody, PageHeader } from '@kit/ui/page';
import { ServicesContainer } from './_components/services-container';
import { getServicesAction, getUserRoleAction } from '~/lib/server/restaurant/restaurant-actions';

export const metadata = {
    title: 'Services & Horaires | Tablely',
};

export default async function ServicesSettingsPage() {
    const [services, role] = await Promise.all([
        getServicesAction({}),
        getUserRoleAction({})
    ]);

    const isAdmin = role === 'owner' || role === 'admin';

    return (
        <>
            <PageHeader
                title="Services & Horaires"
                description="Configurez vos périodes de service (Midi, Soir) pour ouvrir vos créneaux de réservation."
            />

            <PageBody>
                <ServicesContainer initialServices={services} isAdmin={isAdmin} />
            </PageBody>
        </>
    );
}
