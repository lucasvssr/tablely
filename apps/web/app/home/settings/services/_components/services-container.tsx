'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { ServicesList } from './services-list';
import { ServiceForm } from './service-form';

interface ExistingService {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    duration_minutes?: number;
    days_of_week: number[];
    buffer_minutes?: number;
}

export function ServicesContainer({
    initialServices,
    isAdmin
}: {
    initialServices: ExistingService[];
    isAdmin: boolean;
}) {
    const [editingService, setEditingService] = useState<ExistingService | null>(null);

    return (
        <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
                <Card className="border-none bg-gradient-to-br from-background to-muted/50 shadow-xl">
                    <CardHeader>
                        <CardTitle>Services configurés</CardTitle>
                        <CardDescription>Les périodes durant lesquelles les clients peuvent réserver une table.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ServicesList
                            initialServices={initialServices}
                            onEdit={isAdmin ? (service) => setEditingService(service as ExistingService) : undefined}
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
                                <CardTitle>{editingService ? 'Modifier le service' : 'Nouveau Service'}</CardTitle>
                                <CardDescription>
                                    {editingService ? 'Mettez à jour les horaires' : 'Ajoutez une plage horaire de service.'}
                                </CardDescription>
                            </div>
                            {editingService && (
                                <button
                                    onClick={() => setEditingService(null)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Annuler
                                </button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <ServiceForm
                                initialData={editingService ? { ...editingService, duration_minutes: editingService.duration_minutes ?? 90 } : undefined}
                                onSuccess={() => {
                                    setEditingService(null);
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
