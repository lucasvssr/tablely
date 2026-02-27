
/**
 * Migration: User Reservation RLS
 * Allows authenticated users (clients) to read their own reservations.
 */

-- 1. Policy to allow authenticated users to read reservations where they are the owner
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reservations_read_own') THEN
        CREATE POLICY reservations_read_own ON public.reservations 
            FOR SELECT TO authenticated 
            USING (auth.uid() = user_id OR client_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
    END IF;
END $$;

-- 2. Ensure clients can also see the accounts/restaurants they have booked at
-- (Already handled by restaurants_read_public but good to keep in mind)
