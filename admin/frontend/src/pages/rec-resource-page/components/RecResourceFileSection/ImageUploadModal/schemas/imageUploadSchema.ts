import { z } from 'zod';

export const imageUploadSchema = z.object({
  // Display name for the image
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be 50 characters or less'),

  // Toggle 1: Was this photo taken by staff during working hours?
  takenDuringWorkingHours: z.enum(['yes', 'no']).optional(),

  // Toggle 2: Does this photo contain Personal Info? (only relevant when Toggle 1 = yes)
  containsPersonalInfo: z.enum(['yes', 'no']).optional(),

  // Checkbox: Confirmation that no Personal Info (only shown when Toggle 1 = yes, Toggle 2 = no)
  confirmNoPersonalInfo: z.boolean().optional(),
});

export type ImageUploadFormData = z.infer<typeof imageUploadSchema>;

export type UploadState =
  | 'initial' // No selections yet
  | 'not-working-hours' // Toggle 1 = No
  | 'has-personal-info' // Toggle 1 = Yes, Toggle 2 = Yes
  | 'confirm-no-personal-info' // Toggle 1 = Yes, Toggle 2 = No (show checkbox)
  | 'ready'; // Checkbox confirmed, ready to upload

export const getUploadState = (data: ImageUploadFormData): UploadState => {
  if (!data.takenDuringWorkingHours) {
    return 'initial';
  }

  if (data.takenDuringWorkingHours === 'no') {
    return 'not-working-hours';
  }

  // Working hours = yes
  if (!data.containsPersonalInfo) {
    return 'initial'; // Still need to select Toggle 2
  }

  if (data.containsPersonalInfo === 'yes') {
    return 'has-personal-info';
  }

  // Toggle 1 = yes, Toggle 2 = no
  if (data.confirmNoPersonalInfo === true) {
    return 'ready';
  }

  return 'confirm-no-personal-info';
};

export const canUpload = (data: ImageUploadFormData): boolean => {
  return getUploadState(data) === 'ready';
};
