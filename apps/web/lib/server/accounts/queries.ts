import { cache } from 'react';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '@kit/supabase/database';

/**
 * @name getPersonalAccount
 * @description Get the personal account for the given user ID.
 * This is cached so it can be called multiple times in the same request.
 */
export const getPersonalAccount = cache(async (userId: string) => {
    const supabase = getSupabaseServerClient<Database>();

    const { data, error } = await supabase
        .from('profiles')
        .select('id, name:display_name, picture_url:avatar_url, role')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
});

/**
 * @name getMfaFactors
 * @description Get the MFA factors for the current user, server-side.
 * This avoids a client-side network call to /auth/v1/user.
 * Cached per request.
 */
export const getMfaFactors = cache(async () => {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return { all: [], totp: [], phone: [], webauthn: [] };
    }

    const factors = data.user.factors ?? [];

    const result = {
        all: factors,
        totp: factors.filter((f) => f.factor_type === 'totp' && f.status === 'verified'),
        phone: factors.filter((f) => f.factor_type === 'phone' && f.status === 'verified'),
        webauthn: factors.filter((f) => f.factor_type === 'webauthn' && f.status === 'verified'),
    };

    return result;
});

