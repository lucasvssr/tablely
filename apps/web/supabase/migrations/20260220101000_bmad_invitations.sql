/*
 * -------------------------------------------------------
 * Section: Invitations Management
 * This migration adds support for team invitations.
 * -------------------------------------------------------
 */

-- Invitations table
create table if not exists
    public.invitations
(
    id               uuid unique  not null default extensions.uuid_generate_v4(),
    account_id       uuid references public.organizations(id) on delete cascade not null,
    email            varchar(320) not null,
    role             varchar(50)  not null default 'member', -- admin, member
    invited_by       uuid references auth.users(id) on delete set null not null,
    created_at       timestamp with time zone default now(),
    primary key (id),
    unique(account_id, email)
);

comment on table public.invitations is 'Pending invitations for users to join organizations';

-- RLS
alter table public.invitations enable row level security;

-- Policies for invitations
create policy invitations_read on public.invitations
    for select
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = invitations.account_id
            and memberships.user_id = auth.uid()
        )
    );

create policy invitations_all on public.invitations
    for all
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = invitations.account_id
            and memberships.user_id = auth.uid()
            and memberships.role in ('owner', 'admin')
        )
    );

-- Grant privileges
grant select, insert, update, delete on table public.invitations to authenticated, service_role;
