'use client';

import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { Label } from '@kit/ui/label';
import { Utensils, User } from 'lucide-react';

interface SignUpRoleSelectorProps {
    value: 'client' | 'restaurateur';
    onChange: (value: 'client' | 'restaurateur') => void;
}

export function SignUpRoleSelector({ value, onChange }: SignUpRoleSelectorProps) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <Label className="text-base font-semibold">Vous êtes ?</Label>
            <RadioGroup
                value={value}
                onValueChange={(v) => onChange(v as 'client' | 'restaurateur')}
                className="grid grid-cols-2 gap-4"
            >
                <div>
                    <RadioGroupItem
                        value="client"
                        id="client"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="client"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                        <User className="mb-3 h-6 w-6" />
                        <span className="font-medium text-sm">Client</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                            Je souhaite réserver une table
                        </span>
                    </Label>
                </div>

                <div>
                    <RadioGroupItem
                        value="restaurateur"
                        id="restaurateur"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="restaurateur"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                        <Utensils className="mb-3 h-6 w-6" />
                        <span className="font-medium text-sm">Restaurateur</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                            Je souhaite gérer mon établissement
                        </span>
                    </Label>
                </div>
            </RadioGroup>
        </div>
    );
}
