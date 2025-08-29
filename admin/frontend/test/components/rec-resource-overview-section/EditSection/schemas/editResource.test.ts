import {
  EditResourceFormData,
  editResourceSchema,
} from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas/editResource';
import { describe, expect, it } from 'vitest';

describe('editResourceSchema', () => {
  it('accepts all fields undefined (all optional)', () => {
    const data: Partial<EditResourceFormData> = {};
    const result = editResourceSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ selected_access_options: [] });
  });

  it('accepts empty strings', () => {
    const data: EditResourceFormData = {
      maintenance_standard_code: '',
      control_access_code: '',
      status_code: '',
      selected_access_options: [],
    };
    const result = editResourceSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
  });

  it('accepts partial data', () => {
    const data: Partial<EditResourceFormData> = {
      maintenance_standard_code: 'STANDARD',
      selected_access_options: [],
    };
    const result = editResourceSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data!.maintenance_standard_code).toBe('STANDARD');
  });

  it('rejects non-string values for string fields', () => {
    const data = {
      maintenance_standard_code: 123,
      selected_access_options: [],
    } as unknown as EditResourceFormData;
    const result = editResourceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
