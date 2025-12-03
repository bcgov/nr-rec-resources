import * as helpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('mapRecreationResourceDetail', () => {
  it('should map descriptions correctly for maintained resource', () => {
    const input = {
      rec_resource_id: '1',
      maintenance_standard: {
        maintenance_standard_code: 'U',
        description: 'Maintained',
      },
      recreation_district: { description: 'District A' },
      recreation_status: { description: 'Open' },
      risk_rating: { risk_rating_code: 'H', description: 'High' },
    };
    const result = helpersModule.mapRecreationResourceDetail(input as any);
    expect(result.maintenance_standard_description).toBe('Maintained');
    expect(result.recreation_district_description).toBe('District A');
    expect(result.recreation_status_description).toBe('Open');
    expect(result.risk_rating_description).toBe('High');
  });

  it('should map descriptions correctly for user maintained resource', () => {
    const input = {
      rec_resource_id: '2',
      maintenance_standard: {
        maintenance_standard_code: 'X',
        description: 'User Maintained',
      },
      recreation_district: { description: 'District B' },
      recreation_status: { description: 'Closed' },
    };
    const result = helpersModule.mapRecreationResourceDetail(input as any);
    expect(result.maintenance_standard_description).toBe('User Maintained');
    expect(result.recreation_district_description).toBe('District B');
    expect(result.recreation_status_description).toBe('Closed');
  });

  it('should map descriptions correctly for M maintenance code', () => {
    const input = {
      rec_resource_id: '2b',
      maintenance_standard: {
        maintenance_standard_code: 'M',
        description: 'User Maintained',
      },
      recreation_district: { description: 'District B2' },
      recreation_status: { description: 'Closed' },
    };
    const result = helpersModule.mapRecreationResourceDetail(input as any);
    expect(result.maintenance_standard_description).toBe('User Maintained');
    expect(result.recreation_district_description).toBe('District B2');
    expect(result.recreation_status_description).toBe('Closed');
  });

  it('should handle missing nested descriptions', () => {
    const input = {
      rec_resource_id: '3',
      maintenance_standard: {
        maintenance_standard_code: 'U',
        description: 'Maintained',
      },
      recreation_district: undefined,
      recreation_status: null,
      risk_rating: undefined,
    };
    const result = helpersModule.mapRecreationResourceDetail(input as any);
    expect(result.maintenance_standard_description).toBe('Maintained');
    expect(result.recreation_district_description).toBeUndefined();
    expect(result.recreation_status_description).toBeUndefined();
    expect(result.risk_rating_description).toBeUndefined();
  });

  it('should format project established date with UTC timezone', () => {
    const input = {
      rec_resource_id: '4',
      maintenance_standard: {
        maintenance_standard_code: 'U',
        description: 'Maintained',
      },
      project_established_date: '2023-06-15T10:30:00Z',
      recreation_district: { description: 'District C' },
      recreation_status: { description: 'Open' },
    };
    const result = helpersModule.mapRecreationResourceDetail(input as any);
    expect(result.project_established_date_readable_utc).toBeDefined();
    expect(typeof result.project_established_date_readable_utc).toBe('string');
  });

  it('should handle null/undefined project_established_date', () => {
    const inputWithNull = {
      rec_resource_id: '5',
      maintenance_standard: {
        maintenance_standard_code: 'U',
        description: 'Maintained',
      },
      project_established_date: null,
    };
    const inputWithUndefined = {
      rec_resource_id: '6',
      maintenance_standard: {
        maintenance_standard_code: 'U',
        description: 'Maintained',
      },
      project_established_date: undefined,
    };

    const resultNull = helpersModule.mapRecreationResourceDetail(
      inputWithNull as any,
    );
    const resultUndefined = helpersModule.mapRecreationResourceDetail(
      inputWithUndefined as any,
    );

    expect(resultNull.project_established_date_readable_utc).toBeDefined();
    expect(resultUndefined.project_established_date_readable_utc).toBeDefined();
  });

  it('should handle null/undefined maintenance_standard', () => {
    const inputWithNull = {
      rec_resource_id: '7',
      maintenance_standard: null,
      recreation_district: { description: 'District D' },
    };
    const inputWithUndefined = {
      rec_resource_id: '8',
      maintenance_standard: undefined,
      recreation_district: { description: 'District E' },
    };

    const resultNull = helpersModule.mapRecreationResourceDetail(
      inputWithNull as any,
    );
    const resultUndefined = helpersModule.mapRecreationResourceDetail(
      inputWithUndefined as any,
    );

    expect(resultNull.maintenance_standard_description).toBeUndefined();
    expect(resultUndefined.maintenance_standard_description).toBeUndefined();
  });

  it('should preserve all original properties in the result', () => {
    const input = {
      rec_resource_id: '9',
      name: 'Test Resource',
      description: 'A test recreation resource',
      maintenance_standard: {
        maintenance_standard_code: 'U',
        description: 'Maintained',
      },
      closest_community: 'Test Community',
      recreation_activity: [{ code: 'HIKE', description: 'Hiking' }],
      recreation_district: { description: 'District F' },
      recreation_status: { description: 'Open' },
      project_established_date: '2023-06-15T10:30:00Z',
    };

    const result = helpersModule.mapRecreationResourceDetail(input as any);

    // Check that all original properties are preserved
    expect(result.rec_resource_id).toBe(input.rec_resource_id);
    expect(result.name).toBe(input.name);
    expect(result.description).toBe(input.description);
    expect(result.closest_community).toBe(input.closest_community);
    expect(result.recreation_activity).toBe(input.recreation_activity);
    expect(result.recreation_district).toBe(input.recreation_district);
    expect(result.recreation_status).toBe(input.recreation_status);
    expect(result.project_established_date).toBe(
      input.project_established_date,
    );

    // Check that new properties are added
    expect(result.maintenance_standard_description).toBe('Maintained');
    expect(result.recreation_district_description).toBe('District F');
    expect(result.recreation_status_description).toBe('Open');
    expect(result.project_established_date_readable_utc).toBeDefined();
  });

  it('should handle empty objects for nested properties', () => {
    const input = {
      rec_resource_id: '10',
      maintenance_standard_code: 'U',
      recreation_district: {},
      recreation_status: {},
      risk_rating: {},
    };

    const result = helpersModule.mapRecreationResourceDetail(input as any);
    expect(result.recreation_district_description).toBeUndefined();
    expect(result.recreation_status_description).toBeUndefined();
    expect(result.risk_rating_description).toBeUndefined();
  });
});

describe('transformRecreationResourceDocs', () => {
  it('should prepend base path to each doc url', () => {
    vi.stubEnv('VITE_RECREATION_RESOURCE_ASSETS_BASE_URL', undefined);
    const docs = [
      { id: 1, url: 'file1.pdf' },
      { id: 2, url: 'file2.pdf' },
    ];

    const result = helpersModule.transformRecreationResourceDocs(docs as any);
    expect(result).toEqual([
      {
        id: 1,
        url: 'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/file1.pdf',
      },
      {
        id: 2,
        url: 'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/file2.pdf',
      },
    ]);
  });

  it('should return empty array if input is empty', () => {
    expect(helpersModule.transformRecreationResourceDocs([])).toEqual([]);
  });
});

describe('transformRecreationResourceImages', () => {
  it('should prepend base path to each image variant url', () => {
    vi.stubEnv('VITE_RECREATION_RESOURCE_ASSETS_BASE_URL', undefined);
    const images = [
      {
        id: 1,
        recreation_resource_image_variants: [
          { id: 1, url: 'image1-small.jpg' },
          { id: 2, url: 'image1-large.jpg' },
        ],
      },
      {
        id: 2,
        recreation_resource_image_variants: [
          { id: 3, url: 'image2-small.jpg' },
        ],
      },
    ];

    const result = helpersModule.transformRecreationResourceImages(
      images as any,
    );
    expect(result).toEqual([
      {
        id: 1,
        recreation_resource_image_variants: [
          {
            id: 1,
            url: 'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/image1-small.jpg',
          },
          {
            id: 2,
            url: 'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/image1-large.jpg',
          },
        ],
      },
      {
        id: 2,
        recreation_resource_image_variants: [
          {
            id: 3,
            url: 'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/image2-small.jpg',
          },
        ],
      },
    ]);
  });

  it('should handle images without variants', () => {
    const images = [
      { id: 1, recreation_resource_image_variants: undefined },
      { id: 2, recreation_resource_image_variants: null },
    ];

    const result = helpersModule.transformRecreationResourceImages(
      images as any,
    );
    expect(result).toEqual([
      { id: 1, recreation_resource_image_variants: undefined },
      { id: 2, recreation_resource_image_variants: undefined }, // null becomes undefined due to optional chaining
    ]);
  });

  it('should return empty array if input is empty', () => {
    expect(helpersModule.transformRecreationResourceImages([])).toEqual([]);
  });
});

describe('getBasePathForAssets', () => {
  it('should return the env var if set', () => {
    vi.stubEnv('VITE_RECREATION_RESOURCE_ASSETS_BASE_URL', 'https://env-url');
    expect(helpersModule.getBasePathForAssets()).toBe('https://env-url');
  });

  it('should return the default if env var is not set', () => {
    vi.stubEnv('VITE_RECREATION_RESOURCE_ASSETS_BASE_URL', undefined);
    expect(helpersModule.getBasePathForAssets()).toBe(
      'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca',
    );
  });
});

describe('mapRecreationFee', () => {
  it('should map fee with both start and end dates', () => {
    const input = {
      fee_amount: 15,
      fee_start_date: new Date('2024-06-01T00:00:00Z'),
      fee_end_date: new Date('2024-09-30T00:00:00Z'),
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result.fee_start_date_readable_utc).toBeDefined();
    expect(result.fee_end_date_readable_utc).toBeDefined();
    expect(typeof result.fee_start_date_readable_utc).toBe('string');
    expect(typeof result.fee_end_date_readable_utc).toBe('string');
    expect(result.fee_start_date_readable_utc).not.toBeNull();
    expect(result.fee_end_date_readable_utc).not.toBeNull();
  });

  it('should format dates with UTC timezone', () => {
    const input = {
      fee_amount: 20,
      fee_start_date: new Date('2024-05-15T10:30:00Z'),
      fee_end_date: new Date('2024-10-15T14:45:00Z'),
      recreation_fee_code: 'D',
      fee_type_description: 'Day use',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    // Verify dates are formatted (should be readable format like "May 15, 2024")
    expect(result.fee_start_date_readable_utc).toMatch(/\w{3} \d{1,2}, \d{4}/);
    expect(result.fee_end_date_readable_utc).toMatch(/\w{3} \d{1,2}, \d{4}/);
  });

  it('should handle null start date', () => {
    const input = {
      fee_amount: 10,
      fee_start_date: null,
      fee_end_date: new Date('2024-09-30T00:00:00Z'),
      recreation_fee_code: 'H',
      fee_type_description: 'Hiking',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result.fee_start_date_readable_utc).toBeNull();
    expect(result.fee_end_date_readable_utc).toBeDefined();
    expect(typeof result.fee_end_date_readable_utc).toBe('string');
  });

  it('should handle null end date', () => {
    const input = {
      fee_amount: 25,
      fee_start_date: new Date('2024-06-01T00:00:00Z'),
      fee_end_date: null,
      recreation_fee_code: 'P',
      fee_type_description: 'Parking',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result.fee_start_date_readable_utc).toBeDefined();
    expect(typeof result.fee_start_date_readable_utc).toBe('string');
    expect(result.fee_end_date_readable_utc).toBeNull();
  });

  it('should handle undefined start date', () => {
    const input = {
      fee_amount: 12,
      fee_start_date: undefined,
      fee_end_date: new Date('2024-09-30T00:00:00Z'),
      recreation_fee_code: 'T',
      fee_type_description: 'Trail',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result.fee_start_date_readable_utc).toBeNull();
    expect(result.fee_end_date_readable_utc).toBeDefined();
  });

  it('should handle undefined end date', () => {
    const input = {
      fee_amount: 18,
      fee_start_date: new Date('2024-06-01T00:00:00Z'),
      fee_end_date: undefined,
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result.fee_start_date_readable_utc).toBeDefined();
    expect(result.fee_end_date_readable_utc).toBeNull();
  });

  it('should handle both dates as null', () => {
    const input = {
      fee_amount: 5,
      fee_start_date: null,
      fee_end_date: null,
      recreation_fee_code: 'D',
      fee_type_description: 'Day use',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result.fee_start_date_readable_utc).toBeNull();
    expect(result.fee_end_date_readable_utc).toBeNull();
  });

  it('should preserve all original properties', () => {
    const input = {
      fee_amount: 30,
      fee_start_date: new Date('2024-07-01T00:00:00Z'),
      fee_end_date: new Date('2024-08-31T00:00:00Z'),
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'N',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result.fee_amount).toBe(input.fee_amount);
    expect(result.fee_start_date).toBe(input.fee_start_date);
    expect(result.fee_end_date).toBe(input.fee_end_date);
    expect(result.recreation_fee_code).toBe(input.recreation_fee_code);
    expect(result.fee_type_description).toBe(input.fee_type_description);
    expect(result.monday_ind).toBe(input.monday_ind);
    expect(result.tuesday_ind).toBe(input.tuesday_ind);
    expect(result.wednesday_ind).toBe(input.wednesday_ind);
    expect(result.thursday_ind).toBe(input.thursday_ind);
    expect(result.friday_ind).toBe(input.friday_ind);
    expect(result.saturday_ind).toBe(input.saturday_ind);
    expect(result.sunday_ind).toBe(input.sunday_ind);
  });

  it('should handle date strings', () => {
    const input = {
      fee_amount: 15,
      fee_start_date: '2024-06-01T00:00:00Z',
      fee_end_date: '2024-09-30T00:00:00Z',
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result.fee_start_date_readable_utc).toBeDefined();
    expect(result.fee_end_date_readable_utc).toBeDefined();
    expect(typeof result.fee_start_date_readable_utc).toBe('string');
    expect(typeof result.fee_end_date_readable_utc).toBe('string');
  });

  it('should add readable date fields to the result', () => {
    const input = {
      fee_amount: 20,
      fee_start_date: new Date('2024-05-15T00:00:00Z'),
      fee_end_date: new Date('2024-10-15T00:00:00Z'),
      recreation_fee_code: 'D',
      fee_type_description: 'Day use',
    };

    const result = helpersModule.mapRecreationFee(input as any);

    expect(result).toHaveProperty('fee_start_date_readable_utc');
    expect(result).toHaveProperty('fee_end_date_readable_utc');
    expect(result.fee_start_date_readable_utc).not.toBeUndefined();
    expect(result.fee_end_date_readable_utc).not.toBeUndefined();
  });
});

describe('createRetryHandler', () => {
  // Manual mock for onFail callback
  const onFailMock = () => {
    (onFailMock as any).called = true;
  };
  onFailMock.called = false;

  it('retries for 5xx errors up to maxRetries', () => {
    const handler = helpersModule.createRetryHandler({ maxRetries: 2 });
    const error = { response: { status: 502 } };
    expect(handler(0, error)).toBe(true);
    expect(handler(1, error)).toBe(true);
    expect(handler(2, error)).toBe(false);
  });

  it('does not retry for 4xx errors', () => {
    const handler = helpersModule.createRetryHandler();
    const error = { response: { status: 404 } };
    expect(handler(0, error)).toBe(false);
  });

  it('does not retry if error has no response', () => {
    const handler = helpersModule.createRetryHandler();
    const error = new Error('Network error');
    expect(handler(0, error)).toBe(false);
  });

  it('calls onFail when retries are exhausted', () => {
    onFailMock.called = false;
    const handler = helpersModule.createRetryHandler({
      maxRetries: 1,
      onFail: onFailMock,
    });
    const error = { response: { status: 502 } };
    expect(handler(1, error)).toBe(false);
    expect(onFailMock.called).toBe(true);
  });

  it('returns false for non-object errors', () => {
    const handler = helpersModule.createRetryHandler();
    expect(handler(0, null)).toBe(false);
    expect(handler(0, undefined)).toBe(false);
    expect(handler(0, 123)).toBe(false);
  });
});
