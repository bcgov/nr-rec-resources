import { EditResourceFormData } from './schemas';

export const CLOSEST_COMMUNITY_MAX_LENGTH = 200;
export const NAME_MAX_LENGTH = 200;

/**
 * Map of form field names to human-readable labels for error messages.
 */
export const EDIT_RESOURCE_FIELD_LABEL_MAP: Record<
  keyof EditResourceFormData,
  string
> = {
  closest_community: 'Closest community',
  name: 'Name',
  status_code: 'Status',
  maintenance_standard_code: 'Maintenance standard',
  control_access_code: 'Controlled access type',
  district_code: 'Recreation district',
  risk_rating_code: 'Risk rating',
  project_established_date: 'Project established date',
  selected_access_options: 'Access and sub-access',
  display_on_public_site: 'Displayed on public site',
  site_description: 'Site description',
  driving_directions: 'Driving directions',
} as const;
