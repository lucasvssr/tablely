import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { Database } from '../database.types';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

/**
 * @name getSupabaseServerStaticClient
 * @description Get a Supabase client for use in the Server without cookies.
 * Useful for caching public data with unstable_cache.
 */
export function getSupabaseServerStaticClient<GenericSchema = Database>() {
  const keys = getSupabaseClientKeys();

  return createClient<GenericSchema>(keys.url, keys.anonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
  });
}
