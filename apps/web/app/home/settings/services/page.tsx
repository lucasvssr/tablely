import { PageBody, PageHeader } from '@kit/ui/page';
import { ServicesContainer } from './_components/services-container';
import { getServicesAction, getUserRoleAction } from '~/lib/server/restaurant/restaurant-actions';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export async function generateMetadata() {
    const i18n = await createI18nServerInstance();

    return {
        title: i18n.t('restaurant:services.pageTitle'),
    };
}

export default async function ServicesSettingsPage() {
    const i18n = await createI18nServerInstance();

    const [services, role] = await Promise.all([
        getServicesAction({}),
        getUserRoleAction({})
    ]);

    const isAdmin = role === 'owner' || role === 'admin';

    return (
        <>
            <PageHeader
                title={i18n.t('restaurant:services.pageTitle')}
                description={i18n.t('restaurant:services.pageDescription')}
                displaySidebarTrigger={false}
            />

            <PageBody>
                <ServicesContainer initialServices={services} isAdmin={isAdmin} />
            </PageBody>
        </>
    );
}
