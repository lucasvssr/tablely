'use server';

import { isAfter, subMinutes, addMinutes, parseISO } from 'date-fns';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { enhanceAction } from '@kit/next/actions';
import { RestaurantSchema, ServiceSchema, TableSchema, ReservationSchema, UpdateReservationSchema } from './restaurant.schema';
import { Database } from '@kit/supabase/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { encrypt, decrypt } from '~/lib/security/encryption';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUserAccount(supabase: SupabaseClient<any>, userId: string) {
    // Get all memberships for the user. Since accounts table now only contains
    // organizations (restaurants), any membership is a valid restaurant account.
    const { data: memberships, error } = await supabase
        .from('memberships')
        .select('account_id')
        .eq('user_id', userId);

    if (error || !memberships || memberships.length === 0) {
        return null;
    }

    // Return the first available account_id
    return memberships[0]!.account_id;
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

        const { id, days_of_week, ...data } = result.data;

        let serviceId = id;

        if (id) {
            const { error } = await supabase.from('services').update(data).eq('id', id).eq('account_id', accountId);
            if (error) throw new Error(error.message);
        } else {
            const { data: newService, error } = await supabase
                .from('services')
                .insert({ ...data, account_id: accountId })
                .select('id')
                .single();
            if (error) throw new Error(error.message);
            serviceId = newService.id;
        }

        // Update operating days
        if (serviceId) {
            // Delete old days
            await supabase.from('service_operating_days').delete().eq('service_id', serviceId);

            // Insert new days
            if (days_of_week && days_of_week.length > 0) {
                const dayEntries = days_of_week.map(day => ({
                    service_id: serviceId,
                    day_of_week: day
                }));
                const { error: dayError } = await supabase.from('service_operating_days').insert(dayEntries);
                if (dayError) throw new Error(dayError.message);
            }
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

        if (!accountId) {
            throw new Error('Aucun compte restaurant trouvé pour cet utilisateur');
        }

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
 * @name slugify
 */
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // remove accents
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-') // replace spaces with -
        .replace(/[^\w-]+/g, '') // remove all non-word chars
        .replace(/--+/g, '-') // replace multiple - with single -
        .replace(/^-+/, '') // trim - from start of text
        .replace(/-+$/, ''); // trim - from end of text
}

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

        const { name, location, phone } = result.data;
        const slug = slugify(name);

        // 1. Create Account (was Organization)
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .insert({
                name: name,
                slug: slug,
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
                phone: phone,
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
/**
 * @name updateRestaurantAction
 */
export const updateRestaurantAction = enhanceAction(
    async (formData: FormData) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        const result = RestaurantSchema.safeParse(
            Object.fromEntries(formData.entries()),
        );

        if (!result.success) {
            throw new Error('Données du restaurant invalides');
        }

        const { name, location, phone } = result.data;

        // 1. Update Account
        const { error: accountError } = await supabase
            .from('accounts')
            .update({ name })
            .eq('id', accountId);

        if (accountError) throw new Error(accountError.message);

        // 2. Update Restaurant
        const { error: restError } = await supabase
            .from('restaurants')
            .update({
                name,
                location,
                phone
            })
            .eq('account_id', accountId);

        if (restError) throw new Error(restError.message);

        // Fetch account to get slug for revalidation
        const { data: account } = await supabase
            .from('accounts')
            .select('slug')
            .eq('id', accountId)
            .single();

        revalidatePath('/home', 'layout');
        if (account?.slug) {
            revalidatePath(`/r/${account.slug}`);
        }
    },
    { auth: true }
);

/**
 * @name getServicesAction
 */
export const getServicesAction = enhanceAction(
    async (_: unknown) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        const { data, error } = await supabase
            .from('services')
            .select('*, service_operating_days(day_of_week)')
            .eq('account_id', accountId)
            .order('start_time', { ascending: true });

        if (error) throw new Error(error.message);

        // Transform days to the flat array format the frontend expects
        return (data || []).map(service => ({
            ...service,
            days_of_week: service.service_operating_days?.map((d: { day_of_week: number }) => d.day_of_week) || []
        }));
    },
    { auth: true }
);

/**
 * @name getTablesAction
 */
export const getTablesAction = enhanceAction(
    async (_: unknown) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        const { data, error } = await supabase
            .from('dining_tables')
            .select('*')
            .eq('account_id', accountId)
            .order('name', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },
    { auth: true }
);
/**
 * @name getDashboardStatsAction
 */
export const getDashboardStatsAction = enhanceAction(
    async (_: unknown) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        if (!accountId) {
            return {
                servicesCount: 0,
                tablesCount: 0,
                totalCapacity: 0
            };
        }

        const [
            { count: servicesCount },
            { count: tablesCount },
            { data: tablesData }
        ] = await Promise.all([
            supabase.from('services').select('*', { count: 'exact', head: true }).eq('account_id', accountId),
            supabase.from('dining_tables').select('*', { count: 'exact', head: true }).eq('account_id', accountId),
            supabase.from('dining_tables').select('capacity').eq('account_id', accountId).eq('is_active', true)
        ]);

        const totalCapacity = tablesData?.reduce((acc, table) => acc + (table.capacity || 0), 0) || 0;

        return {
            servicesCount: servicesCount || 0,
            tablesCount: tablesCount || 0,
            totalCapacity
        };
    },
    { auth: true }
);

/**
 * @name getAvailableSlotsAction
 */
export async function getAvailableSlotsAction({
    restaurantId,
    date,
    guestCount,
    userId,
    clientEmail
}: {
    restaurantId: string;
    date: string;
    guestCount: number;
    userId?: string | null;
    clientEmail?: string | null;
}) {
    const supabase = getSupabaseServerClient<Database>();

    const { data, error } = await (supabase.rpc as (...args: unknown[]) => ReturnType<typeof supabase.rpc>)('get_available_slots' as never, {
        p_restaurant_id: restaurantId,
        p_date: date,
        p_guest_count: guestCount,
        p_user_id: userId ?? null,
        p_client_email: clientEmail ?? null
    });

    if (error) {
        console.error('Error fetching available slots:', JSON.stringify(error, null, 2));
        throw new Error('Erreur lors de la récupération des créneaux');
    }

    return (data || []) as {
        available: boolean;
        service_id: string;
        service_name: string;
        slot_time: string;
    }[];
}

/**
 * @name createReservationAction
 * @description Creates a new reservation for a restaurant.
 */
export const createReservationAction = enhanceAction(
    async (payload) => {
        console.log('createReservationAction called with payload:', payload);
        const supabase = getSupabaseServerClient<Database>();

        // 1. Get account_id from restaurant
        const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('account_id, id')
            .eq('id', payload.restaurant_id)
            .single();

        console.log('Restaurant lookup result:', { restaurant, restaurantError });

        if (restaurantError || !restaurant) {
            throw new Error('Restaurant non trouvé');
        }

        const { data: { user } } = await supabase.auth.getUser();

        // 1b. Check if user already has a reservation for this service on this date
        const userQuery = supabase
            .from('reservations')
            .select('id')
            .eq('restaurant_id', payload.restaurant_id)
            .eq('date', payload.date)
            .eq('service_id', payload.service_id)
            .eq('status', 'confirmed');

        if (user?.id) {
            userQuery.or(`user_id.eq.${user.id},client_email.eq.${payload.client_email}`);
        } else {
            userQuery.eq('client_email', payload.client_email);
        }

        const { data: userExisting } = await userQuery;

        if (userExisting && userExisting.length > 0) {
            throw new Error('Vous avez déjà une réservation confirmée pour ce service ce jour-là');
        }

        // 2. Find an available table for this slot
        const { data: tables, error: tablesError } = await supabase
            .from('dining_tables')
            .select('id')
            .eq('account_id', restaurant.account_id)
            .eq('is_active', true)
            .gte('capacity', payload.guest_count)
            .order('capacity', { ascending: true });

        if (tablesError || !tables || tables.length === 0) {
            throw new Error('Aucune table disponible pour ce nombre de couverts');
        }

        // 3. Get the service details and existing reservations to check for overlaps
        const { data: service } = await supabase
            .from('services')
            .select('duration_minutes, buffer_minutes')
            .eq('id', payload.service_id)
            .single();

        const duration = payload.duration_minutes ?? (service as unknown as Record<string, number>)?.duration_minutes ?? 90;
        const buffer = (service as unknown as Record<string, number>)?.buffer_minutes ?? 15;

        const { data: existingReservations } = await supabase
            .from('reservations')
            .select(`
                table_id, 
                start_time, 
                duration_minutes,
                services (
                    duration_minutes,
                    buffer_minutes
                )
            `)
            .eq('restaurant_id', payload.restaurant_id)
            .eq('date', payload.date)
            .eq('status', 'confirmed');

        const timeToMin = (t: string | null | undefined) => {
            if (!t) return 0;
            const parts = t.split(':');
            const h = parseInt(parts[0] || '0', 10);
            const m = parseInt(parts[1] || '0', 10);
            return h * 60 + m;
        };

        const isOverlapping = (s1: number, e1: number, s2: number, e2: number) => {
            return s1 < e2 && s2 < e1;
        };

        const requestedStart = timeToMin(payload.start_time);
        const requestedEnd = requestedStart + duration;

        const occupiedIds = new Set();
        (existingReservations as unknown as Record<string, unknown>[] || []).forEach((r) => {
            const rStart = timeToMin(r.start_time as string);
            const rBaseDuration = (r.duration_minutes as number) ?? (r.services as Record<string, number>)?.duration_minutes ?? 90;
            const rBuffer = (r.services as Record<string, number>)?.buffer_minutes ?? 15;
            const rEnd = rStart + rBaseDuration;

            // Current requested slot overlaps with existing reservation PLUS its buffer
            // OR existing reservation overlaps with current requested slot PLUS its buffer
            // Simple logic: isOverlapping(reqStart, reqEnd + buffer, rStart, rEnd + rBuffer)
            if (isOverlapping(requestedStart, requestedEnd + buffer, rStart, rEnd + rBuffer)) {
                occupiedIds.add(r.table_id);
            }
        });

        const availableTable = tables.find(t => !occupiedIds.has(t.id));

        if (!availableTable) {
            throw new Error('Toutes nos tables sont complètes à cette heure-là (compte tenu de la durée du repas)');
        }

        // 4. Create the reservation
        const reservationData = {
            account_id: restaurant.account_id,
            restaurant_id: payload.restaurant_id,
            service_id: payload.service_id,
            table_id: availableTable.id,
            client_name: payload.client_name,
            client_email: payload.client_email,
            client_phone: payload.client_phone,
            date: payload.date,
            start_time: payload.start_time,
            duration_minutes: duration,
            guest_count: payload.guest_count,
            notes: payload.notes, // Keep as is for now or set to null
            sensitive_notes: payload.notes ? encrypt(payload.notes) : null,
            status: 'confirmed',
            user_id: user?.id ?? payload.user_id
        };



        const adminSupabase = getSupabaseServerAdminClient<Database>();
        const { error: insertError } = await adminSupabase
            .from('reservations')
            .insert(reservationData)
            .select()
            .single();

        if (insertError) {
            console.error('Insert error details:', insertError);
            throw new Error(`Erreur lors de la validation de la réservation: ${insertError.message}`);
        }



        return { success: true };
    },
    {
        schema: ReservationSchema,
        auth: false,
    }
);

/**
 * @name getRestaurantBySlugAction
 * @description Fetches restaurant details and total capacity by slug.
 * This is used for the public restaurant page to keep database logic on the server.
 */
export async function getRestaurantBySlugAction(slug: string) {
    const supabase = getSupabaseServerClient<Database>();

    // 1. Fetch account and restaurant
    const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select(`
            id,
            name,
            restaurants (
                id,
                name,
                location,
                phone
            )
        `)
        .eq('slug', slug)
        .single();

    if (accountError || !account || !account.restaurants?.[0]) {
        return null;
    }

    const restaurant = account.restaurants[0];

    // 2. Fetch total capacity
    const { data: tables } = await supabase
        .from('dining_tables')
        .select('capacity')
        .eq('account_id', account.id)
        .eq('is_active', true);

    const totalCapacity = tables?.reduce((acc, t) => acc + (t.capacity || 0), 0) || 0;

    return {
        account: {
            id: account.id,
            name: account.name,
            slug
        },
        restaurant,
        totalCapacity
    };
}

/**
 * @name getUserReservationsAction
 * @description Fetches upcoming reservations for a specific user at a specific restaurant.
 * This ensures that sensitive booking details are fetched via a server-side call.
 */
export async function getUserReservationsAction({
    restaurantId,
    userId
}: {
    restaurantId: string;
    userId: string;
}) {
    const supabase = getSupabaseServerClient<Database>();

    // We use a simple date string for comparison to match the database format
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('reservations')
        .select('id, date, start_time, guest_count, status')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', userId)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching reservations:', error);
        throw new Error('Erreur lors de la récupération de vos réservations');
    }

    return data || [];
}


/**
 * @name getUserRoleAction
 */
export const getUserRoleAction = enhanceAction(
    async (_: unknown) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient();
        const accountId = await getUserAccount(supabase, user.id);

        if (!accountId) return 'member';

        const { data, error } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('account_id', accountId)
            .single();

        if (error) return 'member';
        return data.role;
    },
    { auth: true }
);

/**
 * @name getDailyReservationsAction
 * @description Fetches all reservations for a specific date and account.
 */
export const getDailyReservationsAction = enhanceAction(
    async ({ date }: { date: string }) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        const { data: membership, error: mError } = await supabase
            .from('memberships')
            .select('account_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (mError || !membership) {
            return [];
        }

        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('account_id', membership.account_id)
            .eq('date', date)
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching daily reservations:', error);
            throw new Error('Erreur lors de la récupération des réservations');
        }

        // Decrypt notes if sensitive_notes is present
        return (data || []).map(res => ({
            ...res,
            notes: res.sensitive_notes ? decrypt(res.sensitive_notes) : res.notes
        }));
    },
    { auth: true }
);

/**
 * @name updateReservationStatusAction
 * @description Updates the status of a reservation.
 */
export const updateReservationStatusAction = enhanceAction(
    async ({
        reservationId,
        status
    }: {
        reservationId: string;
        status: 'confirmed' | 'cancelled' | 'arrived' | 'no-show';
    }) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        // 1. Get the reservation to check its account_id and timing
        const { data: reservation, error: rError } = await supabase
            .from('reservations')
            .select('account_id, date, start_time')
            .eq('id', reservationId)
            .single();

        if (rError || !reservation) {
            throw new Error('Réservation non trouvée');
        }

        // 2. Check if the current user is a member of that account
        const { data: membership, error: mError } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('account_id', reservation.account_id)
            .maybeSingle();

        if (mError || !membership) {
            throw new Error('Permission refusée');
        }

        // 3. Time-based validation
        const now = new Date();
        const reservationTime = parseISO(`${reservation.date}T${reservation.start_time}`);

        if (status === 'arrived') {
            const canMarkArrived = isAfter(now, subMinutes(reservationTime, 30));
            if (!canMarkArrived) {
                throw new Error("Impossible de marquer comme arrivé plus de 30 min à l'avance");
            }
        }

        if (status === 'no-show') {
            const canMarkNoShow = isAfter(now, addMinutes(reservationTime, 15));
            if (!canMarkNoShow) {
                throw new Error("Impossible de marquer comme No-show avant 15 min après l'heure");
            }
        }

        // 4. Update the status
        const { error: updateError } = await supabase
            .from('reservations')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', reservationId);

        if (updateError) {
            console.error('Error updating reservation status:', updateError);
            throw new Error('Erreur lors de la mise à jour du statut');
        }

        revalidatePath('/home', 'page');

        return { success: true };
    },
    { auth: true }
);

/**
 * @name updateReservationDetailsAction
 * @description Updates reservation details (guest count, time, notes) with availability check.
 */
export const updateReservationDetailsAction = enhanceAction(
    async (payload) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        // 1. Get current reservation
        const { data: currentRes, error: resError } = await supabase
            .from('reservations')
            .select(`
                *,
                services (
                    duration_minutes,
                    buffer_minutes
                )
            `)
            .eq('id', payload.id)
            .single();

        if (resError || !currentRes) {
            throw new Error('Réservation non trouvée');
        }

        // 2. Check permission (must belong to user's account)
        const { data: membership } = await supabase
            .from('memberships')
            .select('account_id')
            .eq('user_id', user.id)
            .eq('account_id', currentRes.account_id)
            .maybeSingle();

        if (!membership) {
            throw new Error('Vous n\'avez pas la permission de modifier cette réservation');
        }

        const timeChanged = payload.start_time !== currentRes.start_time;
        const guestsChanged = payload.guest_count !== currentRes.guest_count;

        let tableId = currentRes.table_id;

        // 3. If time or guest count changed, re-check availability
        if (timeChanged || guestsChanged) {
            // Find a table for the new configuration
            const { data: tables } = await supabase
                .from('dining_tables')
                .select('id')
                .eq('account_id', currentRes.account_id)
                .eq('is_active', true)
                .gte('capacity', payload.guest_count)
                .order('capacity', { ascending: true });

            if (!tables || tables.length === 0) {
                throw new Error('Aucune table disponible pour ce nombre de couverts');
            }

            const resObj = currentRes as unknown as {
                duration_minutes: number | null;
                services?: { duration_minutes: number; buffer_minutes: number; }
            };
            const duration = resObj.duration_minutes ?? resObj.services?.duration_minutes ?? 90;
            const buffer = resObj.services?.buffer_minutes ?? 15;

            const { data: otherReservations } = await supabase
                .from('reservations')
                .select(`
                    table_id, 
                    start_time, 
                    duration_minutes,
                    services (
                        duration_minutes,
                        buffer_minutes
                    )
                `)
                .eq('restaurant_id', currentRes.restaurant_id)
                .eq('date', currentRes.date)
                .eq('status', 'confirmed')
                .neq('id', currentRes.id); // Exclude self

            const timeToMin = (t: string | null | undefined) => {
                if (!t) return 0;
                const parts = t.split(':');
                const h = parseInt(parts[0] || '0', 10);
                const m = parseInt(parts[1] || '0', 10);
                return h * 60 + m;
            };

            const isOverlapping = (s1: number, e1: number, s2: number, e2: number) => {
                return s1 < e2 && s2 < e1;
            };

            const requestedStart = timeToMin(payload.start_time);
            const requestedEnd = requestedStart + duration;

            const occupiedIds = new Set();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (otherReservations as any[] || []).forEach((r) => {
                const rStart = timeToMin(r.start_time as string);
                const rBaseDuration = r.duration_minutes ?? r.services?.duration_minutes ?? 90;
                const rBuffer = r.services?.buffer_minutes ?? 15;
                const rEnd = rStart + rBaseDuration;

                if (isOverlapping(requestedStart, requestedEnd + buffer, rStart, rEnd + rBuffer)) {
                    occupiedIds.add(r.table_id);
                }
            });

            const bestTable = tables.find(t => !occupiedIds.has(t.id));

            if (!bestTable) {
                throw new Error('Désolé, plus de disponibilité pour ce changement (tables complètes)');
            }

            tableId = bestTable.id;
        }

        // 4. Perform update
        const updateData = {
            guest_count: payload.guest_count,
            start_time: payload.start_time,
            notes: payload.notes,
            sensitive_notes: payload.notes ? encrypt(payload.notes) : null,
            table_id: tableId,
            updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
            .from('reservations')
            .update(updateData)
            .eq('id', payload.id);

        if (updateError) {
            console.error('Update error:', updateError);
            throw new Error('Erreur lors de la mise à jour');
        }

        revalidatePath('/home');
        return { success: true };
    },
    {
        auth: true,
        schema: UpdateReservationSchema,
    }
);
