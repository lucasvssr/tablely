-- Add user_id to reservations to link bookings to users
alter table public.reservations 
add column if not exists user_id uuid references auth.users(id) on delete set null;

comment on column public.reservations.user_id is 'Optional link to the user account if they were logged in during booking';
