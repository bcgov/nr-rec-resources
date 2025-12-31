import { z } from 'zod';

export const editFeaturesSchema = z.object({
  feature_codes: z.array(z.string()).default([]),
});

export type EditFeaturesFormData = z.infer<typeof editFeaturesSchema>;
