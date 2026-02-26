'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Database } from '@kit/supabase/database';
import { enhanceAction } from '@kit/next/actions';

/**
 * @name signUpWithRoleAction
 * @description Action to sign up a user with a specific role (client or restaurateur).
 */
export const signUpWithRoleAction = enhanceAction(
    async (credentials: {
        email: string;
        password: string;
        role: 'client' | 'restaurateur';
        invitationId?: string;
    }) => {
        const adminClient = getSupabaseServerAdminClient<Database>();
        const userClient = getSupabaseServerClient<Database>();

        // 1. If there's an invitation, handle it first
        if (credentials.invitationId) {
            const { data: invitation, error: fetchError } = await adminClient
                .from('invitations')
                .select('*')
                .eq('id', credentials.invitationId)
                .single();

            if (fetchError || !invitation) throw new Error('Invitation non trouvée ou expirée');
            if (invitation.email.toLowerCase() !== credentials.email.toLowerCase()) {
                throw new Error(`L'email ne correspond pas à l'invitation.`);
            }

            // Create user with specific metadata
            const { data: userData, error: signUpError } = await adminClient.auth.admin.createUser({
                email: credentials.email,
                password: credentials.password,
                email_confirm: true,
                user_metadata: {
                    role: credentials.role,
                }
            });

            if (signUpError) throw new Error(signUpError.message);

            // Create membership from invitation
            const { error: memberError } = await adminClient.from('memberships').insert({
                account_id: invitation.account_id,
                user_id: userData.user.id,
                role: invitation.role,
            });

            if (memberError) throw new Error(memberError.message);

            // Delete invitation
            await adminClient.from('invitations').delete().eq('id', credentials.invitationId);
        } else {
            // Regular signup
            const { error: signUpError } = await userClient.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: {
                    data: {
                        role: credentials.role,
                    }
                }
            });

            if (signUpError) throw new Error(signUpError.message);
        }

        // Establish session
        const { error: signInError } = await userClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (signInError) {
            // It's possible the user needs to confirm their email first if confirm_email is on
            // but for now we try to sign in.
            console.log('SignIn error after signup (expected if email confirmation is required):', signInError.message);
        }

        return { success: true };
    },
    { auth: false }
);
