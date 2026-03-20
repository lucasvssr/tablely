'use server';

import { isAfter, subMinutes, addMinutes, parseISO, subDays, format } from 'date-fns';

import { revalidatePath, unstable_cache, updateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerStaticClient } from '@kit/supabase/server-static-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { enhanceAction } from '@kit/next/actions';
import { RestaurantSchema, ServiceSchema, TableSchema, ReservationSchema, UpdateReservationSchema, AccountSchema } from './restaurant.schema';
import { Database } from '~/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { encrypt, decrypt } from '~/lib/security/encryption';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export async function getUserAccount(supabase: SupabaseClient<Database>, userId: string) {
    // 1. Check for active account cookie
    const cookieStore = await cookies();
    const activeAccountId = cookieStore.get('active_account_id')?.value;

    if (activeAccountId) {
        // Verify user still has membership for this account
        const { data: membership } = await supabase
            .from('memberships')
            .select('account_id')
            .eq('user_id', userId)
            .eq('account_id', activeAccountId)
            .maybeSingle();

        if (membership) {
            return membership.account_id;
        }
    }

    // 2. Fallback to first membership if no cookie or invalid cookie
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
 * @name getActiveMembership
 * @description Helper to get the full membership record for the active account.
 */
export async function getActiveMembership(supabase: SupabaseClient<Database>, userId: string) {
    const accountId = await getUserAccount(supabase, userId);
    if (!accountId) return null;

    const { data: membership } = await supabase
        .from('memberships')
        .select('account_id, role, restaurant_id, accounts(name, slug, restaurants(id, name, slug))')
        .eq('user_id', userId)
        .eq('account_id', accountId)
        .single();

    return membership;
}

/**
 * @name getActiveRestaurant
 * @description Helper to get the active restaurant ID for the current account.
 */
export async function getActiveRestaurant(supabase: SupabaseClient<Database>, userId: string) {
    const accountId = await getUserAccount(supabase, userId);
    if (!accountId) return null;

    const cookieStore = await cookies();
    const activeRestId = cookieStore.get('active_restaurant_id')?.value;

    if (activeRestId) {
        // Verify restaurant belongs to account
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('id', activeRestId)
            .eq('account_id', accountId)
            .maybeSingle();

        if (restaurant) return restaurant.id;
    }

    // Fallback to membership restaurant if restricted, otherwise first restaurant in account
    const { data: membership } = await supabase
        .from('memberships')
        .select('restaurant_id')
        .eq('user_id', userId)
        .eq('account_id', accountId)
        .single();

    if (membership?.restaurant_id) {
        return membership.restaurant_id;
    }

    const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('account_id', accountId)
        .order('name')
        .limit(1);

    return restaurants?.[0]?.id || null;
}

/**
 * @name upsertServiceAction
 */
export const upsertServiceAction = enhanceAction(
    async (formData: FormData) => {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);
        if (!accountId) throw new Error(t('actions.accountNotFound'));

        const rawData = Object.fromEntries(formData.entries());
        const validatedData = {
            ...rawData,
            days_of_week: typeof rawData.days_of_week === 'string'
                ? JSON.parse(rawData.days_of_week)
                : rawData.days_of_week,
        };

        const result = ServiceSchema.safeParse(validatedData);

        if (!result.success) throw new Error(t('actions.invalidServiceData'));

        const { id, restaurant_id, days_of_week, ...data } = result.data;

        let serviceId = id;
        const targetRestaurantId = restaurant_id || await getActiveRestaurant(supabase, user.id);
        if (!targetRestaurantId) throw new Error(t('actions.restaurantNotFound'));

        if (id) {
            const { error } = await supabase.from('services').update(data).eq('id', id).eq('account_id', accountId as string);
            if (error) throw new Error(error.message);
        } else {
            const { data: newService, error } = await supabase
                .from('services')
                .insert({ ...data, account_id: accountId as string, restaurant_id: targetRestaurantId })
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
        updateTag(`services-${accountId}`);
    },
    { auth: true }
);

/**
 * @name upsertTableAction
 */
export const upsertTableAction = enhanceAction(
    async (formData: FormData) => {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);

        if (!accountId) {
            throw new Error(t('actions.accountNotFound'));
        }

        const rawData = Object.fromEntries(formData.entries());
        const validatedData = {
            ...rawData,
            is_active: rawData.is_active === 'true',
        };

        const result = TableSchema.safeParse(validatedData);

        if (!result.success) throw new Error(t('actions.invalidTableData'));

        const { id, restaurant_id, ...data } = result.data;

        const targetRestaurantId = restaurant_id || await getActiveRestaurant(supabase, user.id);
        if (!targetRestaurantId) throw new Error(t('actions.restaurantNotFound'));

        if (id) {
            const { error } = await supabase.from('dining_tables').update(data).eq('id', id).eq('account_id', accountId);
            if (error) throw new Error(error.message);
        } else {
            const { error } = await supabase.from('dining_tables').insert({ ...data, account_id: accountId, restaurant_id: targetRestaurantId });
            if (error) throw new Error(error.message);
        }
        updateTag(`tables-${accountId}`);
        updateTag(`restaurant-slug`); // Table changes affect total capacity in public profile
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
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        const result = RestaurantSchema.safeParse(
            Object.fromEntries(formData.entries()),
        );

        if (!result.success) {
            throw new Error(t('actions.invalidRestaurantData'));
        }

        const { name, location, phone, lat, lng, account_id: existingAccountId } = result.data;
        const slug = slugify(name);

        let finalAccountId = existingAccountId;

        if (!finalAccountId) {
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
                throw new Error(`${t('actions.orgCreationError')}: ${accountError?.message}`);
            }
            finalAccountId = account.id;

            // 2. Create Membership (Owner)
            const { error: memberError } = await supabase
                .from('memberships')
                .insert({
                    account_id: finalAccountId,
                    user_id: user.id,
                    role: 'owner',
                });

            if (memberError) {
                throw new Error(`${t('actions.membershipCreationError')}: ${memberError.message}`);
            }
        }

        const restaurantSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;

        // 3. Create Restaurant
        const { data: newRestaurant, error: restError } = await supabase
            .from('restaurants')
            .insert({
                account_id: finalAccountId,
                name: name,
                location: location,
                phone: phone,
                lat: lat,
                lng: lng,
                slug: restaurantSlug,
            })
            .select('id')
            .single();

        if (restError || !newRestaurant) {
            throw new Error(`${t('actions.restaurantCreationError')}: ${restError?.message}`);
        }

        // Successfully created
        const cookieStore = await cookies();
        cookieStore.set('active_account_id', finalAccountId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        cookieStore.set('active_restaurant_id', newRestaurant.id, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        updateTag('restaurants-list');
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
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);
        if (!accountId) throw new Error(t('actions.accountNotFound'));

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)
            .eq('account_id', accountId as string);

        if (error) throw new Error(error.message);
        updateTag(`services-${accountId}`);
    },
    { auth: true }
);

/**
 * @name deleteTableAction
 */
export const deleteTableAction = enhanceAction(
    async ({ id }: { id: string }) => {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);
        if (!accountId) throw new Error(t('actions.accountNotFound'));

        const { error } = await supabase
            .from('dining_tables')
            .delete()
            .eq('id', id)
            .eq('account_id', accountId as string);

        if (error) throw new Error(error.message);
        updateTag(`tables-${accountId}`);
        updateTag(`restaurant-slug`);
    },
    { auth: true }
);
/**
 * @name updateRestaurantAction
 */
export const updateRestaurantAction = enhanceAction(
    async (formData: FormData) => {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);
        if (!accountId) throw new Error(t('actions.accountNotFound'));

        const result = RestaurantSchema.safeParse(
            Object.fromEntries(formData.entries()),
        );

        if (!result.success) {
            throw new Error(t('actions.invalidRestaurantData'));
        }

        const { id, name, location, phone, lat, lng } = result.data;

        const targetId = id || await getActiveRestaurant(supabase, user.id);
        if (!targetId) throw new Error(t('actions.restaurantNotFound'));

        // 1. Update Restaurant
        const { error: restError } = await supabase
            .from('restaurants')
            .update({
                name,
                location,
                phone,
                lat,
                lng,
            })
            .eq('id', targetId)
            .eq('account_id', accountId);

        if (restError) throw new Error(restError.message);

        // Fetch account to get slug for revalidation
        const { data: account } = await supabase
            .from('accounts')
            .select('slug')
            .eq('id', accountId)
            .single();

        revalidatePath('/home', 'layout');
        updateTag('restaurants-list');
        updateTag(`restaurant-slug`);
        if (account?.slug) {
            revalidatePath(`/restaurant/${account.slug}`);
        }
    },
    { auth: true }
);

/**
 * @name updateAccountAction
 */
export const updateAccountAction = enhanceAction(
    async (formData: FormData) => {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        const result = AccountSchema.safeParse(
            Object.fromEntries(formData.entries()),
        );

        if (!result.success) {
            throw new Error(t('actions.invalidAccountData') || 'Données d\'établissement invalides');
        }

        const { id, name } = result.data;

        // Verify user has permission to update this account
        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('account_id', id)
            .single();

        if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
            throw new Error(t('actions.permissionDenied'));
        }

        const { error } = await supabase
            .from('accounts')
            .update({ name })
            .eq('id', id);

        if (error) throw new Error(error.message);

        revalidatePath('/home/settings/establishments', 'page');
        updateTag('restaurants-list');
    },
    { auth: true }
);


/**
 * @name deleteRestaurantAction
 */
export const deleteRestaurantAction = enhanceAction(
    async ({ id }: { id: string }) => {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        // Component passes account_id as id
        const accountId = id;

        // 1. Verify permission: Must be the owner of the account
        const { data: membership, error: memError } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('account_id', accountId)
            .maybeSingle();

        if (memError || !membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
            throw new Error(t('actions.permissionDenied'));
        }

        // 2. Delete using admin client to bypass RLS and handle cascades
        const adminClient = getSupabaseServerAdminClient<Database>();

        // Deleting the account will cascade to restaurants, memberships, services, etc.
        const { error: deleteError } = await adminClient
            .from('accounts')
            .delete()
            .eq('id', accountId);

        if (deleteError) {
            console.error('Error deleting account:', deleteError);
            throw new Error(deleteError.message);
        }

        // 3. Update cookie if active account was deleted
        const cookieStore = await cookies();
        const activeAccountId = cookieStore.get('active_account_id')?.value;
        if (activeAccountId === accountId) {
            cookieStore.delete('active_account_id');
        }

        revalidatePath('/home', 'layout');
        updateTag('restaurants-list');
        updateTag('restaurant-slug');

        return { success: true };
    },
    { auth: true }
);

/**
 * @name deleteSingleRestaurantAction
 */
export const deleteSingleRestaurantAction = enhanceAction(
    async ({ id }: { id: string }) => {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        // 1. Verify restaurant exists and user has permission
        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .select('account_id')
            .eq('id', id)
            .single();

        if (restError || !restaurant) throw new Error(t('actions.restaurantNotFound'));

        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('account_id', restaurant.account_id)
            .single();

        if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
            throw new Error(t('actions.permissionDenied'));
        }

        // 2. Delete using admin client
        const adminClient = getSupabaseServerAdminClient<Database>();
        const { error: deleteError } = await adminClient
            .from('restaurants')
            .delete()
            .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);

        // 3. Update cookie if active restaurant was deleted
        const cookieStore = await cookies();
        const activeRestId = cookieStore.get('active_restaurant_id')?.value;
        if (activeRestId === id) {
            cookieStore.delete('active_restaurant_id');
        }

        updateTag('restaurants-list');
        updateTag('restaurant-slug');
        revalidatePath('/home/settings/establishments', 'page');

        return { success: true };
    },
    { auth: true }
);


/**
 * @name getServicesAction
 */
export const getServicesAction = enhanceAction(
    async (_: unknown) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);
        if (!accountId) throw new Error('Compte non trouvé');

        const restaurantId = await getActiveRestaurant(supabase, user.id);
        if (!restaurantId) return [];

        const fetchServices = unstable_cache(
            async (accId: string, restId: string) => {
                const adminClient = getSupabaseServerAdminClient<Database>();
                const { data, error } = await adminClient
                    .from('services')
                    .select('*, service_operating_days(day_of_week)')
                    .eq('account_id', accId)
                    .eq('restaurant_id', restId)
                    .order('start_time', { ascending: true });

                if (error) throw new Error(error.message);

                return (data || []).map(service => ({
                    ...service,
                    days_of_week: service.service_operating_days?.map((d: { day_of_week: number }) => d.day_of_week) || []
                }));
            },
            [`services`],
            { revalidate: 3600, tags: [`services-${accountId}`] }
        );

        return fetchServices(accountId, restaurantId);
    },
    { auth: true }
);

/**
 * @name getTablesAction
 */
export const getTablesAction = enhanceAction(
    async (_: unknown) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);
        if (!accountId) throw new Error('Compte non trouvé');

        const restaurantId = await getActiveRestaurant(supabase, user.id);
        if (!restaurantId) return [];

        const fetchTables = unstable_cache(
            async (accId: string, restId: string) => {
                const adminClient = getSupabaseServerAdminClient<Database>();
                const { data, error } = await adminClient
                    .from('dining_tables')
                    .select('*')
                    .eq('account_id', accId)
                    .eq('restaurant_id', restId)
                    .order('name', { ascending: true });

                if (error) throw new Error(error.message);
                return data || [];
            },
            [`tables`],
            { revalidate: 3600, tags: [`tables-${accountId}`] }
        );

        return fetchTables(accountId, restaurantId);
    },
    { auth: true }
);
/**
 * @name getDashboardStatsAction
 */
export const getDashboardStatsAction = enhanceAction(
    async (_: unknown) => {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);

        const restaurantId = await getActiveRestaurant(supabase, user.id);

        if (!accountId || !restaurantId) {
            return {
                servicesCount: 0,
                tablesCount: 0,
                totalCapacity: 0,
                reservationsCount: 0,
                clientsCount: 0,
                reservationsTrend: [],
                guestsTrend: [],
                clientsTrend: [],
                topCustomers: []
            };
        }

        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

        const [
            { count: servicesCount, error: servicesError },
            { count: tablesCount, error: tablesError },
            { data: tablesData, error: tablesDataError },
            { count: reservationsCount, error: reservationsError },
            { data: trendData, error: trendError },
            { data: topCustomersData, error: topCustomersError }
        ] = await Promise.all([
            supabase.from('services').select('*', { count: 'exact', head: true }).eq('account_id', accountId).eq('restaurant_id', restaurantId),
            supabase.from('dining_tables').select('*', { count: 'exact', head: true }).eq('account_id', accountId).eq('restaurant_id', restaurantId),
            supabase.from('dining_tables').select('capacity').eq('account_id', accountId).eq('restaurant_id', restaurantId).eq('is_active', true),
            supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('account_id', accountId).eq('restaurant_id', restaurantId).eq('status', 'confirmed'),
            supabase.from('reservations').select('date, guest_count, client_email').eq('account_id', accountId).eq('restaurant_id', restaurantId).eq('status', 'confirmed').gte('date', thirtyDaysAgo).order('date', { ascending: true }),
            supabase.from('reservations').select('client_name, client_email, guest_count, date').eq('account_id', accountId).eq('restaurant_id', restaurantId).eq('status', 'confirmed')
        ]);

        if (servicesError || tablesError || tablesDataError || reservationsError || trendError || topCustomersError) {
            console.error('Error fetching dashboard stats:', { servicesError, tablesError, tablesDataError, reservationsError, trendError, topCustomersError });
            throw new Error(t('actions.fetchStatsError'));
        }

        const totalCapacity = (tablesData || []).reduce((acc: number, table: { capacity: number | null }) => acc + (table.capacity || 0), 0);

        // Process Trends (Last 30 days)
        const reservationsTrendMap = new Map<string, number>();
        const guestsTrendMap = new Map<string, number>();
        const clientsTrendMap = new Map<string, Set<string>>();

        // Pre-fill with last 30 days to ensure continuous charts
        for (let i = 30; i >= 0; i--) {
            const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
            reservationsTrendMap.set(dateStr, 0);
            guestsTrendMap.set(dateStr, 0);
            clientsTrendMap.set(dateStr, new Set());
        }

        (trendData || []).forEach(res => {
            const date = res.date;
            if (date && reservationsTrendMap.has(date)) {
                reservationsTrendMap.set(date, (reservationsTrendMap.get(date) || 0) + 1);
                guestsTrendMap.set(date, (guestsTrendMap.get(date) || 0) + (res.guest_count || 0));
                if (res.client_email) {
                    clientsTrendMap.get(date)?.add(res.client_email);
                }
            }
        });

        const reservationsTrend = Array.from(reservationsTrendMap.entries()).map(([name, value]) => ({ name, value }));
        const guestsTrend = Array.from(guestsTrendMap.entries()).map(([name, value]) => ({ name, value }));
        const clientsTrend = Array.from(clientsTrendMap.entries()).map(([name, set]) => ({ name, value: set.size }));

        // Process Top Customers
        const customerMap = new Map<string, {
            name: string;
            email: string;
            reservationsCount: number;
            guestCount: number;
            lastReservation: string;
        }>();

        (topCustomersData || []).forEach(res => {
            const email = res.client_email;
            if (!email) return;

            const current = customerMap.get(email) || {
                name: res.client_name || 'Anonymous',
                email: email,
                reservationsCount: 0,
                guestCount: 0,
                lastReservation: res.date || ''
            };

            current.reservationsCount += 1;
            current.guestCount += (res.guest_count || 0);
            if (res.date && res.date > current.lastReservation) {
                current.lastReservation = res.date;
            }

            customerMap.set(email, current);
        });

        const topCustomers = Array.from(customerMap.values())
            .sort((a, b) => b.reservationsCount - a.reservationsCount)
            .slice(0, 10);

        return {
            servicesCount: servicesCount || 0,
            tablesCount: tablesCount || 0,
            totalCapacity,
            reservationsCount: reservationsCount || 0,
            clientsCount: customerMap.size,
            reservationsTrend,
            guestsTrend,
            clientsTrend,
            topCustomers
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
        p_user_id: (userId ?? null) as string | null,
        p_client_email: (clientEmail ?? null) as string | null
    });

    if (error) {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');
        console.error('Error fetching available slots:', JSON.stringify(error, null, 2));
        throw new Error(t('actions.fetchSlotsError'));
    }

    const slots = (data || []) as {
        available: boolean;
        service_id: string;
        service_name: string;
        slot_time: string;
    }[];

    // Filter out past slots if the date is today
    const today = format(new Date(), 'yyyy-MM-dd');
    if (date === today) {
        const nowTime = format(new Date(), 'HH:mm:ss');
        return slots.filter((slot) => slot.slot_time > nowTime);
    }

    return slots;
}

/**
 * @name createReservationAction
 * @description Creates a new reservation for a restaurant.
 */
export const createReservationAction = enhanceAction(
    async (payload, user) => {
        try {
            const i18n = await createI18nServerInstance();
            const t = i18n.getFixedT(null, 'restaurant');

            const supabase = getSupabaseServerClient<Database>();

            // 1. Get account_id from restaurant
            const { data: restaurant, error: restaurantError } = await supabase
                .from('restaurants')
                .select('account_id, id')
                .eq('id', payload.restaurant_id)
                .single();

            if (restaurantError || !restaurant) {
                return { error: t('actions.restaurantNotFound') };
            }

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
                return { error: t('actions.existingReservation') };
            }

            // 2. Find an available table for this slot
            const { data: tables, error: tablesError } = await supabase
                .from('dining_tables')
                .select('id')
                .eq('restaurant_id', payload.restaurant_id)
                .eq('is_active', true)
                .gte('capacity', payload.guest_count)
                .order('capacity', { ascending: true });

            if (tablesError || !tables || tables.length === 0) {
                return { error: t('actions.noTableAvailable') };
            }

            // 3. Get the service details and existing reservations to check for overlaps
            const { data: service } = await supabase
                .from('services')
                .select('duration_minutes, buffer_minutes')
                .eq('id', payload.service_id)
                .single();

            const serviceData = service as { duration_minutes: number | null; buffer_minutes: number | null } | null;
            const duration = payload.duration_minutes ?? serviceData?.duration_minutes ?? 90;
            const buffer = serviceData?.buffer_minutes ?? 15;

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

                if (isOverlapping(requestedStart, requestedEnd + buffer, rStart, rEnd + rBuffer)) {
                    occupiedIds.add(r.table_id);
                }
            });

            const availableTable = tables.find(t => !occupiedIds.has(t.id));

            if (!availableTable) {
                return { error: t('actions.tablesFull') };
            }

            // 4. Create the reservation
            const allergyText = payload.allergies && payload.allergies.length > 0
                ? `[Allergies: ${payload.allergies.join(', ')}] `
                : '';

            const combinedNotes = `${allergyText}${payload.notes || ''}`.trim();

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
                guest_count: payload.guest_count,
                notes: combinedNotes ? encrypt(combinedNotes) : null,
                status: 'confirmed',
                user_id: user.id
            };

            const adminSupabase = getSupabaseServerAdminClient<Database>();
            const { error: insertError } = await adminSupabase
                .from('reservations')
                .insert(reservationData)
                .select()
                .single();

            if (insertError) {
                console.error('Insert error details:', insertError);
                return { error: `${t('actions.validationError')}: ${insertError.message}` };
            }

            // Fetch account to get slug for revalidation
            const { data: account } = await supabase
                .from('accounts')
                .select('slug')
                .eq('id', restaurant.account_id)
                .single();

            revalidatePath('/home', 'layout');
            if (account?.slug) {
                revalidatePath(`/restaurant/${account.slug}`);
                revalidatePath(`/restaurant/${account.slug}`, 'layout');
            }

            return { success: true };
        } catch (error) {
            console.error('createReservationAction unhandled error:', error);
            const i18n = await createI18nServerInstance();
            const t = i18n.getFixedT(null, 'restaurant');

            // Return a more descriptive error if it's an instance of Error
            if (error instanceof Error) {
                return { error: error.message };
            }

            return { error: t('actions.fetchSlotsError') }; // Generic error fallback
        }
    },
    {
        schema: ReservationSchema,
        auth: true,
    }
);

/**
 * @name getRestaurantBySlugAction
 * @description Fetches restaurant details and total capacity by slug, cached for 1 hour.
 */
export const getRestaurantBySlugAction = unstable_cache(
    async (slug: string) => {
        // Use Static client (anon) to avoid dynamic cookies() calls inside cache
        // and respect RLS without requiring Admin privileges
        const supabase = getSupabaseServerStaticClient();

        // 1. Fetch restaurant and its account
        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .select(`
                id,
                name,
                location,
                phone,
                account_id,
                accounts (
                    id,
                    name,
                    slug
                )
            `)
            .eq('slug', slug)
            .single();

        if (restError || !restaurant) {
            return null;
        }

        const account = restaurant.accounts as unknown as { id: string; name: string; slug: string };

        // 2. Fetch total capacity for THIS restaurant specifically
        const { data: tables } = await supabase
            .from('dining_tables')
            .select('capacity')
            .eq('restaurant_id', restaurant.id)
            .eq('is_active', true);

        const totalCapacity = tables?.reduce((acc, t) => acc + (t.capacity || 0), 0) || 0;

        return {
            account: {
                id: account.id,
                name: account.name,
                slug: account.slug
            },
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                location: restaurant.location,
                phone: restaurant.phone
            },
            totalCapacity
        };
    },
    ['restaurant-slug'],
    {
        revalidate: 3600,
        tags: ['restaurant-slug'],
    }
);

/**
 * @name getRestaurantsAction
 * @description Fetches all restaurants for the public list, cached for 1 hour.
 */
export const getRestaurantsAction = unstable_cache(
    async () => {
        // Use Static client (anon) to avoid dynamic cookies() calls inside cache
        // and respect RLS without requiring Admin privileges
        const supabase = getSupabaseServerStaticClient();
        const { data, error } = await supabase
            .from('restaurants')
            .select('id, name, location, phone, lat, lng, slug, accounts(slug)')
            .order('name');

        if (error) {
            console.error('getRestaurantsAction error:', error);
            return [];
        }

        type RestaurantResult = {
            id: string;
            name: string;
            location: string | null;
            phone: string | null;
            lat: string | number | null;
            lng: string | number | null;
            slug: string;
            accounts: { slug: string } | { slug: string }[] | null;
        };

        return (data as unknown as RestaurantResult[] || []).map((r) => ({
            id: r.id,
            name: r.name,
            location: r.location || '',
            phone: r.phone || '',
            lat: r.lat ? Number(r.lat) : null,
            lng: r.lng ? Number(r.lng) : null,
            slug: r.slug || ''
        }));
    },
    ['restaurants-list-v2'],
    {
        revalidate: 3600,
        tags: ['restaurants-list'],
    }
);


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
        .select('id, date, start_time, guest_count, status, client_name, notes')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', userId)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

    if (error) {
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');
        console.error('Error fetching reservations:', error);
        throw new Error(t('actions.fetchReservationsError'));
    }

    return (data || []).map(res => ({
        ...res,
        notes: res.notes ? decrypt(res.notes) : null
    }));
}


/**
 * @name getUserRoleAction
 */
export const getUserRoleAction = enhanceAction(
    async (_: unknown) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
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
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        const accountId = await getUserAccount(supabase, user.id);
        const restaurantId = await getActiveRestaurant(supabase, user.id);

        if (!accountId || !restaurantId) {
            return [];
        }

        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('account_id', accountId)
            .eq('restaurant_id', restaurantId)
            .eq('date', date)
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching daily reservations:', error);
            throw new Error(t('actions.fetchReservationsError'));
        }

        // Decrypt notes
        return (data || []).map(res => ({
            ...res,
            notes: res.notes ? decrypt(res.notes) : null
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
        const i18n = await createI18nServerInstance();
        const t = i18n.getFixedT(null, 'restaurant');

        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        // 1. Get the reservation to check its account_id and timing
        const { data: reservation, error: rError } = await supabase
            .from('reservations')
            .select('account_id, date, start_time, user_id, client_email, status')
            .eq('id', reservationId)
            .single();

        if (rError || !reservation) {
            throw new Error(t('actions.reservationNotFound'));
        }

        // 2. Check permissions: must be account member OR the owner (only for cancellation)
        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('account_id', reservation.account_id)
            .maybeSingle();

        const isOwner = reservation.user_id === user.id || (user.email && reservation.client_email === user.email);

        if (!membership && !isOwner) {
            throw new Error(t('actions.permissionDenied'));
        }

        // Owners can only cancel their own reservations
        if (isOwner && !membership && status !== 'cancelled') {
            throw new Error(t('actions.permissionDenied'));
        }

        // 3. Business rule: cannot confirm a cancelled reservation
        if (reservation.status === 'cancelled' && status === 'confirmed') {
            throw new Error(t('actions.cannotConfirmCancelled'));
        }

        // 3b. cannot modify past reservation status
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (reservation.date < todayStr) {
            throw new Error(t('actions.cannotModifyPastReservation'));
        }

        // 4. Time-based validation
        const now = new Date();
        const reservationTime = parseISO(`${reservation.date}T${reservation.start_time}`);

        if (status === 'arrived') {
            const canMarkArrived = isAfter(now, subMinutes(reservationTime, 30));
            if (!canMarkArrived) {
                throw new Error(t('actions.arrivedTooEarly'));
            }
        }

        if (status === 'no-show') {
            const canMarkNoShow = isAfter(now, addMinutes(reservationTime, 15));
            if (!canMarkNoShow) {
                throw new Error(t('actions.noShowTooEarly'));
            }
        }

        // 4. Update the status using admin client (to bypass RLS for clients/owners)
        const adminClient = getSupabaseServerAdminClient<Database>();
        const { error: updateError } = await adminClient
            .from('reservations')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', reservationId);

        if (updateError) {
            console.error('Error updating reservation status:', updateError);
            throw new Error(t('actions.updateStatusError'));
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

        // 2. Check permission (must belong to user's account OR be the user who made the reservation)
        const isOwnerOfReservation = currentRes.user_id === user.id;

        const { data: membership } = await supabase
            .from('memberships')
            .select('account_id')
            .eq('user_id', user.id)
            .eq('account_id', currentRes.account_id)
            .maybeSingle();

        if (!membership && !isOwnerOfReservation) {
            throw new Error('Vous n\'avez pas la permission de modifier cette réservation');
        }

        // 2b. Check if the reservation is from a past date
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (currentRes.date < todayStr) {
            const i18n = await createI18nServerInstance();
            const t = i18n.getFixedT(null, 'restaurant');
            throw new Error(t('actions.cannotModifyPastReservation'));
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
            const reservationsList = (otherReservations as unknown as {
                table_id: string;
                start_time: string;
                services: {
                    duration_minutes: number | null;
                    buffer_minutes: number | null;
                } | null;
            }[] ?? []);

            reservationsList.forEach((r) => {
                const rStart = timeToMin(r.start_time);
                const rBaseDuration = r.services?.duration_minutes ?? 90;
                const rBuffer = r.services?.buffer_minutes ?? 15;
                const rEnd = rStart + rBaseDuration;

                if (isOverlapping(requestedStart, requestedEnd + buffer, rStart, rEnd + rBuffer)) {
                    occupiedIds.add(r.table_id);
                }
            });

            const bestTable = tables.find(t => !occupiedIds.has(t.id));

            if (!bestTable) {
                const i18n = await createI18nServerInstance();
                const t = i18n.getFixedT(null, 'restaurant');
                throw new Error(t('actions.availabilityChangeError'));
            }

            tableId = bestTable.id;
        }

        // 4. Perform update
        const allergyText = payload.allergies && payload.allergies.length > 0
            ? `[Allergies: ${payload.allergies.join(', ')}] `
            : '';

        const combinedNotes = `${allergyText}${payload.notes || ''}`.trim();

        const updateData = {
            guest_count: payload.guest_count,
            start_time: payload.start_time,
            notes: combinedNotes ? encrypt(combinedNotes) : null,
            table_id: tableId,
            updated_at: new Date().toISOString(),
        };

        const adminSupabase = getSupabaseServerAdminClient();
        const { error: finalUpdateError } = await adminSupabase
            .from('reservations')
            .update(updateData)
            .eq('id', payload.id);

        if (finalUpdateError) {
            console.error('Final update error (Admin):', finalUpdateError);
            const i18n = await createI18nServerInstance();
            const t = i18n.getFixedT(null, 'restaurant');
            throw new Error(t('actions.updateError'));
        }

        revalidatePath('/home');
        return { success: true };
    },
    {
        auth: true,
        schema: UpdateReservationSchema,
    }
);

/**
 * @name getMembershipsAction
 * @description Fetches all memberships with account details for the current user.
 */
export const getMembershipsAction = enhanceAction(
    async (_: unknown) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        const { data, error } = await supabase
            .from('memberships')
            .select('account_id, role, restaurant_id, accounts(name, slug, restaurants(id, name, slug, location, phone, lat, lng))')
            .eq('user_id', user.id);

        if (error) throw new Error(error.message);
        return (data || []).map(m => {
            const account = m.accounts as unknown as {
                name: string;
                slug: string;
                restaurants: Array<{
                    id: string;
                    name: string;
                    slug: string;
                    location: string | null;
                    phone: string | null;
                    lat: number | null;
                    lng: number | null;
                }>
            };

            const allRestaurants = account?.restaurants || [];
            const filteredRestaurants = m.restaurant_id 
                ? allRestaurants.filter(r => r.id === m.restaurant_id)
                : allRestaurants;

            return {
                id: m.account_id,
                role: m.role,
                restaurantId: m.restaurant_id,
                name: account?.name,
                slug: account?.slug,
                restaurants: filteredRestaurants
            };
        });
    },
    { auth: true }
);

/**
 * @name switchToAccountAction
 * @description Sets the active account cookie and revalidates.
 */
export const switchToAccountAction = enhanceAction(
    async ({ accountId }: { accountId: string }) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();

        // Verify membership
        const { data: membership } = await supabase
            .from('memberships')
            .select('account_id')
            .eq('user_id', user.id)
            .eq('account_id', accountId)
            .maybeSingle();

        if (!membership) {
            const i18n = await createI18nServerInstance();
            const t = i18n.getFixedT(null, 'restaurant');
            throw new Error(t('actions.accountAccessDenied'));
        }

        const cookieStore = await cookies();
        cookieStore.set('active_account_id', accountId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        // Also reset active restaurant when switching account to default to the first one
        cookieStore.delete('active_restaurant_id');

        revalidatePath('/home', 'layout');
        revalidatePath('/home', 'page');
        return { success: true };
    },
    { auth: true }
);

/**
 * @name switchToRestaurantAction
 * @description Sets the active restaurant cookie and revalidates.
 */
export const switchToRestaurantAction = enhanceAction(
    async ({ restaurantId }: { restaurantId: string }) => {
        const user = await requireUserInServerComponent();
        const supabase = getSupabaseServerClient<Database>();
        const accountId = await getUserAccount(supabase, user.id);

        if (!accountId) throw new Error('Account not found');

        // Verify restaurant belongs to account and user has access
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('id', restaurantId)
            .eq('account_id', accountId)
            .maybeSingle();

        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        // Check if user has restricted access
        const { data: membership } = await supabase
            .from('memberships')
            .select('restaurant_id')
            .eq('user_id', user.id)
            .eq('account_id', accountId)
            .single();

        if (membership?.restaurant_id && membership.restaurant_id !== restaurantId) {
            throw new Error('Access denied to this restaurant');
        }

        const cookieStore = await cookies();
        cookieStore.set('active_restaurant_id', restaurantId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        revalidatePath('/home', 'layout');
        revalidatePath('/home', 'page');
        return { success: true };
    },
    { auth: true }
);


/**
 * @name getClientReservationsAction
 * @description Fetches all reservations for a client across all restaurants.
 * Uses the standard server client - RLS policies allow users to read their own reservations.
 */
export async function getClientReservationsAction(userId: string) {
    const supabase = getSupabaseServerClient<Database>();

    // Get user email for fallback matching (reservations made before login)
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email;

    // Primary query: match by user_id (RLS allows this via auth.uid() = user_id)
    const { data: byUserId, error: error1 } = await supabase
        .from('reservations')
        .select(`
            id,
            restaurant_id,
            date,
            start_time,
            guest_count,
            status,
            notes,
            client_name,
            restaurants (
                name,
                location,
                accounts (
                    slug
                )
            )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error1) {
        console.error('Error fetching client reservations by user_id:', error1);
    }

    // Secondary query: match by client_email (for reservations made before login)
    // RLS allows this via client_email = auth.users.email
    let byEmail: typeof byUserId = [];
    if (userEmail) {
        const { data: emailData, error: error2 } = await supabase
            .from('reservations')
            .select(`
                id,
                restaurant_id,
                date,
                start_time,
                guest_count,
                status,
                notes,
                client_name,
                restaurants (
                    name,
                    location,
                    accounts (
                        slug
                    )
                )
            `)
            .eq('client_email', userEmail)
            .is('user_id', null)
            .order('date', { ascending: false });

        if (error2) {
            console.error('Error fetching client reservations by email:', error2);
        } else {
            byEmail = emailData || [];
        }
    }

    // Merge and deduplicate
    const all = [...(byUserId || []), ...byEmail];
    const seen = new Set<string>();
    const deduplicated = all.filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
    });

    return deduplicated.map((res) => {
        const restaurantRec = res.restaurants as unknown as {
            name: string;
            location: string;
            accounts: {
                slug: string;
            } | null;
        } | null;

        return {
            id: res.id,
            restaurant_id: res.restaurant_id,
            date: res.date,
            start_time: res.start_time,
            guest_count: res.guest_count,
            status: res.status,
            notes: res.notes ? decrypt(res.notes) : null,
            client_name: res.client_name || '',
            restaurant_name: restaurantRec?.name || '',
            restaurant_location: restaurantRec?.location || '',
            restaurant_slug: restaurantRec?.accounts?.slug || ''
        };
    });
}
