import { z } from 'zod';
import validator from 'validator';

/**
 * Creates the validation schema for recreation resource edit form
 * @returns Zod schema with validation rules
 */
export const createEditReservationSchema = () => {
  return z.object({
    has_reservation: z.boolean().default(false),
    // Basic reservation information
    reservation_website: z
      .url('Invalid URL format. Example: https://example.com/.')
      .max(200)
      .or(z.literal('').optional().nullable()),
    reservation_phone_number: z
      .string()
      .refine(
        validator.isMobilePhone,
        'Invalid phone number format. Include area code (e.g., 250-555-1234).',
      )
      .max(50)
      .or(z.literal('').optional().nullable()),
    reservation_email: z
      .email('Invalid email format. Example: [name@example.com].')
      .max(100)
      .or(z.literal('').optional().nullable()),
  });
};

/**
 * TypeScript type inferred from the Zod schema
 * This ensures type safety and consistency across all form-related code
 */
export type EditReservationFormData = z.infer<
  ReturnType<typeof createEditReservationSchema>
>;
