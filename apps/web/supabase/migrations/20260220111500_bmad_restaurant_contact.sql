/*
 * -------------------------------------------------------
 * Section: Restaurant Contact Details
 * This migration adds contact information to the restaurants table.
 * -------------------------------------------------------
 */

alter table public.restaurants add column if not exists phone varchar(20);
