import { z } from 'zod';

export const RestaurantSchema = z.object({
    name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
    location: z.string().min(5, 'La localisation doit faire au moins 5 caractères'),
    total_capacity: z.coerce.number().min(1, 'La capacité doit être au moins de 1'),
});

export const ServiceSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2, 'Le nom du service est requis'),
    start_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Format HH:MM requis'),
    end_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Format HH:MM requis'),
    days_of_week: z.array(z.number().min(1).max(7)),
});

export const TableSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Le nom de la table est requis'),
    capacity: z.coerce.number().min(1, 'Capacité minimum de 1'),
    is_active: z.boolean(),
});

export type RestaurantSchemaType = z.infer<typeof RestaurantSchema>;
export type ServiceSchemaType = z.infer<typeof ServiceSchema>;
export type TableSchemaType = z.infer<typeof TableSchema>;
