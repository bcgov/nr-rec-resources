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
  risk_rating_code: z.string().optional().nullable(),
  project_established_date: z
    .string()
    .optional()
    .nullable()
    .refine(
      (date) => {
        if (!date) return true;
        const selectedDate = new Date(date);
        const today = new Date();
        return selectedDate <= today;
      },
      {
        message: 'Project established date cannot be in the future',
      },
    ),
  status_code: z.string().optional(),
  selected_access_options: z.custom<MultiValue<GroupedOption>>().default([]),
  district_code: z.string().optional().nullable(),
});

/**
 * TypeScript type inferred from the Zod schema
 * This ensures type safety and consistency across all form-related code
 */
export type EditResourceFormData = z.infer<typeof editResourceSchema>;
