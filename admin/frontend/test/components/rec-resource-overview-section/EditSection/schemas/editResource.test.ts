import {
  EditResourceFormData,
  editResourceSchema,
} from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas/editResource';
import { describe, expect, it } from 'vitest';

describe('editResourceSchema', () => {
  it('accepts all fields undefined (all optional)', () => {
    const result = editResourceSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      selected_access_options: [],
      display_on_public_site: false,
    });
  });

  it('accepts empty strings for string fields', () => {
    const data = {
      maintenance_standard_code: '',
      control_access_code: '',
      status_code: '',
      district_code: '',
    };
    const result = editResourceSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts partial data', () => {
    const data = {
      maintenance_standard_code: 'STANDARD',
    };
    const result = editResourceSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data?.maintenance_standard_code).toBe('STANDARD');
  });

  it('rejects non-string values for string fields', () => {
    const data = {
      maintenance_standard_code: 123,
    } as unknown as EditResourceFormData;
    const result = editResourceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it.each([
    ['string', 'CHWK', 'CHWK'],
    ['null', null, null],
  ])('accepts district_code as %s', (_, input, expected) => {
    const result = editResourceSchema.safeParse({ district_code: input });
    expect(result.success).toBe(true);
    expect(result.data?.district_code).toBe(expected);
  });

  describe('project_established_date validation', () => {
    it('accepts a valid past date', () => {
      const result = editResourceSchema.safeParse({
        project_established_date: '2023-01-15',
      });
      expect(result.success).toBe(true);
      expect(result.data?.project_established_date).toBe('2023-01-15');
    });

    it('accepts today as the project established date', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = editResourceSchema.safeParse({
        project_established_date: today,
      });
      expect(result.success).toBe(true);
    });

    it('rejects a future date for project_established_date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const result = editResourceSchema.safeParse({
        project_established_date: futureDateString,
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Project established date cannot be in the future',
      );
    });

    it('accepts null for project_established_date', () => {
      const result = editResourceSchema.safeParse({
        project_established_date: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('display_on_public_site validation', () => {
    it.each([
      [true, true],
      [false, false],
    ])('accepts %s for display_on_public_site', (input, expected) => {
      const result = editResourceSchema.safeParse({
        display_on_public_site: input,
      });
      expect(result.success).toBe(true);
      expect(result.data?.display_on_public_site).toBe(expected);
    });

    it('defaults to false when display_on_public_site is not provided', () => {
      const result = editResourceSchema.safeParse({
        maintenance_standard_code: 'STANDARD',
      });
      expect(result.success).toBe(true);
      expect(result.data?.display_on_public_site).toBe(false);
    });
  });
});
