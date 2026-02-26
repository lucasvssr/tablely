import type { Factor } from '@supabase/supabase-js';

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';
import { useFactorsMutationKey } from './use-user-factors-mutation-key';

type MfaFactorsData = {
  all: Factor[];
  totp: Factor[];
  phone: Factor[];
  webauthn: Factor[];
};

/**
 * @name useFetchAuthFactors
 * @description Use Supabase to fetch the MFA factors for a user in a React component.
 * Pass `initialData` from a server component to avoid a client-side network call.
 * @param userId
 * @param initialData
 */
export function useFetchAuthFactors(
  userId: string,
  initialData?: MfaFactorsData | null,
) {
  const client = useSupabase();
  const queryKey = useFactorsMutationKey(userId);

  const queryFn = async () => {
    const { data, error } = await client.auth.mfa.listFactors();

    if (error) {
      throw error;
    }

    return data;
  };

  return useQuery({
    queryKey,
    queryFn,
    // If initialData is provided from the server, disable the query entirely
    // to avoid a client-side network call to /auth/v1/user
    enabled: !initialData,
    initialData: initialData ?? undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

