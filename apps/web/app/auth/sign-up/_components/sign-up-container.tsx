'use client';

import { useState } from 'react';
import type { Provider } from '@supabase/supabase-js';
import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { SignUpRoleSelector } from './role-selector';
import { signUpWithRoleAction } from '~/lib/server/restaurant/auth-actions';
import { Turnstile } from '@marsidev/react-turnstile';

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
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const handleSignUp = async (credentials: {
        email: string;
        password: string;
        invitationId: string;
        firstName: string;
        lastName: string;
    }) => {
        const result = await signUpWithRoleAction({
            ...credentials,
            role,
            redirectTo: next,
            captchaToken: captchaToken ?? undefined,
        });

        if (result.success && next) {
            window.location.href = next;
        }

        return result;
    };

    const siteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;

    return (
        <div className="flex flex-col gap-4">
            <SignUpRoleSelector value={role} onChange={setRole} />

            <SignUpMethodsContainer
                providers={providers}
                displayTermsCheckbox={displayTermsCheckbox}
                paths={paths}
                email={email}
                invitationId={invitationId}
                customSignUpAction={handleSignUp}
            />

            {siteKey && (
                <div className="flex justify-center py-2">
                    <Turnstile
                        siteKey={siteKey}
                        onSuccess={setCaptchaToken}
                        onExpire={() => setCaptchaToken(null)}
                        onError={() => setCaptchaToken(null)}
                    />
                </div>
            )}
        </div>
    );
}
