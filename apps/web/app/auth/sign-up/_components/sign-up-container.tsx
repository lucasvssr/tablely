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
}

export function SignUpContainer({
    providers,
    displayTermsCheckbox,
    paths,
    email,
    invitationId,
}: SignUpContainerProps) {
    const [role, setRole] = useState<'client' | 'restaurateur'>('client');

    const handleSignUp = async (credentials: { email: string; password: string; invitationId: string }) => {
        return signUpWithRoleAction({
            ...credentials,
            role,
        });
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
