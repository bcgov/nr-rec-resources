import { z } from 'zod';
import validator from 'validator';
import { RESERVATION_METHOD_OPTIONS } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/constants';

const RESERVATION_METHOD_VALUES = RESERVATION_METHOD_OPTIONS.map(
  (option) => option.value,
) as [string, ...string[]];

/**
 * Creates the validation schema for recreation resource edit form
 * @returns Zod schema with validation rules
 */
export const createEditReservationSchema = () => {
  return z
    .object({
      has_reservation: z.boolean().default(false),
      reservation_method: z.enum(RESERVATION_METHOD_VALUES).optional(),
      reservation_contact: z.string().max(200).default(''),
    })
    .superRefine((data, ctx) => {
      if (!data.has_reservation) {
        return;
      }

      if (!data.reservation_method) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reservation_method'],
          message: 'Select a reservation method.',
        });
        return;
      }

      if (!data.reservation_contact.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reservation_contact'],
          message: 'Enter reservation contact information.',
        });
        return;
      }

      if (data.reservation_method === 'reservation_website') {
        const website = z
          .url('Invalid URL format. Example: https://example.com/.')
          .max(200);
        const result = website.safeParse(data.reservation_contact);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reservation_contact'],
            message: 'Invalid URL format. Example: https://example.com/.',
          });
        }
      }

      if (data.reservation_method === 'reservation_phone_number') {
        if (!validator.isMobilePhone(data.reservation_contact)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reservation_contact'],
            message: 'Invalid phone number format. Example: 250-555-1234.',
          });
        }
      }

      if (data.reservation_method === 'reservation_email') {
        const email = z
          .email('Invalid email format. Example: name@example.com.')
          .max(100);
        const result = email.safeParse(data.reservation_contact);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reservation_contact'],
            message: 'Invalid email format. Example: name@example.com.',
          });
        }
      }
    });
};

/**
 * TypeScript type inferred from the Zod schema
 * This ensures type safety and consistency across all form-related code
 */
export type EditReservationFormData = z.infer<
  ReturnType<typeof createEditReservationSchema>
>;
