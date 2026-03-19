'use client';

import { Badge } from '@kit/ui/badge';
import { Users, Trash2, Pencil } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { deleteTableAction } from '~/lib/server/restaurant/restaurant-actions';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { useTranslation } from 'react-i18next';

interface Table {
    id: string;
    name: string;
    capacity: number;
    is_active: boolean;
}

export function TablesList({
    initialTables,
    onEdit,
    isAdmin
}: {
    initialTables: Table[],
    onEdit?: (table: Table) => void,
    isAdmin: boolean
}) {
    const { t } = useTranslation('restaurant');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onDelete = (id: string) => {
        if (!confirm(t('tables.list.deleteConfirm'))) return;

        startTransition(async () => {
            try {
                await deleteTableAction({ id });
                toast.success(t('tables.list.deleteSuccess'));
                router.refresh();
            } catch {
                toast.error(t('tables.list.deleteError'));
            }
        });
    };

    if (initialTables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Users className="h-8 w-8 opacity-20" />
                </div>
                <p>{t('tables.list.noTables')}</p>
                <p className="text-sm">{t('tables.list.noTablesDesc')}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {initialTables.map((table) => (
                <div
                    key={table.id}
                    className="group/table relative flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover/table:bg-primary group-hover/table:text-primary-foreground font-bold">
                            {table.capacity}
                        </div>
                        <div>
                            <h4 className="font-semibold">{table.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {t('tables.list.capacity', { count: table.capacity })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {table.is_active ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{t('tables.list.active')}</Badge>
                        ) : (
                            <Badge variant="secondary">{t('tables.list.inactive')}</Badge>
                        )}
                        {isAdmin && (
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() => onEdit?.(table)}
                                    disabled={isPending}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                    onClick={() => onDelete(table.id)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
