'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { TablesList } from './tables-list';
import { TableForm } from './table-form';

import { useTranslation } from 'react-i18next';

interface Table {
    id: string;
    name: string;
    capacity: number;
    is_active: boolean;
}

export function TablesContainer({
    initialTables,
    isAdmin
}: {
    initialTables: Table[];
    isAdmin: boolean;
}) {
    const { t } = useTranslation('restaurant');
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    return (
        <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
                <Card className="border-none bg-gradient-to-br from-background to-muted/50 shadow-xl">
                    <CardHeader>
                        <CardTitle>{t('tables.container.title')}</CardTitle>
                        <CardDescription>{t('tables.container.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TablesList
                            initialTables={initialTables}
                            onEdit={isAdmin ? (table) => setEditingTable(table) : undefined}
                            isAdmin={isAdmin}
                        />
                    </CardContent>
                </Card>
            </div>

            {isAdmin && (
                <div className="w-full lg:w-96">
                    <Card className="sticky top-4 overflow-hidden border-primary/10 shadow-lg">
                        <div className="h-1.5 w-full bg-secondary" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div className="space-y-1">
                                <CardTitle>{editingTable ? t('tables.container.editTable') : t('tables.container.newTable')}</CardTitle>
                                <CardDescription>
                                    {editingTable ? t('tables.container.editTableDescription') : t('tables.container.newTableDescription')}
                                </CardDescription>
                            </div>
                            {editingTable && (
                                <button
                                    onClick={() => setEditingTable(null)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {t('tables.container.cancel')}
                                </button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <TableForm
                                initialData={editingTable || undefined}
                                onSuccess={() => {
                                    setEditingTable(null);
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
