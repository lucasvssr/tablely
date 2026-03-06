/*
 * -------------------------------------------------------
 * Migration: Fix client reservation RLS policies
 * 
 * Problems fixed:
 * 1. The `reservations_read_public` policy was too permissive (allows anon to read ALL reservations).
 * 2. The `reservations_read_own` policy was created conditionally but may not have been applied.
 * 3. Add proper policies so authenticated clients can read their own reservations.
 * -------------------------------------------------------
 */

-- Drop the overly permissive anon read policy
DROP POLICY IF EXISTS reservations_read_public ON public.reservations;

-- Drop old client policy to recreate cleanly
DROP POLICY IF EXISTS reservations_read_own ON public.reservations;

-- 1. Allow anon to insert reservations only (no read)
-- (reservations_insert_public already handles this)

-- 2. Allow authenticated users (clients) to SELECT their own reservations
--    Matching by user_id (for logged-in bookings)
--    OR by client_email matching their auth email (for pre-login bookings)
CREATE POLICY reservations_read_own ON public.reservations
    FOR SELECT
    TO authenticated
    USING (
        -- Reservations booked while logged in
        auth.uid() = user_id
        OR
        -- Reservations booked with email before account creation
        client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR
        -- Restaurant staff can read their own restaurant's reservations
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE memberships.account_id = reservations.account_id
            AND memberships.user_id = auth.uid()
        )
    );

-- 3. Keep insert open for anon/authenticated (for public booking flow)
-- reservations_insert_public already handles this, but ensure it exists:
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reservations_insert_public' AND tablename = 'reservations') THEN
        CREATE POLICY reservations_insert_public ON public.reservations
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
    END IF;
END $$;
