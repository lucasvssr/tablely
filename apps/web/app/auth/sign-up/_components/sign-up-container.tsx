'use client';

import { useState } from 'react';

import type { Provider } from '@supabase/supabase-js';
import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { SignUpRoleSelector } from './role-selector';
import { signUpWithRoleAction } from '~/lib/server/restaurant/auth-actions';

interface SignUpContainerProps {
    providers: {
        password: boolean;
        magicLink: boolean;
        oAuth: Provider[];
    };
    displayTermsCheckbox?: boolean;
    paths: {
        callback: string;
        appHome: string;
    };
    email?: string;
    invitationId?: string;
    next?: string;
}

export function SignUpContainer({
    providers,
    displayTermsCheckbox,
    paths,
    email,
    invitationId,
    next,
}: SignUpContainerProps) {
    const [role, setRole] = useState<'client' | 'restaurateur'>('client');

    const handleSignUp = async (credentials: { email: string; password: string; invitationId: string }) => {
        const result = await signUpWithRoleAction({
            ...credentials,
            role,
            redirectTo: next,
        });

        if (result.success && next) {
            window.location.href = next;
        }

        return result;
    };

    return (
        <>
            <SignUpRoleSelector value={role} onChange={setRole} />

            <SignUpMethodsContainer
                providers={providers}
                displayTermsCheckbox={displayTermsCheckbox}
                paths={paths}
                email={email}
                invitationId={invitationId}
                customSignUpAction={handleSignUp}
            />
        </>
    );
}
