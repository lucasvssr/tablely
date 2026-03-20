-- Migration to update the notification trigger to handle reservation updates
-- We removed the automatic creation of 'reminder_24h' here because it's now handled just-in-time by the cron.

CREATE OR REPLACE FUNCTION public.manage_reservation_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- 1. HANDLE INSERT (New Reservation)
  IF (TG_OP = 'INSERT') THEN
    -- Confirmation immediate
    INSERT INTO public.notification_queue (reference_id, recipient_email, type, scheduled_for)
    VALUES (NEW.id, NEW.client_email, 'confirmation', now());
    
    -- No reminder_24h here anymore. The cron handles it.
  END IF;

  -- 2. HANDLE UPDATE (Modified Reservation)
  IF (TG_OP = 'UPDATE') THEN
    
    -- Case A: Status changed to 'cancelled'
    IF (NEW.status = 'cancelled' AND OLD.status != 'cancelled') THEN
      UPDATE public.notification_queue 
      SET status = 'cancelled' 
      WHERE reference_id = NEW.id AND status = 'pending';
    END IF;

    -- Case B: Client Email changed
    IF (NEW.client_email != OLD.client_email) THEN
      UPDATE public.notification_queue 
      SET recipient_email = NEW.client_email
      WHERE reference_id = NEW.id 
        AND status = 'pending';
    END IF;

  END IF;

  RETURN NEW;
END;
$function$;
