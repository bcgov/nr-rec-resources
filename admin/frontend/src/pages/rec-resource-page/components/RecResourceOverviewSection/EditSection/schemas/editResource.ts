import { GroupedOption } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components';
import { RecreationResourceOptionUIModel } from '@/services';
import { MultiValue } from 'react-select';
import { z } from 'zod';

/**
 * Creates the validation schema for recreation resource edit form
 * @param districtOptions - Array of district options to validate against
 * @returns Zod schema with validation rules
 */
export const createEditResourceSchema = (
  districtOptions: RecreationResourceOptionUIModel[] = [],
) => {
  return z.object({
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
    district_code: z
      .string()
      .optional()
      .nullable()
      .refine(
        (districtCode) => {
          // Allow null/undefined (no district selected)
          if (!districtCode) return true;

          // Find the selected district option
          const selectedOption = districtOptions.find(
            (opt) => opt.id === districtCode,
          );

          // If option not found, allow it (edge case - might be a new or deleted option)
          if (!selectedOption) return true;

          // check if the option is archived
          return !selectedOption.is_archived;
        },
        {
          message:
            'Cannot save with an archived district. Please select an active district.',
        },
      ),
    display_on_public_site: z.boolean().default(false),
    site_description: z.string().optional().nullable(),
    driving_directions: z.string().optional().nullable(),
    closest_community: z.string().max(200).optional().nullable(),
  });
};

/**
 * TypeScript type inferred from the Zod schema
 * This ensures type safety and consistency across all form-related code
 */
export type EditResourceFormData = z.infer<
  ReturnType<typeof createEditResourceSchema>
>;
