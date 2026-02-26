
/**
 * Migration: Public Booking Access
 * This migration ensures that unauthenticated users can view restaurant details,
 * check available time slots, and create reservations.
 */

-- 1. Grant execute on the availability function to public
GRANT EXECUTE ON FUNCTION public.get_available_slots(uuid, date, integer) TO anon, authenticated;

-- 2. Grant SELECT on necessary tables for booking discovery
GRANT SELECT ON public.accounts TO anon, authenticated;
GRANT SELECT ON public.restaurants TO anon, authenticated;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT SELECT ON public.service_operating_days TO anon, authenticated;
GRANT SELECT ON public.dining_tables TO anon, authenticated;

-- 3. Update/Add RLS policies for public read access
-- We use "slug is not null" to distinguish restaurant accounts from personal accounts

-- Accounts: Allow anyone to read restaurant accounts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'accounts_read_public') THEN
        CREATE POLICY accounts_read_public ON public.accounts 
            FOR SELECT TO anon, authenticated 
            USING (slug IS NOT NULL);
    END IF;
END $$;

-- Restaurants: Allow anyone to read restaurant details
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'restaurants_read_public') THEN
        CREATE POLICY restaurants_read_public ON public.restaurants 
            FOR SELECT TO anon, authenticated 
            USING (true);
    END IF;
END $$;

-- Services: Allow anyone to read service times
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'services_read_public') THEN
        CREATE POLICY services_read_public ON public.services 
            FOR SELECT TO anon, authenticated 
            USING (true);
    END IF;
END $$;

-- Operating Days: Allow anyone to read when services are active
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_operating_days_read_public') THEN
        CREATE POLICY service_operating_days_read_public ON public.service_operating_days 
            FOR SELECT TO anon, authenticated 
            USING (true);
    END IF;
END $$;

-- Dining Tables: Allow anyone to read table info for capacity checks
-- In security definer functions, this is often bypassed, but the server action may need it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dining_tables_read_public') THEN
        CREATE POLICY dining_tables_read_public ON public.dining_tables 
            FOR SELECT TO anon, authenticated 
            USING (true);
    END IF;
END $$;

-- 4. Set RLS policy for public reservation insertion
-- We allow anyone to insert a reservation (public access)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reservations_insert_public') THEN
        CREATE POLICY reservations_insert_public ON public.reservations 
            FOR INSERT TO anon, authenticated 
            WITH CHECK (true);
    END IF;
END $$;

