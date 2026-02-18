'use client';

import { PageBody, PageHeader } from '@kit/ui/page';
import { TablesList } from './_components/tables-list';
import { TableForm } from './_components/table-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';

interface Table {
    id: string;
    name: string;
    capacity: number;
    is_active: boolean;
}

export default function TablesSettingsPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const supabase = getSupabaseBrowserClient();

    const fetchTables = async () => {
        const { data } = await supabase
            .from('dining_tables')
            .select('*')
            .order('name', { ascending: true });
        setTables(data || []);
    };

    useEffect(() => {
        fetchTables();
    }, []);

    return (
        <>
            <PageHeader
                title="Plan de Salle"
                description="Gérez les tables de votre restaurant pour calculer précisément vos disponibilités."
            />

            <PageBody>
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1">
                        <Card className="border-none bg-gradient-to-br from-background to-muted/50 shadow-xl">
                            <CardHeader>
                                <CardTitle>Tables en service</CardTitle>
                                <CardDescription>Liste des tables configurées pour votre établissement.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TablesList
                                    initialTables={tables}
                                    onEdit={(table) => setEditingTable(table)}
                                />
                            </CardContent>
                        </Card>
                    </div>

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
                                        fetchTables();
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageBody>
        </>
    );
}
