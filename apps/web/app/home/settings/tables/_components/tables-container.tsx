'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { TablesList } from './tables-list';
import { TableForm } from './table-form';

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
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    return (
        <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
                <Card className="border-none bg-gradient-to-br from-background to-muted/50 shadow-xl">
                    <CardHeader>
                        <CardTitle>Tables en service</CardTitle>
                        <CardDescription>Liste des tables configurées pour votre établissement.</CardDescription>
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
                        <div className="h-1.5 w-full bg-primary" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div className="space-y-1">
                                <CardTitle>{editingTable ? 'Modifier la table' : 'Ajouter une table'}</CardTitle>
                                <CardDescription>
                                    {editingTable ? 'Mettez à jour les informations' : 'Définissez une nouvelle table'}
                                </CardDescription>
                            </div>
                            {editingTable && (
                                <button
                                    onClick={() => setEditingTable(null)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Annuler
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
