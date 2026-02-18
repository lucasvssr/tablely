'use client';

import { Badge } from '@kit/ui/badge';
import { Users, Trash2, Pencil } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { deleteTableAction } from '~/lib/server/restaurant/restaurant-actions';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface Table {
    id: string;
    name: string;
    capacity: number;
    is_active: boolean;
}

export function TablesList({
    initialTables,
    onEdit
}: {
    initialTables: Table[],
    onEdit?: (table: Table) => void
}) {
    const [isPending, startTransition] = useTransition();

    const onDelete = (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) return;

        startTransition(async () => {
            try {
                await deleteTableAction({ id });
                toast.success('Table supprimée');
                window.location.reload();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        });
    };

    if (initialTables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Users className="h-8 w-8 opacity-20" />
                </div>
                <p>Aucune table configurée pour le moment.</p>
                <p className="text-sm">Utilisez le formulaire pour ajouter votre première table.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {initialTables.map((table) => (
                <div
                    key={table.id}
                    className="group relative flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground font-bold">
                            {table.capacity}
                        </div>
                        <div>
                            <h4 className="font-semibold">{table.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {table.capacity} couverts
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {table.is_active ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                        ) : (
                            <Badge variant="secondary">Inactive</Badge>
                        )}
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
                    </div>
                </div>
            ))}
        </div>
    );
}
