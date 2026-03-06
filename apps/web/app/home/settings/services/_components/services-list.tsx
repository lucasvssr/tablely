'use client';

import { Clock, Calendar, Trash2, Pencil } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { deleteServiceAction } from '~/lib/server/restaurant/restaurant-actions';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { useTranslation } from 'react-i18next';

interface Service {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    days_of_week: number[];
}

export function ServicesList({
    initialServices,
    onEdit,
    isAdmin
}: {
    initialServices: Service[],
    onEdit?: (service: Service) => void,
    isAdmin: boolean
}) {
    const { t } = useTranslation('restaurant');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onDelete = (id: string) => {
        if (!confirm(t('services.list.deleteConfirm'))) return;

        startTransition(async () => {
            try {
                await deleteServiceAction({ id });
                toast.success(t('services.list.deleteSuccess'));
                router.refresh();
            } catch {
                toast.error(t('services.list.deleteError'));
            }
        });
    };

    const formatDays = (days: number[]) => {
        if (!days || days.length === 0) return t('services.list.noDays');
        if (days.length === 7) return t('services.list.allDays');

        // Sort days numerically
        const sortedDays = [...days].sort((a, b) => a - b);

        // Check if it's a range (simple check)
        const first = sortedDays[0];
        const last = sortedDays[sortedDays.length - 1];

        if (first !== undefined && last !== undefined && sortedDays.length > 2 && last - first === sortedDays.length - 1) {
            return `${t(`services.days.${first}`)} - ${t(`services.days.${last}`)}`;
        }

        return sortedDays.map(d => t(`services.days.${d}`)).join(', ');
    };

    if (initialServices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Clock className="h-8 w-8 opacity-20" />
                </div>
                <p>{t('services.list.noServices')}</p>
                <p className="text-sm">{t('services.list.noServicesDesc')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {initialServices.map((service) => (
                <div
                    key={service.id}
                    className="flex items-center justify-between rounded-xl border bg-card p-5 transition-all hover:bg-muted/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold">{service.name}</h4>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {service.start_time.substring(0, 5)} - {service.end_time.substring(0, 5)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDays(service.days_of_week)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() => onEdit?.(service)}
                                    disabled={isPending}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                    onClick={() => onDelete(service.id)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
