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
import { switchToAccountAction } from '~/lib/server/restaurant/restaurant-actions';
import Link from 'next/link';
import { SidebarContext } from '@kit/ui/shadcn-sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@kit/ui/tooltip';

interface Account {
    id: string;
    name: string;
    slug: string;
    role: string;
}

export function AccountSwitcher({
    accounts,
    activeAccountId,
}: {
    accounts: Account[];
    activeAccountId: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const sidebar = React.useContext(SidebarContext);
    const isCollapsed = sidebar?.state === 'collapsed';

    const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

    const onSelect = (accountId: string) => {
        if (accountId === activeAccountId) return;

        startTransition(async () => {
            await switchToAccountAction({ accountId });
            router.refresh();
        });
    };

    if (!activeAccount) return null;

    const trigger = (
        <Button
            variant="ghost"
            title={isCollapsed ? activeAccount.name : undefined}
            className={cn(
                "w-full justify-start px-2 text-left font-normal hover:bg-muted/50",
                isCollapsed ? "h-12 w-12 p-0 justify-center" : "h-12",
                isPending && "opacity-50"
            )}
        >
            <div className={cn(
                "flex items-center gap-3 overflow-hidden text-sm uppercase",
                isCollapsed && "gap-0"
            )}>
                <div className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg bg-brand-copper text-white transition-all shadow-md group-hover:shadow-brand-copper/20",
                    isCollapsed ? "h-8 w-8" : "h-9 w-9"
                )}>
                    <Building2 className={cn("transition-all", isCollapsed ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col items-start overflow-hidden leading-tight">
                        <span className="truncate font-bold text-zinc-900 dark:text-zinc-100">{activeAccount.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Établissement</span>
                    </div>
                )}
            </div>
            {!isCollapsed && (
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-40" />
            )}
        </Button>
    );

    const switcher = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64"
                align={isCollapsed ? "start" : "start"}
                side={isCollapsed ? "right" : "bottom"}
                sideOffset={isCollapsed ? 12 : 4}
            >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
                    Mes établissements
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accounts.map((account) => (
                    <DropdownMenuItem
                        key={account.id}
                        onSelect={() => onSelect(account.id)}
                        className="flex items-center justify-between cursor-pointer py-2.5"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white shadow-sm",
                                account.id === activeAccountId ? "bg-brand-copper" : "bg-muted text-muted-foreground"
                            )}>
                                <Building2 className="h-4 w-4" />
                            </div>
                            <span className={cn("truncate", account.id === activeAccountId && "font-semibold")}>
                                {account.name}
                            </span>
                        </div>
                        {account.id === activeAccountId && <Check className="h-4 w-4 text-brand-copper" />}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/home/settings/restaurant/new" className="flex items-center gap-2 cursor-pointer w-full py-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                            <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-muted-foreground">Ajouter un établissement</span>
                    </Link>
                </DropdownMenuItem>
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
