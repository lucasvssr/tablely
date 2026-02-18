'use client';

import { PageBody, PageHeader } from '@kit/ui/page';
import { ServicesList } from './_components/services-list';
import { ServiceForm } from './_components/service-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';

interface Service {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    days_of_week: number[];
}

export default function ServicesSettingsPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const supabase = getSupabaseBrowserClient();

    const fetchServices = async () => {
        const { data } = await supabase
            .from('services')
            .select('*')
            .order('start_time', { ascending: true });
        setServices(data || []);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    return (
        <>
            <PageHeader
                title="Services & Horaires"
                description="Configurez vos périodes de service (Midi, Soir) pour ouvrir vos créneaux de réservation."
            />

            <PageBody>
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1">
                        <Card className="border-none bg-gradient-to-br from-background to-muted/50 shadow-xl">
                            <CardHeader>
                                <CardTitle>Services configurés</CardTitle>
                                <CardDescription>Les périodes durant lesquelles Julie peut réserver une table.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ServicesList
                                    initialServices={services}
                                    onEdit={(service) => setEditingService(service)}
                                />
                            </CardContent>
                        </Card>
                    </div>

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
                                    initialData={editingService || undefined}
                                    onSuccess={() => {
                                        setEditingService(null);
                                        fetchServices();
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
