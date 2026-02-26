'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Database } from '@kit/supabase/database';
import { enhanceAction } from '@kit/next/actions';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

const InviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'member']),
});

async function getUserAccount(supabase: SupabaseClient<any>, userId: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data: memberships, error } = await supabase
        .from('memberships')
        .select('account_id')
        .eq('user_id', userId);

    if (error || !memberships || memberships.length === 0) {
        return null;
    }

    return memberships[0]!.account_id;
}

/**
 * @name inviteMemberAction
 */
export const inviteMemberAction = enhanceAction(
    async (formData: FormData) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);

        const result = InviteSchema.safeParse(Object.fromEntries(formData.entries()));
        if (!result.success) throw new Error('Données d\'invitation invalides');

        const { email, role } = result.data;

        const { error } = await supabase.from('invitations').insert({
            account_id: accountId,
            email: email.toLowerCase(),
            role,
            invited_by: user.id,
        });

        if (error) {
            if (error.code === '23505') throw new Error('Une invitation est déjà en cours pour cet email');
            throw new Error(error.message);
        }
    },
    { auth: true }
);

/**
 * @name deleteInvitationAction
 */
export const deleteInvitationAction = enhanceAction(
    async ({ id }: { id: string }) => {
        const supabase = getSupabaseServerClient<Database>();

        const { error } = await supabase
            .from('invitations')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    },
    { auth: true }
);

/**
 * @name removeMemberAction
 */
export const removeMemberAction = enhanceAction(
    async ({ userId, accountId }: { userId: string, accountId: string }) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        // Cannot remove oneself
        if (userId === user.id) throw new Error('Vous ne pouvez pas vous retirer vous-même');

        const { error } = await supabase
            .from('memberships')
            .delete()
            .eq('user_id', userId)
            .eq('account_id', accountId);

        if (error) throw new Error(error.message);
    },
    { auth: true }
);

/**
 * @name acceptInvitationAction
 */
export const acceptInvitationAction = enhanceAction(
    async ({ invitationId }: { invitationId: string }) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        // 1. Get invitation
        const { data: invitation, error: fetchError } = await supabase
            .from('invitations')
            .select('*')
            .eq('id', invitationId)
            .single();

        if (fetchError || !invitation) throw new Error('Invitation non trouvée ou expirée');

        if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
            throw new Error(`Cette invitation ne vous est pas destinée.`);
        }

        // 2. Create membership
        const { error: memberError } = await supabase.from('memberships').insert({
            account_id: invitation.account_id,
            user_id: user.id,
            role: invitation.role,
        });

        if (memberError) throw new Error(memberError.message);

        // 3. Delete invitation
        await supabase.from('invitations').delete().eq('id', invitationId);

        return { accountId: invitation.account_id };
    },
    { auth: true }
);

/**
 * @name getTeamMembersAction
 */
export const getTeamMembersAction = enhanceAction(
    async ({ accountId }: { accountId: string }) => {
        await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        const { data, error } = await supabase
            .from('memberships')
            .select(`
                id,
                role,
                user_id,
                account_id,
                profiles(
                    display_name,
                    email,
                    avatar_url
                )
            `)
            .eq('account_id', accountId);

        if (error) throw new Error(error.message);
        return data;
    },
    { auth: true }
);

/**
 * @name getInvitationsAction
 */
export const getInvitationsAction = enhanceAction(
    async ({ accountId }: { accountId: string }) => {
        await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    },
    { auth: true }
);

/**
 * @name signUpViaInvitationAction
 */
export const signUpViaInvitationAction = enhanceAction(
    async (credentials: { email: string; password: string; invitationId: string }) => {
        const adminClient = getSupabaseServerAdminClient<Database>();

        // 1. Get invitation
        const { data: invitation, error: fetchError } = await adminClient
            .from('invitations')
            .select('*')
            .eq('id', credentials.invitationId)
            .single();

        if (fetchError || !invitation) throw new Error('Invitation non trouvée ou expirée');

        if (invitation.email.toLowerCase() !== credentials.email.toLowerCase()) {
            throw new Error(`L'email ne correspond pas à l'invitation.`);
        }

        // 2. Create user with admin client (automatically confirmed)
        const { data: userData, error: signUpError } = await adminClient.auth.admin.createUser({
            email: credentials.email,
            password: credentials.password,
            email_confirm: true,
        });

        if (signUpError) throw new Error(signUpError.message);

        const userId = userData.user.id;

        // 3. Create membership
        const { error: memberError } = await adminClient.from('memberships').insert({
            account_id: invitation.account_id,
            user_id: userId,
            role: invitation.role,
        });

        if (memberError) throw new Error(memberError.message);

        // 4. Delete invitation
        await adminClient.from('invitations').delete().eq('id', credentials.invitationId);

        // 5. Sign in the user to establish the session
        const userClient = getSupabaseServerClient<Database>();
        const { error: signInError } = await userClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (signInError) throw new Error(signInError.message);

        return { success: true };
    },
    { auth: false }
);
