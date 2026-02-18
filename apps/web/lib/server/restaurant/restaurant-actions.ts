'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { enhanceAction } from '@kit/next/actions';
import { RestaurantSchema, ServiceSchema, TableSchema } from './restaurant.schema';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

async function getUserAccount(supabase: any, userId: string) {
    // Get all memberships for the user with their account type
    const { data: memberships, error } = await supabase
        .from('memberships')
        .select('account_id, accounts!inner(is_personal_account)')
        .eq('user_id', userId);

    if (error || !memberships || memberships.length === 0) {
        throw new Error('Organisation non trouvée');
    }

    // Prioritize non-personal accounts (the restaurant)
    const orgAccount = memberships.find((m: { accounts: { is_personal_account: any; }; }) => !m.accounts?.is_personal_account);

    if (orgAccount) {
        return orgAccount.account_id;
    }

    // Fallback to the first available account (likely personal)
    return memberships[0].account_id;
}

/**
 * @name upsertServiceAction
 */
export const upsertServiceAction = enhanceAction(
    async (formData: FormData) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        const rawData = Object.fromEntries(formData.entries());
        const validatedData = {
            ...rawData,
            days_of_week: typeof rawData.days_of_week === 'string'
                ? JSON.parse(rawData.days_of_week)
                : rawData.days_of_week,
        };

        const result = ServiceSchema.safeParse(validatedData);

        if (!result.success) throw new Error('Données du service invalides');

        const { id, ...data } = result.data;

        if (id) {
            const { error } = await supabase.from('services').update(data).eq('id', id).eq('account_id', accountId);
            if (error) throw new Error(error.message);
        } else {
            const { error } = await supabase.from('services').insert({ ...data, account_id: accountId });
            if (error) throw new Error(error.message);
        }
    },
    { auth: true }
);

/**
 * @name upsertTableAction
 */
export const upsertTableAction = enhanceAction(
    async (formData: FormData) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        const rawData = Object.fromEntries(formData.entries());
        const validatedData = {
            ...rawData,
            is_active: rawData.is_active === 'true',
        };

        const result = TableSchema.safeParse(validatedData);

        if (!result.success) throw new Error('Données de la table invalides');

        const { id, ...data } = result.data;

        if (id) {
            const { error } = await supabase.from('dining_tables').update(data).eq('id', id).eq('account_id', accountId);
            if (error) throw new Error(error.message);
        } else {
            const { error } = await supabase.from('dining_tables').insert({ ...data, account_id: accountId });
            if (error) throw new Error(error.message);
        }
    },
    { auth: true }
);

/**
 * @name createRestaurantAction
 * @description Action to create a new restaurant establishment and its associated organization.
 */
export const createRestaurantAction = enhanceAction(
    async (formData: FormData) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();

        const result = RestaurantSchema.safeParse(
            Object.fromEntries(formData.entries()),
        );

        if (!result.success) {
            throw new Error('Données du restaurant invalides');
        }

        const { name, location, total_capacity } = result.data;

        // 1. Create Account (was Organization)
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .insert({
                name: name,
                created_by: user.id,
            })
            .select('id')
            .single();

        if (accountError || !account) {
            throw new Error(`Erreur lors de la création de l'organisation: ${accountError?.message}`);
        }

        // 2. Create Membership (Owner)
        const { error: memberError } = await supabase
            .from('memberships')
            .insert({
                account_id: account.id,
                user_id: user.id,
                role: 'owner',
            });

        if (memberError) {
            throw new Error(`Erreur lors de la création de l'appartenance: ${memberError.message}`);
        }

        // 3. Create Restaurant
        const { error: restError } = await supabase
            .from('restaurants')
            .insert({
                account_id: account.id,
                name: name,
                location: location,
                total_capacity: total_capacity,
            });

        if (restError) {
            throw new Error(`Erreur lors de la création du restaurant: ${restError.message}`);
        }

        // Successfully created, redirect to home
        redirect('/home');
    },
    {
        auth: true,
    },
);

/**
 * @name deleteServiceAction
 */
export const deleteServiceAction = enhanceAction(
    async ({ id }: { id: string }) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)
            .eq('account_id', accountId);

        if (error) throw new Error(error.message);
    },
    { auth: true }
);

/**
 * @name deleteTableAction
 */
export const deleteTableAction = enhanceAction(
    async ({ id }: { id: string }) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        const { error } = await supabase
            .from('dining_tables')
            .delete()
            .eq('id', id)
            .eq('account_id', accountId);

        if (error) throw new Error(error.message);
    },
    { auth: true }
);
