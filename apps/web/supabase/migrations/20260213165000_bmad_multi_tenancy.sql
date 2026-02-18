/*
 * -------------------------------------------------------
 * Section: Bmad Multi-Tenancy & Restaurants
 * This migration adds support for organizations and restaurants.
 * -------------------------------------------------------
 */

-- Organizations table: Each restaurant is an organization
create table if not exists
    public.organizations
(
    id          uuid unique  not null default extensions.uuid_generate_v4(),
    name        varchar(255) not null,
    created_at  timestamp with time zone default now(),
    updated_at  timestamp with time zone default now(),
    created_by  uuid references auth.users,
    primary key (id)
);

comment on table public.organizations is 'Organizations are the tenants in Bmad (e.g. a Restaurant group or single Restaurant)';

-- Memberships table: Links users to organizations
create table if not exists
    public.memberships
(
    id               uuid unique  not null default extensions.uuid_generate_v4(),
    organization_id  uuid references public.organizations(id) on delete cascade not null,
    user_id          uuid references auth.users(id) on delete cascade not null,
    role             varchar(50)  not null default 'member', -- owner, admin, member
    created_at       timestamp with time zone default now(),
    primary key (id),
    unique(organization_id, user_id)
);

comment on table public.memberships is 'Roles and permissions for users within organizations';

-- Restaurants table: Specific data for a restaurant
create table if not exists
    public.restaurants
(
    id               uuid unique  not null default extensions.uuid_generate_v4(),
    organization_id  uuid references public.organizations(id) on delete cascade not null,
    name             varchar(255) not null,
    location         text         not null,
    total_capacity   integer      not null default 0,
    created_at       timestamp with time zone default now(),
    updated_at       timestamp with time zone default now(),
    primary key (id)
);

comment on table public.restaurants is 'Transactional data and settings for a specific restaurant establishment';

-- RLS
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.restaurants enable row level security;

-- Policies for organizations
create policy organizations_read on public.organizations
    for select
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = organizations.id
            and memberships.user_id = auth.uid()
        )
    );

-- Policies for memberships
create policy memberships_read on public.memberships
    for select
    to authenticated
    using (
        user_id = auth.uid()
    );

-- Policies for restaurants
create policy restaurants_read on public.restaurants
    for select
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = restaurants.organization_id
            and memberships.user_id = auth.uid()
        )
    );

-- We allow insertion by authenticated users who are creating their first organization
-- In a real SaaS, this would be more restricted, but for the onboarding wizard:
create policy restaurants_insert on public.restaurants
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = restaurants.organization_id
            and memberships.user_id = auth.uid()
            and memberships.role in ('owner', 'admin')
        )
    );

-- Grant privileges
grant select, insert, update, delete on table public.organizations to authenticated, service_role;
grant select, insert, update, delete on table public.memberships to authenticated, service_role;
grant select, insert, update, delete on table public.restaurants to authenticated, service_role;
