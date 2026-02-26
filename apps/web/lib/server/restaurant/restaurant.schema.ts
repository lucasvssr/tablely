import { z } from 'zod';

export const RestaurantSchema = z.object({
    name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
    location: z.string().min(5, 'La localisation doit faire au moins 5 caractères'),
    phone: z.string().optional(),
});

export const ServiceSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2, 'Le nom du service est requis'),
    start_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Format HH:MM requis'),
    end_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Format HH:MM requis'),
    duration_minutes: z.coerce.number().min(15, 'Durée minimum de 15 min'),
    buffer_minutes: z.coerce.number().min(0, 'La marge ne peut pas être négative').optional(),
    days_of_week: z.array(z.number().min(1).max(7)),
});

export const TableSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Le nom de la table est requis'),
    capacity: z.coerce.number().min(1, 'Capacité minimum de 1'),
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
    client_name: z.string().min(2, 'Le nom est requis'),
    client_email: z.string().email('Email invalide'),
    client_phone: z.string().optional(),
    notes: z.string().optional(),
    user_id: z.string().uuid().optional(),
});

export type RestaurantSchemaType = z.infer<typeof RestaurantSchema>;
export type ServiceSchemaType = z.infer<typeof ServiceSchema>;
export type TableSchemaType = z.infer<typeof TableSchema>;
export type ReservationSchemaType = z.infer<typeof ReservationSchema>;
