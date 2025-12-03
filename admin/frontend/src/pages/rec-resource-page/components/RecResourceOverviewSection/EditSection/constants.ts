import { EditResourceFormData } from './schemas';

/**
 * Map of form field names to human-readable labels for error messages.
 */
export const EDIT_RESOURCE_FIELD_LABEL_MAP: Record<
  keyof EditResourceFormData,
  string
> = {
  status_code: 'Status',
  maintenance_standard_code: 'Maintenance Standard',
  control_access_code: 'Controlled Access Type',
  district_code: 'Recreation District',
  risk_rating_code: 'Risk Rating',
  project_established_date: 'Project Established Date',
  selected_access_options: 'Access and Sub-Access',
  display_on_public_site: 'Displayed on public site',
} as const;
