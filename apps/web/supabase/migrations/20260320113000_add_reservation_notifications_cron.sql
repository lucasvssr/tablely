-- Migration to add a cron job for automatically managing reservation notifications in the queue.

-- 1. Create or replace the sync function with just-in-time logic
CREATE OR REPLACE FUNCTION public.sync_reservation_notifications()
RETURNS void AS $$
BEGIN
  -- A. Add missing confirmation entries for upcoming reservations (avoiding historical data)
  -- This catches any reservations that missed the trigger.
  INSERT INTO public.notification_queue (reference_id, recipient_email, type, scheduled_for)
  SELECT 
    r.id, 
    COALESCE(r.client_email, p.email), 
    'confirmation', 
    r.created_at
  FROM public.reservations r
  LEFT JOIN public.profiles p ON r.user_id = p.id
  WHERE r.status != 'cancelled'
    -- Only for upcoming reservations or created in the last 2 hours
    AND ((r.date + r.start_time) > now() OR r.created_at > (now() - interval '2 hours'))
    AND NOT EXISTS (
      SELECT 1 FROM public.notification_queue n 
      WHERE n.reference_id = r.id AND n.type = 'confirmation'
    );

  -- B. JUST-IN-TIME : Add 24h reminder entries ONLY when we are within the 24h window
  -- This replaces the pre-generation logic.
  INSERT INTO public.notification_queue (reference_id, recipient_email, type, scheduled_for)
  SELECT 
    r.id, 
    COALESCE(r.client_email, p.email), 
    'reminder_24h', 
    now() -- Send immediately as it's time
  FROM public.reservations r
  LEFT JOIN public.profiles p ON r.user_id = p.id
  WHERE r.status != 'cancelled'
    -- Critère : La réservation commence dans moins de 24h mais est toujours dans le futur
    AND (r.date + r.start_time) <= (now() + interval '24 hours')
    AND (r.date + r.start_time) > now()
    -- Critère : Aucun rappel n'a déjà été généré pour cette réservation
    AND NOT EXISTS (
      SELECT 1 FROM public.notification_queue n 
      WHERE n.reference_id = r.id AND n.type = 'reminder_24h'
    );

  -- C. Cancel pending notifications for reservations that were cancelled
  UPDATE public.notification_queue n
  SET status = 'cancelled'
  FROM public.reservations r
  WHERE n.reference_id = r.id
    AND r.status = 'cancelled'
    AND n.status = 'pending';

  -- D. CLEANUP: Delete old processed notifications (older than 30 days)
  -- Keeps the table size under control.
  DELETE FROM public.notification_queue
  WHERE (status = 'sent' OR status = 'cancelled' OR status = 'error')
    AND created_at < (now() - interval '30 days');

END;
$$ LANGUAGE plpgsql;


-- 2. Schedule the cron job via pg_cron
DO $$
BEGIN
  PERFORM cron.unschedule('sync-reservation-notifications');
EXCEPTION WHEN OTHERS THEN
END $$;

SELECT cron.schedule(
  'sync-reservation-notifications', 
  '0 * * * *', 
  'SELECT public.sync_reservation_notifications()'
);
