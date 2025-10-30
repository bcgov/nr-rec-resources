import { GroupedOption } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components';
import { MultiValue } from 'react-select';
import { z } from 'zod';

/**
 * Optimized validation schema for recreation resource edit form
 * Focuses on the essential fields and provides clear validation rules
 */
export const editResourceSchema = z.object({
  // Basic resource information
  maintenance_standard_code: z.string().optional(),
  control_access_code: z.string().optional().nullable(),
  status_code: z.string().optional(),
  selected_access_options: z.custom<MultiValue<GroupedOption>>().default([]),
});

/**
 * TypeScript type inferred from the Zod schema
 * This ensures type safety and consistency across all form-related code
 */
export type EditResourceFormData = z.infer<typeof editResourceSchema>;
