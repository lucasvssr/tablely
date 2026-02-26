import { use } from 'react';
import { notFound, redirect } from 'next/navigation';
import { PageBody } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Database } from '~/lib/database.types';
import { JoinInvitationContainer } from './_components/join-invitation-container';

interface JoinPageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Rejoindre l\'équipe | Tablely',
};

export default function JoinPage(props: JoinPageProps) {
    const params = use(props.params);
    const invitationId = params.id;

    if (!invitationId) {
        return notFound();
    }

    const supabase = getSupabaseServerClient<Database>();
    const adminClient = getSupabaseServerAdminClient<Database>();

    // 1. Get invitation
    const { data: invitation } = use(adminClient
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single());

    // 2. Check if user is logged in
    const { data: { user } } = use(supabase.auth.getUser());

    if (!user) {
        if (!invitation) return notFound();

        // Redirect to sign-up with invitation context
        const next = encodeURIComponent(`/join/${invitationId}`);
        redirect(`/auth/sign-up?next=${next}&email=${encodeURIComponent(invitation.email)}&invitationId=${invitationId}`);
    }

    // 3. User is logged in, check if they are already a member
    if (invitation) {
        const { data: existingMember } = use(supabase
            .from('memberships')
            .select('id')
            .eq('account_id', invitation.account_id)
            .eq('user_id', user.id)
            .maybeSingle());

        if (existingMember) {
            // Already a member, redirect to home
            redirect('/home');
        }
    } else {
        // Invitation not found, BUT maybe they just accepted it?
        // Let's check memberships for ANY organization they might have joined lately
        const { data: anyMember } = use(supabase
            .from('memberships')
            .select('account_id')
            .eq('user_id', user.id)
            .limit(1));

        if (anyMember && anyMember.length > 0) {
            redirect('/home');
        }

        return notFound();
    }

    return (
        <PageBody>
            <div className="flex items-center justify-center min-h-[70vh]">
                <JoinInvitationContainer invitationId={invitationId} />
            </div>
        </PageBody>
    );
}
