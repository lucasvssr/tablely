import { z } from 'zod';

export const RestaurantSchema = z.object({
    id: z.string().uuid().optional(),
    account_id: z.string().uuid().optional(),
    name: z.string().min(2, 'validation.nameMin2'),
    location: z.string().min(5, 'validation.locationMin5'),
    phone: z.string().optional(),
    lat: z.coerce.number().optional().nullable(),
    lng: z.coerce.number().optional().nullable(),
});

export const ServiceSchema = z.object({
    id: z.string().uuid().optional(),
    restaurant_id: z.string().uuid().optional(),
    name: z.string().min(2, 'validation.serviceNameRequired'),
    start_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'validation.formatHHMM'),
    end_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'validation.formatHHMM'),
    duration_minutes: z.coerce.number().min(15, 'validation.durationMin15'),
    buffer_minutes: z.coerce.number().min(0, 'validation.bufferNonNegative').optional(),
    days_of_week: z.array(z.number().min(1).max(7)),
});

export const TableSchema = z.object({
    id: z.string().uuid().optional(),
    restaurant_id: z.string().uuid().optional(),
    name: z.string().min(1, 'validation.tableNameRequired'),
    capacity: z.coerce.number().min(1, 'validation.capacityMin1'),
    is_active: z.boolean(),
});

export const ReservationSchema = z.object({
    restaurant_id: z.string().uuid(),
    service_id: z.string().uuid(),
    date: z.string(),
    start_time: z.string(),
    guest_count: z.coerce.number().min(1),
    duration_minutes: z.coerce.number().optional(),
    // Data for the guest (will be upserted in the action)
    client_name: z.string().min(2, 'validation.nameRequired'),
    client_email: z.string().email('validation.emailInvalid'),
    client_phone: z.string().optional(),
    notes: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    user_id: z.string().uuid().optional(),
});

export const UpdateReservationSchema = z.object({
    id: z.string().uuid(),
    guest_count: z.coerce.number().min(1),
    start_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'validation.formatHHMM'),
    notes: z.string().optional(),
    allergies: z.array(z.string()).optional(),
});

export const AccountSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2, 'validation.nameMin2'),
});

export type RestaurantSchemaType = z.infer<typeof RestaurantSchema>;
export type ServiceSchemaType = z.infer<typeof ServiceSchema>;
export type TableSchemaType = z.infer<typeof TableSchema>;
export type ReservationSchemaType = z.infer<typeof ReservationSchema>;
export type UpdateReservationSchemaType = z.infer<typeof UpdateReservationSchema>;
export type AccountSchemaType = z.infer<typeof AccountSchema>;
