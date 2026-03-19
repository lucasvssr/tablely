'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, Edit, Trash2, MapPin, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { cn } from '@kit/ui/utils';

import { deleteRestaurantAction, deleteSingleRestaurantAction, switchToAccountAction, switchToRestaurantAction } from '~/lib/server/restaurant/restaurant-actions';
import { AccountSettingsDialog } from './account-settings-dialog';

interface EstablishmentManagementCardProps {
    establishment: {
        id: string;
        name: string;
        slug: string;
        restaurants: Array<{
            id: string;
            name: string;
            location: string | null;
            phone: string | null;
        }>;
        isActive: boolean;
        activeRestaurantId?: string;
    };
    isAdmin: boolean;
}

export function EstablishmentManagementCard({ establishment, isAdmin }: EstablishmentManagementCardProps) {
    const { t } = useTranslation('restaurant');
    const router = useRouter();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isSwitching, startSwitchTransition] = useTransition();

    const onDelete = () => {
        startDeleteTransition(async () => {
            try {
                await deleteRestaurantAction({ id: establishment.id });
                toast.success(t('manage.deleteSuccess'));
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : t('settings.form.errorUnknown'));
            }
        });
    };

    const onDeleteRestaurant = (restaurantId: string) => {
        startDeleteTransition(async () => {
            try {
                await deleteSingleRestaurantAction({ id: restaurantId });
                toast.success(t('manage.deleteRestaurantSuccess'));
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : t('settings.form.errorUnknown'));
            }
        });
    };

    const onEditRestaurant = (restaurantId: string) => {
        startSwitchTransition(async () => {
            try {
                if (!establishment.isActive) {
                    await switchToAccountAction({ accountId: establishment.id });
                }
                await switchToRestaurantAction({ restaurantId });
                router.push('/home/settings/restaurant');
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : t('settings.form.errorUnknown'));
            }
        });
    };

    const onSwitchToRestaurant = (restaurantId: string) => {
        startSwitchTransition(async () => {
            try {
                if (!establishment.isActive) {
                    await switchToAccountAction({ accountId: establishment.id });
                }
                await switchToRestaurantAction({ restaurantId });
                toast.success(t('manage.switchSuccess') || 'Compte activé');
                router.push('/home');
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : t('settings.form.errorUnknown'));
            }
        });
    };

    const onFocusRestaurant = (restaurantId: string) => {
        router.push(`?focus=${restaurantId}`, { scroll: false });
        document.getElementById('establishments-map-container')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Card className={cn(
            "transition-all duration-200 overflow-hidden group/establishment hover:shadow-lg flex flex-col",
            establishment.isActive ? "border-brand-copper border-2 shadow-md" : "hover:border-zinc-300 dark:hover:border-zinc-700"
        )}>
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover/establishment:scale-110",
                        establishment.isActive ? "bg-brand-copper" : "bg-zinc-400 dark:bg-zinc-600"
                    )}>
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-bold group-hover/establishment:text-brand-copper transition-colors">
                                {establishment.name}
                            </CardTitle>
                            {isAdmin && (
                                <AccountSettingsDialog account={{ id: establishment.id, name: establishment.name }}>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-brand-copper">
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                </AccountSettingsDialog>
                            )}
                        </div>
                        {establishment.isActive && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-copper bg-brand-copper/10 px-1.5 py-0.5 rounded leading-none">
                                Établissement Actif
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4 flex-grow">
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurants</p>
                    {establishment.restaurants.length > 0 ? (
                        <div className="space-y-2">
                            {establishment.restaurants.map((r) => {
                                const isCurrentActive = establishment.isActive && establishment.activeRestaurantId === r.id;
                                return (
                                    <div 
                                        key={r.id} 
                                        className={cn(
                                            "p-3 rounded-md border text-sm flex flex-col gap-1 transition-all cursor-pointer hover:border-brand-copper/50 hover:bg-brand-copper/5 active:scale-[0.98]",
                                            isCurrentActive ? "bg-brand-copper/5 border-brand-copper/20 shadow-sm" : "bg-card"
                                        )}
                                        onClick={() => onFocusRestaurant(r.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{r.name}</span>
                                            <div className="flex items-center gap-1">
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-brand-copper"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditRestaurant(r.id);
                                                        }}
                                                        disabled={isSwitching}
                                                        title={t('manage.edit') || 'Modifier le restaurant'}
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                {isAdmin && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                onClick={(e) => e.stopPropagation()}
                                                                disabled={isDeleting}
                                                                title={t('manage.deleteRestaurant')}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('manage.deleteRestaurant')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('manage.deleteRestaurantConfirm')}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => onDeleteRestaurant(r.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    {t('manage.delete')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}

                                                {!isCurrentActive && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs text-brand-copper hover:text-brand-copper hover:bg-brand-copper/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSwitchToRestaurant(r.id);
                                                        }}
                                                        disabled={isSwitching}
                                                    >
                                                        {t('manage.switch')}
                                                    </Button>
                                                )}
                                                {isCurrentActive && (
                                                    <span className="text-[10px] font-bold text-brand-copper uppercase px-2">Ouvert</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{r.location || 'N/A'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-center py-4 text-muted-foreground italic">Aucun restaurant</p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-t bg-zinc-50/50 dark:bg-zinc-900/50 gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
                    asChild
                >
                    <Link href={`/home/settings/restaurant`}>
                        <Edit className="h-3.5 w-3.5" />
                        Restaurant Actif
                    </Link>
                </Button>

                {isAdmin && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8 text-destructive hover:bg-destructive hover:text-white border-zinc-200 dark:border-zinc-800"
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('manage.delete')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('manage.deleteConfirm')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {t('manage.delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                {isAdmin && (
                    <Button asChild size="sm" variant="outline" className="size-8 p-0">
                        <Link href={`/home/settings/restaurant/new?account_id=${establishment.id}`}>
                            <Plus className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

