/*
 * -------------------------------------------------------
 * Section: Services & Tables Management
 * This migration adds support for restaurant services and table management.
 * -------------------------------------------------------
 */

-- Services table: Lunch, Dinner, etc.
create table if not exists
    public.services
(
    id               uuid unique  not null default extensions.uuid_generate_v4(),
    organization_id  uuid references public.organizations(id) on delete cascade not null,
    name             varchar(100) not null, -- e.g. 'Midi', 'Soir'
    start_time       time         not null,
    end_time         time         not null,
    days_of_week     integer[]    not null default '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    created_at       timestamp with time zone default now(),
    updated_at       timestamp with time zone default now(),
    primary key (id)
);

comment on table public.services is 'Defines the service periods for a restaurant';

-- Dining Tables table: Actual tables in the restaurant
create table if not exists
    public.dining_tables
(
    id               uuid unique  not null default extensions.uuid_generate_v4(),
    organization_id  uuid references public.organizations(id) on delete cascade not null,
    name             varchar(50)  not null, -- e.g. 'Table 1', 'Carré A1'
    capacity         integer      not null check (capacity > 0),
    is_active        boolean      not null default true,
    created_at       timestamp with time zone default now(),
    updated_at       timestamp with time zone default now(),
    primary key (id)
);

comment on table public.dining_tables is 'Physical tables available for reservations';

-- RLS
alter table public.services enable row level security;
alter table public.dining_tables enable row level security;

-- Policies for services
create policy services_read on public.services
    for select
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = services.organization_id
            and memberships.user_id = auth.uid()
        )
    );

create policy services_all on public.services
    for all
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = services.organization_id
            and memberships.user_id = auth.uid()
            and memberships.role in ('owner', 'admin')
        )
    );

-- Policies for dining_tables
create policy dining_tables_read on public.dining_tables
    for select
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = dining_tables.organization_id
            and memberships.user_id = auth.uid()
        )
    );

create policy dining_tables_all on public.dining_tables
    for all
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = dining_tables.organization_id
            and memberships.user_id = auth.uid()
            and memberships.role in ('owner', 'admin')
        )
    );

-- Grant privileges
grant select, insert, update, delete on table public.services to authenticated, service_role;
grant select, insert, update, delete on table public.dining_tables to authenticated, service_role;
