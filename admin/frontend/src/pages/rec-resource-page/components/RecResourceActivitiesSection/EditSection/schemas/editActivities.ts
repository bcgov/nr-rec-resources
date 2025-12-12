import { z } from 'zod';

/**
 * Validation schema for activities edit form
 */
export const editActivitiesSchema = z.object({
  activity_codes: z.array(z.number()).default([]),
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type EditActivitiesFormData = z.infer<typeof editActivitiesSchema>;
