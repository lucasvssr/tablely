import { PageBody, PageHeader } from '@kit/ui/page';
import { TablesContainer } from './_components/tables-container';
import { getTablesAction, getUserRoleAction } from '~/lib/server/restaurant/restaurant-actions';

export const metadata = {
    title: 'Plan de Salle | Tablely',
};

export default async function TablesSettingsPage() {
    const [tables, role] = await Promise.all([
        getTablesAction({}),
        getUserRoleAction({})
    ]);

    const isAdmin = role === 'owner' || role === 'admin';

    return (
        <>
            <PageHeader
                title="Plan de Salle"
                description="Gérez les tables de votre restaurant pour calculer précisément vos disponibilités."
            />

            <PageBody>
                <TablesContainer initialTables={tables} isAdmin={isAdmin} />
            </PageBody>
        </>
    );
}
