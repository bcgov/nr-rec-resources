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
  .refine((data) => data.didYouTakePhoto !== null, {
    message: 'Please answer whether you took this photo',
    path: ['didYouTakePhoto'],
  })
  .refine((data) => data.containsIdentifiableInfo !== null, {
    message:
      'Please answer whether this photo contains identifiable information',
    path: ['containsIdentifiableInfo'],
  })
  .refine(
    (data) => {
      if (data.didYouTakePhoto === false) {
        return !!data.photographerName && data.photographerName.trim() !== '';
      }
      return true;
    },
    {
      message: 'Photographer name is required',
      path: ['photographerName'],
    },
  )
  .refine(
    (data) => {
      if (data.containsIdentifiableInfo === true) {
        return !!data.consentFormFile;
      }
      return true;
    },
    {
      message:
        'Consent form is required for photos with identifiable information',
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
