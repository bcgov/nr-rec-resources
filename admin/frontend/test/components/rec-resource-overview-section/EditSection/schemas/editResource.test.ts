import {
  EditResourceFormData,
  createEditResourceSchema,
} from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas/editResource';
import { describe, expect, it } from 'vitest';

describe('createEditResourceSchema', () => {
  it('accepts all fields undefined (all optional)', () => {
    const schema = createEditResourceSchema();
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      selected_access_options: [],
      display_on_public_site: false,
    });
  });

  it('accepts empty strings for string fields', () => {
    const schema = createEditResourceSchema();
    const data = {
      maintenance_standard_code: '',
      control_access_code: '',
      status_code: '',
      district_code: '',
    };
    const result = schema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts partial data', () => {
    const schema = createEditResourceSchema();
    const data = {
      maintenance_standard_code: 'STANDARD',
    };
    const result = schema.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data?.maintenance_standard_code).toBe('STANDARD');
  });

  it('rejects non-string values for string fields', () => {
    const schema = createEditResourceSchema();
    const data = {
      maintenance_standard_code: 123,
    } as unknown as EditResourceFormData;
    const result = schema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it.each([
    ['string', 'CHWK', 'CHWK'],
    ['null', null, null],
  ])('accepts district_code as %s', (_, input, expected) => {
    const schema = createEditResourceSchema();
    const result = schema.safeParse({ district_code: input });
    expect(result.success).toBe(true);
    expect(result.data?.district_code).toBe(expected);
  });

  describe('district_code archived validation', () => {
    it('accepts non-archived district', () => {
      const districtOptions = [
        { id: 'CHWK', label: 'Chilliwack', is_archived: false },
        { id: 'VAN', label: 'Vancouver', is_archived: true },
      ];
      const schema = createEditResourceSchema(districtOptions);
      const result = schema.safeParse({ district_code: 'CHWK' });
      expect(result.success).toBe(true);
      expect(result.data?.district_code).toBe('CHWK');
    });

    it('rejects archived district', () => {
      const districtOptions = [
        { id: 'CHWK', label: 'Chilliwack', is_archived: false },
        { id: 'VAN', label: 'Vancouver', is_archived: true },
      ];
      const schema = createEditResourceSchema(districtOptions);
      const result = schema.safeParse({ district_code: 'VAN' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Cannot save with an archived district. Please select an active district.',
      );
    });

    it('accepts null district_code even when archived options exist', () => {
      const districtOptions = [
        { id: 'VAN', label: 'Vancouver', is_archived: true },
      ];
      const schema = createEditResourceSchema(districtOptions);
      const result = schema.safeParse({ district_code: null });
      expect(result.success).toBe(true);
      expect(result.data?.district_code).toBe(null);
    });

    it('accepts undefined district_code even when archived options exist', () => {
      const districtOptions = [
        { id: 'VAN', label: 'Vancouver', is_archived: true },
      ];
      const schema = createEditResourceSchema(districtOptions);
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.district_code).toBeUndefined();
    });

    it('accepts district_code not found in options (edge case)', () => {
      const districtOptions = [
        { id: 'CHWK', label: 'Chilliwack', is_archived: false },
      ];
      const schema = createEditResourceSchema(districtOptions);
      const result = schema.safeParse({ district_code: 'UNKNOWN' });
      expect(result.success).toBe(true);
      expect(result.data?.district_code).toBe('UNKNOWN');
    });

    it('accepts district_code when option has no is_archived property', () => {
      const districtOptions = [
        { id: 'CHWK', label: 'Chilliwack' }, // No is_archived property
      ];
      const schema = createEditResourceSchema(districtOptions);
      const result = schema.safeParse({ district_code: 'CHWK' });
      expect(result.success).toBe(true);
      expect(result.data?.district_code).toBe('CHWK');
    });
  });

  describe('project_established_date validation', () => {
    it('accepts a valid past date', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({
        project_established_date: '2023-01-15',
      });
      expect(result.success).toBe(true);
      expect(result.data?.project_established_date).toBe('2023-01-15');
    });

    it('accepts today as the project established date', () => {
      const schema = createEditResourceSchema();
      const today = new Date().toISOString().split('T')[0];
      const result = schema.safeParse({
        project_established_date: today,
      });
      expect(result.success).toBe(true);
    });

    it('rejects a future date for project_established_date', () => {
      const schema = createEditResourceSchema();
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const result = schema.safeParse({
        project_established_date: futureDateString,
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Project established date cannot be in the future',
      );
    });

    it('accepts null for project_established_date', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({
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
      const schema = createEditResourceSchema();
      const result = schema.safeParse({
        display_on_public_site: input,
      });
      expect(result.success).toBe(true);
      expect(result.data?.display_on_public_site).toBe(expected);
    });

    it('defaults to false when display_on_public_site is not provided', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({
        maintenance_standard_code: 'STANDARD',
      });
      expect(result.success).toBe(true);
      expect(result.data?.display_on_public_site).toBe(false);
    });
  });

  describe('site_description validation', () => {
    it('accepts a string for site_description', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({
        site_description: 'This is a beautiful camping site',
      });
      expect(result.success).toBe(true);
      expect(result.data?.site_description).toBe(
        'This is a beautiful camping site',
      );
    });

    it('accepts null for site_description', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({
        site_description: null,
      });
      expect(result.success).toBe(true);
      expect(result.data?.site_description).toBeNull();
    });

    it('accepts undefined for site_description', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.site_description).toBeUndefined();
    });
  });

  describe('driving_directions validation', () => {
    it('accepts a string for driving_directions', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({
        driving_directions: 'Take Highway 1 north, exit at sign',
      });
      expect(result.success).toBe(true);
      expect(result.data?.driving_directions).toBe(
        'Take Highway 1 north, exit at sign',
      );
    });

    it('accepts null for driving_directions', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({
        driving_directions: null,
      });
      expect(result.success).toBe(true);
      expect(result.data?.driving_directions).toBeNull();
    });

    it('accepts undefined for driving_directions', () => {
      const schema = createEditResourceSchema();
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.driving_directions).toBeUndefined();
    });
  });
});
