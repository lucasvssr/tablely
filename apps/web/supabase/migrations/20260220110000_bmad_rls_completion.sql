/*
 * -------------------------------------------------------
 * Section: RLS Completion for Team Management
 * This migration ensures all roles have correct permissions.
 * -------------------------------------------------------
 */

-- Update policies for organizations
create policy organizations_update on public.organizations
    for update
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = organizations.id
            and memberships.user_id = auth.uid()
            and memberships.role in ('owner', 'admin')
        )
    );

-- Complete policies for restaurants
create policy restaurants_update on public.restaurants
    for update
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = restaurants.organization_id
            and memberships.user_id = auth.uid()
            and memberships.role in ('owner', 'admin')
        )
    );

create policy restaurants_delete on public.restaurants
    for delete
    to authenticated
    using (
        exists (
            select 1 from public.memberships
            where memberships.organization_id = restaurants.organization_id
            and memberships.user_id = auth.uid()
            and memberships.role in ('owner') -- Only owner can delete restaurant
        )
    );
