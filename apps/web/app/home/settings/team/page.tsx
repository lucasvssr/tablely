import { PageBody, PageHeader } from '@kit/ui/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '~/lib/database.types';
import { MembersList } from './_components/members-list';
import { InvitationsList } from './_components/invitations-list';
import { InviteMemberForm } from './_components/invite-member-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { getTeamMembersAction, getInvitationsAction } from '~/lib/server/restaurant/team-actions';
import { getActiveMembership, getUserRoleAction } from '~/lib/server/restaurant/restaurant-actions';

export async function generateMetadata() {
    const i18n = await createI18nServerInstance();
    return {
        title: i18n.t('teams:members.pageTitle'),
    };
}

export default async function TeamSettingsPage() {
    const user = await requireUserInServerComponent();
    const supabase = getSupabaseServerClient<Database>();
    const i18n = await createI18nServerInstance();

    const [role, activeMembership] = await Promise.all([
        getUserRoleAction({}),
        getActiveMembership(supabase, user.id)
    ]);

    const accountId = activeMembership?.account_id || null;
    const isAdmin = role === 'owner' || role === 'admin';

    // Prefetching data on server for better performance and SEO
    const members = accountId ? await getTeamMembersAction({ accountId }) : [];
    const invitations = accountId ? await getInvitationsAction({ accountId }) : [];

    return (
        <>
            <PageHeader
                title={i18n.t('teams:members.pageTitle')}
                description={i18n.t('teams:members.pageDescription')}
                displaySidebarTrigger={false}
            />

            <PageBody>
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1">
                        <Tabs defaultValue="members" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="members">{i18n.t('teams:membersTabLabel')}</TabsTrigger>
                                <TabsTrigger value="invitations">{i18n.t('teams:invitationsTabLabel')}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="members">
                                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/30">
                                    <CardHeader>
                                        <CardTitle>{i18n.t('teams:membersTabLabel')}</CardTitle>
                                        <CardDescription>{i18n.t('teams:members.pageDescription')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {accountId ? (
                                            <MembersList initialMembers={members} isAdmin={isAdmin} />
                                        ) : (
                                            <div className="p-4 text-center text-muted-foreground">{i18n.t('teams:noData')}</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="invitations">
                                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/30">
                                    <CardHeader>
                                        <CardTitle>{i18n.t('teams:invitationsTabLabel')}</CardTitle>
                                        <CardDescription>{i18n.t('teams:inviteMemberDescription')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {accountId ? (
                                            <InvitationsList initialInvitations={invitations} isAdmin={isAdmin} />
                                        ) : (
                                            <div className="p-4 text-center text-muted-foreground">{i18n.t('teams:noData')}</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {isAdmin && (
                        <div className="w-full lg:w-96">
                            <Card className="sticky top-4 overflow-hidden border-primary/10 shadow-lg">
                                <div className="h-1.5 w-full bg-brand-copper" />
                                <CardHeader>
                                    <CardTitle>{i18n.t('teams:inviteMember')}</CardTitle>
                                    <CardDescription>{i18n.t('teams:inviteMemberDescription')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <InviteMemberForm />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </PageBody>
        </>
    );
}
