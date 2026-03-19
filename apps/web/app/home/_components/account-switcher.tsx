'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { switchToAccountAction, switchToRestaurantAction } from '~/lib/server/restaurant/restaurant-actions';
import Link from 'next/link';
import { SidebarContext } from '@kit/ui/shadcn-sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@kit/ui/tooltip';

interface Account {
    id: string;
    name: string;
    slug: string;
    role: string;
    restaurants?: Array<{ id: string; name: string }>;
}

export function AccountSwitcher({
    accounts,
    activeAccountId,
    activeRestaurantId,
    collapsed,
}: {
    accounts: Account[];
    activeAccountId: string;
    activeRestaurantId?: string;
    collapsed?: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const sidebar = React.useContext(SidebarContext);
    const isCollapsed = collapsed !== undefined ? collapsed : sidebar?.state === 'collapsed';

    const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

    if (!activeAccount) return null;

    const onSelectAccount = (accountId: string) => {
        if (accountId === activeAccountId) return;

        startTransition(async () => {
            await switchToAccountAction({ accountId });
            router.refresh();
        });
    };

    const onSelectRestaurant = (restaurantId: string) => {
        if (restaurantId === activeRestaurantId) return;

        startTransition(async () => {
            await switchToRestaurantAction({ restaurantId });
            router.refresh();
        });
    };

    const canAdd = activeAccount.role !== 'member';
    const activeRestaurant = activeAccount.restaurants?.find(r => r.id === activeRestaurantId);
    const shouldShowDropdown = true; // Always show to allow switching restaurants

    const trigger = (
        <Button
            variant="ghost"
            title={isCollapsed ? activeAccount.name : undefined}
            className={cn(
                "w-full justify-start px-3 text-left font-normal transition-all",
                isCollapsed ? "h-12 w-12 p-0 justify-center" : "h-14",
                isPending && "opacity-50",
                shouldShowDropdown ? "hover:bg-muted/50" : "cursor-default"
            )}
        >
            <div className={cn(
                "flex items-center gap-2 overflow-hidden text-sm uppercase",
                isCollapsed && "gap-0"
            )}>
                <div className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg bg-brand-copper text-white transition-all shadow-md",
                    isCollapsed ? "h-8 w-8" : "h-9 w-9"
                )}>
                    <Building2 className={cn("transition-all", isCollapsed ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col items-start overflow-hidden leading-tight">
                        <span className="truncate font-semibold text-foreground dark:text-zinc-100">
                            {activeRestaurant?.name || activeAccount.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                            {activeRestaurant ? activeAccount.name : 'Établissement'}
                        </span>
                    </div>
                )}
            </div>
            {!isCollapsed && shouldShowDropdown && (
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-40" />
            )}
        </Button>
    );

    if (!shouldShowDropdown) {
        return trigger;
    }

    const switcher = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-72"
                align={isCollapsed ? "start" : "start"}
                side={isCollapsed ? "right" : "bottom"}
                sideOffset={isCollapsed ? 12 : 4}
            >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1.5">
                    Mes établissements
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="max-h-[400px] overflow-y-auto">
                    {accounts.map((account) => (
                        <div key={account.id} className="pb-2">
                            <DropdownMenuItem
                                onSelect={() => onSelectAccount(account.id)}
                                className={cn(
                                    "flex items-center justify-between cursor-pointer py-2 px-2 mx-1 rounded-md",
                                    account.id === activeAccountId ? "bg-muted/50 font-semibold" : "hover:bg-muted/30"
                                )}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Building2 className={cn("h-4 w-4", account.id === activeAccountId ? "text-brand-copper" : "text-muted-foreground")} />
                                    <span className="truncate text-sm">{account.name}</span>
                                </div>
                                {account.id === activeAccountId && <Check className="h-3 w-3 text-brand-copper" />}
                            </DropdownMenuItem>

                            {/* Restaurants for this account */}
                            {account.id === activeAccountId && account.restaurants && account.restaurants.length > 0 && (
                                <div className="ml-6 mt-1 space-y-0.5 border-l border-muted pl-2">
                                    {account.restaurants.map((rest) => (
                                        <DropdownMenuItem
                                            key={rest.id}
                                            onSelect={() => onSelectRestaurant(rest.id)}
                                            className={cn(
                                                "flex items-center justify-between cursor-pointer py-1.5 px-2 rounded-md text-xs",
                                                rest.id === activeRestaurantId ? "bg-brand-copper/10 text-brand-copper font-medium" : "text-muted-foreground hover:bg-muted/30"
                                            )}
                                        >
                                            <span className="truncate">{rest.name}</span>
                                            {rest.id === activeRestaurantId && <Check className="h-3 w-3" />}
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {canAdd && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/home/settings/restaurant/new" className="flex items-center gap-2 cursor-pointer w-full py-2.5 px-3 hover:bg-muted/50">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Ajouter un établissement</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {switcher}
                </TooltipTrigger>
                <TooltipContent side="right" align="center" sideOffset={10} className="flex items-center gap-2 py-2 px-3">
                    <span className="font-semibold">{activeAccount.name}</span>
                    <span className="text-xs text-muted-foreground"> (Cliquer pour changer)</span>
                </TooltipContent>
            </Tooltip>
        );
    }

    return switcher;
}
