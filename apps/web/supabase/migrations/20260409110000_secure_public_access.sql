
-- 1. Create a secure public view for restaurant information
-- This view only exposes safe fields, hiding emails and audit columns.
CREATE OR REPLACE VIEW public.restaurant_profiles AS
SELECT 
    r.id,
    r.name,
    r.slug,
    r.location,
    r.phone,
    r.lat,
    r.lng,
    a.id as account_id,
    a.name as organization_name,
    a.slug as organization_slug
FROM public.restaurants r
JOIN public.accounts a ON r.account_id = a.id
WHERE a.slug IS NOT NULL;

-- 2. Grant permissions on the view
GRANT SELECT ON public.restaurant_profiles TO anon, authenticated;

-- 3. Cleanup overly permissive policies on base tables
-- We remove the policies that allow broad access to all columns
DROP POLICY IF EXISTS accounts_read_public ON public.accounts;
DROP POLICY IF EXISTS restaurants_read_public ON public.restaurants;

-- 4. Re-add more restrictive policies if necessary for internal logic
-- For example, allowing users to still read their own accounts via existing policies
-- (which are already defined in schema.sql: accounts_read)

-- 5. Restrict reservation insertion to authenticated users only
-- Since the application logic (server actions) requires authentication,
-- the database should reflect this to prevent anonymous bypass.
DROP POLICY IF EXISTS reservations_insert_public ON public.reservations;
CREATE POLICY reservations_insert_authenticated ON public.reservations 
    FOR INSERT TO authenticated 
    WITH CHECK (true);

-- 6. Allow owners to update their own reservations
-- This allows us to use the standard client instead of the Admin client.
CREATE POLICY reservations_owner_update ON public.reservations
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid() 
        OR 
        client_email = (auth.jwt() ->> 'email'::text)
    )
    WITH CHECK (true);


