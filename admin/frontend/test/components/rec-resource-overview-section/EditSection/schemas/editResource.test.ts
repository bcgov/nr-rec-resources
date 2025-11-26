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

  describe('project_established_date validation', () => {
    it('accepts a valid past date', () => {
      const data: Partial<EditResourceFormData> = {
        project_established_date: '2023-01-15',
        selected_access_options: [],
      };
      const result = editResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data!.project_established_date).toBe('2023-01-15');
    });

    it('accepts today as the project established date', () => {
      const today = new Date().toISOString().split('T')[0];
      const data: Partial<EditResourceFormData> = {
        project_established_date: today,
        selected_access_options: [],
      };
      const result = editResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects a future date for project_established_date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const data: Partial<EditResourceFormData> = {
        project_established_date: futureDateString,
        selected_access_options: [],
      };
      const result = editResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Project established date cannot be in the future',
        );
      }
    });

    it('accepts null for project_established_date', () => {
      const data = {
        project_established_date: null,
        selected_access_options: [],
      } as Partial<EditResourceFormData>;
      const result = editResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts undefined for project_established_date', () => {
      const data: Partial<EditResourceFormData> = {
        project_established_date: undefined,
        selected_access_options: [],
      };
      const result = editResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
