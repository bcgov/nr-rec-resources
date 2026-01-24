import { z } from 'zod';

/**
 * Creates the validation schema for recreation resource edit form
 * @returns Zod schema with validation rules
 */
export const createEditReservationSchema = () => {
  return z.object({
    has_reservation: z.boolean().default(false),
    // Basic reservation information
    reservation_website: z.string().max(200).optional().nullable(),
    reservation_phone_number: z.string().max(50).optional().nullable(),
    reservation_email: z.string().max(100).optional().nullable(),
  });
};

/**
 * TypeScript type inferred from the Zod schema
 * This ensures type safety and consistency across all form-related code
 */
export type EditReservationFormData = z.infer<
  ReturnType<typeof createEditReservationSchema>
>;
