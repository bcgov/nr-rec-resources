import { z } from 'zod';

const MAX_DISPLAY_NAME_LENGTH = 50;
const MAX_AGE_YEARS = 50;

// Calculate the date 50 years ago for the warning
const fiftyYearsAgo = new Date();
fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - MAX_AGE_YEARS);

export const imageUploadSchema = z
  .object({
    displayName: z
      .string()
      .min(1, 'Display name is required')
      .max(
        MAX_DISPLAY_NAME_LENGTH,
        `Display name must not exceed ${MAX_DISPLAY_NAME_LENGTH} characters`,
      ),
    dateCreated: z
      .date()
      .nullable()
      .refine((date) => !date || date <= new Date(), {
        message: 'Date cannot be in the future',
      }),
    didYouTakePhoto: z.boolean().nullable(),
    containsIdentifiableInfo: z.boolean().nullable(),
    photographerName: z.string().optional(),
    photographerType: z.string(),
    consentFormFile: z.instanceof(File).optional().nullable(),
    confirmationChecked: z.boolean(),
  })
  // "Was this photo taken during working hours?" only required for staff
  .refine(
    (data) => {
      const isStaff = data.photographerType === 'STAFF';
      if (isStaff) {
        return data.didYouTakePhoto !== null;
      }
      return true;
    },
    {
      message:
        'Please answer whether this photo was taken during working hours',
      path: ['didYouTakePhoto'],
    },
  )
  .refine((data) => data.containsIdentifiableInfo !== null, {
    message:
      'Please answer whether this photo contains identifiable information',
    path: ['containsIdentifiableInfo'],
  })
  // Photographer name required for non-staff only
  .refine(
    (data) => {
      const isStaff = data.photographerType === 'STAFF';
      if (!isStaff) {
        return !!data.photographerName && data.photographerName.trim() !== '';
      }
      return true;
    },
    {
      message: 'Photographer name is required',
      path: ['photographerName'],
    },
  )
  // Consent form NOT required only if: staff + working hours + no PII
  // All other cases require consent form (once user has answered required questions)
  .refine(
    (data) => {
      const isStaff = data.photographerType === 'STAFF';

      // For staff: don't enforce consent requirement until both questions are answered
      if (isStaff) {
        // Still answering questions - don't require consent yet
        if (
          data.didYouTakePhoto === null ||
          data.containsIdentifiableInfo === null
        ) {
          return true;
        }
        // Staff exempt if: working hours + no PII
        const staffExempt =
          data.didYouTakePhoto === true &&
          data.containsIdentifiableInfo === false;
        return staffExempt || !!data.consentFormFile;
      }

      // Non-staff: don't enforce until containsIdentifiableInfo is answered
      if (data.containsIdentifiableInfo === null) {
        return true;
      }

      // Non-staff always needs consent form
      return !!data.consentFormFile;
    },
    {
      message: 'Consent form is required',
      path: ['consentFormFile'],
    },
  )
  .refine((data) => data.confirmationChecked, {
    message: 'You must confirm before uploading',
    path: ['confirmationChecked'],
  });

export type ImageUploadFormData = z.infer<typeof imageUploadSchema>;

/**
 * Helper to check if date is older than 50 years (for warning display)
 */
export function isDateSuspiciouslyOld(date: Date | null): boolean {
  if (!date) return false;
  return date < fiftyYearsAgo;
}

export { MAX_DISPLAY_NAME_LENGTH, MAX_AGE_YEARS };
