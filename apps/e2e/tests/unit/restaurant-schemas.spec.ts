import { test, expect } from '@playwright/test';
import { 
  ServiceSchema, 
  ReservationSchema, 
  TableSchema, 
  UpdateReservationSchema,
  InviteSchema
} from '../../../../apps/web/lib/server/restaurant/restaurant.schema';

test.describe('Restaurant Schemas Unit Tests', () => {
  
  test.describe('ServiceSchema', () => {
    test('should validate valid service data', () => {
      const data = {
        name: 'Lunch',
        start_time: '12:00',
        end_time: '14:30',
        duration_minutes: 60,
        buffer_minutes: 15,
        days_of_week: [1, 2, 3, 4, 5]
      };
      const result = ServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail with invalid time format', () => {
      const data = {
        name: 'Lunch',
        start_time: '12:0', // Missing digit
        end_time: '25:00', // Invalid hour
        duration_minutes: 60,
        days_of_week: [1]
      };
      const result = ServiceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    test('should fail if duration is too short', () => {
      const data = {
        name: 'Lunch',
        start_time: '12:00',
        end_time: '14:00',
        duration_minutes: 5, // Min is 15
        days_of_week: [1]
      };
      const result = ServiceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  test.describe('ReservationSchema', () => {
    const validBase = {
      restaurant_id: '550e8400-e29b-41d4-a716-446655440000',
      service_id: '550e8400-e29b-41d4-a716-446655440001',
      date: '2024-04-10',
      start_time: '12:30',
      guest_count: 2,
      client_name: 'John Doe',
      client_email: 'john@example.com'
    };

    test('should validate correct reservation data', () => {
      const result = ReservationSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    test('should fail with invalid email', () => {
      const result = ReservationSchema.safeParse({
        ...validBase,
        client_email: 'not-an-email'
      });
      expect(result.success).toBe(false);
    });

    test('should fail with zero or negative guests', () => {
      const result = ReservationSchema.safeParse({
        ...validBase,
        guest_count: 0
      });
      expect(result.success).toBe(false);
    });

    test('should fail if client name is too short', () => {
      const result = ReservationSchema.safeParse({
        ...validBase,
        client_name: 'J'
      });
      expect(result.success).toBe(false);
    });
  });

  test.describe('TableSchema', () => {
    test('should validate correct table data', () => {
      const data = {
        name: 'Table 1',
        capacity: 4,
        is_active: true
      };
      const result = TableSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail if capacity is zero', () => {
      const data = {
        name: 'Table 1',
        capacity: 0,
        is_active: true
      };
      const result = TableSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  test.describe('UpdateReservationSchema', () => {
    test('should validate correct update data', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        guest_count: 4,
        start_time: '19:00',
        notes: 'Window table please'
      };
      const result = UpdateReservationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail if start_time format is invalid', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        guest_count: 4,
        start_time: '7:00 PM'
      };
      const result = UpdateReservationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  test.describe('InviteSchema', () => {
    test('should validate correct invitation data', () => {
      const data = {
        email: 'test@example.com',
        role: 'member',
        restaurant_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      const result = InviteSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail with invalid role', () => {
      const data = {
        email: 'test@example.com',
        role: 'owner' // invalid role
      };
      const result = InviteSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    test('should handle optional restaurant_id', () => {
      const data = {
        email: 'test@example.com',
        role: 'admin'
      };
      const result = InviteSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
