import { PageBody, PageHeader } from '@kit/ui/page';
import { TablesContainer } from './_components/tables-container';
import { getTablesAction, getUserRoleAction } from '~/lib/server/restaurant/restaurant-actions';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export async function generateMetadata() {
    const i18n = await createI18nServerInstance();

    return {
        title: i18n.t('restaurant:tables.pageTitle'),
    };
}

export default async function TablesSettingsPage() {
    const i18n = await createI18nServerInstance();

    const [tables, role] = await Promise.all([
        getTablesAction({}),
        getUserRoleAction({})
    ]);

    const isAdmin = role === 'owner' || role === 'admin';

    return (
        <>
            <PageHeader
                title={i18n.t('restaurant:tables.pageTitle')}
                description={i18n.t('restaurant:tables.pageDescription')}
                displaySidebarTrigger={false}
            />

            <PageBody>
                <TablesContainer initialTables={tables} isAdmin={isAdmin} />
            </PageBody>
        </>
    );
}
