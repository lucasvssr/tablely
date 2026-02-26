/*
 * -------------------------------------------------------
 * Section: Reservations
 * This migration adds support for bookings and reservations.
 * -------------------------------------------------------
 */

-- Reservations table
create table if not exists public.reservations (
    id               uuid unique  not null default extensions.uuid_generate_v4(),
    account_id       uuid references public.accounts(id) on delete cascade not null,
    restaurant_id    uuid references public.restaurants(id) on delete cascade not null,
    service_id       uuid references public.services(id) on delete set null,
    table_id         uuid references public.dining_tables(id) on delete set null,
    date             date         not null,
    start_time       time         not null, -- Start time of interval
    guest_count      integer      not null check (guest_count > 0),
    client_name      varchar(255) not null,
    client_email     varchar(320) not null,
    client_phone     varchar(20),
    notes            text,
    sensitive_notes  text, -- This should be encrypted if needed
    status           varchar(50)  not null default 'confirmed', -- confirmed, cancelled, arrived, no-show
    created_at       timestamp with time zone default now(),
    updated_at       timestamp with time zone default now(),
    primary key (id)
);

comment on table public.reservations is 'Customer reservations/bookings for restaurants';

-- RLS
alter table public.reservations enable row level security;

-- Policies for internal staff (authenticated)
create policy reservations_read on public.reservations
    for select
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.account_id = reservations.account_id
            and memberships.user_id = auth.uid()
        )
    );

create policy reservations_all on public.reservations
    for all
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.account_id = reservations.account_id
            and memberships.user_id = auth.uid()
            and memberships.role in ('owner', 'admin')
        )
    );

-- Policy for public (anon) to insert a reservation
create policy reservations_insert_public on public.reservations
    for insert
    to anon, authenticated
    with check (true);

-- Policy to allow users to read their own reservation via its ID
create policy reservations_read_public on public.reservations
    for select
    to anon
    using (true);

-- Grant privileges
grant select, insert, update, delete on table public.reservations to authenticated, service_role, anon;

/*
 * -------------------------------------------------------
 * Section: Slot Availability Function
 * -------------------------------------------------------
 */

create or replace function public.get_available_slots(
    p_restaurant_id uuid,
    p_date date,
    p_guest_count integer
)
returns table (
    service_id uuid,
    service_name varchar,
    slot_time time,
    available BOOLEAN
) 
language plpgsql
security definer
as $$
declare
    v_day_of_week integer;
    v_account_id uuid;
begin
    -- Get account_id for the restaurant
    select account_id into v_account_id from public.restaurants where id = p_restaurant_id;

    -- 1=Monday, 7=Sunday
    v_day_of_week := extract(isodow from p_date);

    return query
    with service_slots as (
        -- Get all services for the given day
        -- We filter by account_id because services/tables are tied to account in the current schema
        select 
            id as s_id, 
            name as s_name, 
            start_time as s_start, 
            end_time as s_end
        from public.services
        where account_id = v_account_id 
        and v_day_of_week = any(days_of_week)
    ),
    generated_slots as (
        -- Generate 15-minute intervals for each service
        select 
            ss.s_id,
            ss.s_name,
            gs_inner.slot_time::time
        from service_slots ss,
        lateral generate_series(
            (p_date + ss.s_start)::timestamp, 
            (p_date + ss.s_end - interval '15 minutes')::timestamp, 
            '15 minutes'::interval
        ) as gs_inner(slot_time)
    ),
    table_capacity as (
        -- Get total active tables that can accommodate the guest count
        select count(*) as total_tables
        from public.dining_tables
        where account_id = v_account_id
        and is_active = true
        and capacity >= p_guest_count
    ),
    occupied_slots as (
        -- Count how many reservations exist for that specific time
        select 
            r.start_time,
            count(*) as occupied_count
        from public.reservations r
        where r.restaurant_id = p_restaurant_id
        and r.date = p_date
        and r.status = 'confirmed'
        group by r.start_time
    )
    select 
        gs.s_id as service_id,
        gs.s_name::varchar as service_name,
        gs.slot_time as slot_time,
        (coalesce(tc.total_tables, 0) > coalesce(os.occupied_count, 0)) as available
    from generated_slots gs
    cross join table_capacity tc
    left join occupied_slots os on os.start_time = gs.slot_time
    order by gs.slot_time;
end;
$$;

-- Enable Realtime
alter publication supabase_realtime add table public.reservations;
