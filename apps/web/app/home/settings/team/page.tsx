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
import { getUserRoleAction } from '~/lib/server/restaurant/restaurant-actions';

export default async function TeamSettingsPage() {
    const user = await requireUserInServerComponent();
    const supabase = getSupabaseServerClient<Database>();
    const i18n = await createI18nServerInstance();
    const t = i18n.getFixedT(null, 'teams');

    const [role, { data: membership }] = await Promise.all([
        getUserRoleAction({}),
        supabase
            .from('memberships')
            .select('account_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()
    ]);

    const accountId = membership?.account_id || null;
    const isAdmin = role === 'owner' || role === 'admin';

    // Prefetching data on server for better performance and SEO
    const members = accountId ? await getTeamMembersAction({ accountId }) : [];
    const invitations = accountId ? await getInvitationsAction({ accountId }) : [];

    return (
        <>
            <PageHeader
                title={t('members.pageTitle')}
                description={t('members.pageDescription')}
            />

            <PageBody>
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1">
                        <Tabs defaultValue="members" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="members">{t('membersTabLabel')}</TabsTrigger>
                                <TabsTrigger value="invitations">{t('invitationsTabLabel')}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="members">
                                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/30">
                                    <CardHeader>
                                        <CardTitle>{t('membersTabLabel')}</CardTitle>
                                        <CardDescription>{t('pageDescription')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {accountId ? (
                                            <MembersList initialMembers={members} isAdmin={isAdmin} />
                                        ) : (
                                            <div className="p-4 text-center text-muted-foreground">{t('noData')}</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="invitations">
                                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/30">
                                    <CardHeader>
                                        <CardTitle>{t('invitationsTabLabel')}</CardTitle>
                                        <CardDescription>{t('inviteMemberDescription')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {accountId ? (
                                            <InvitationsList initialInvitations={invitations} isAdmin={isAdmin} />
                                        ) : (
                                            <div className="p-4 text-center text-muted-foreground">{t('noData')}</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {isAdmin && (
                        <div className="w-full lg:w-96">
                            <Card className="sticky top-4 overflow-hidden border-primary/10 shadow-lg">
                                <div className="h-1.5 w-full bg-blue-500" />
                                <CardHeader>
                                    <CardTitle>{t('inviteMember')}</CardTitle>
                                    <CardDescription>{t('inviteMemberDescription')}</CardDescription>
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
