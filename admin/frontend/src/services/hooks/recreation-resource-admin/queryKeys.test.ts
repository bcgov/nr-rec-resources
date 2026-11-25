import { describe, expect, it } from 'vitest';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

describe('RECREATION_RESOURCE_QUERY_KEYS.exportPreview', () => {
  it('builds a stable key from request values', () => {
    const key = RECREATION_RESOURCE_QUERY_KEYS.exportPreview({
      dataset: 'resources',
      district: 'RDBO',
      resourceType: 'SIT',
      includeArchived: true,
      limit: 25,
    });

    expect(key).toEqual([
      'recreation-resource-admin',
      'exports',
      'preview',
      'resources',
      'RDBO',
      'SIT',
      true,
      25,
    ]);
  });

  it('uses safe defaults for null or undefined requests', () => {
    expect(RECREATION_RESOURCE_QUERY_KEYS.exportPreview(undefined)).toEqual([
      'recreation-resource-admin',
      'exports',
      'preview',
      '',
      '',
      '',
      false,
      0,
    ]);

    expect(RECREATION_RESOURCE_QUERY_KEYS.exportPreview(null)).toEqual([
      'recreation-resource-admin',
      'exports',
      'preview',
      '',
      '',
      '',
      false,
      0,
    ]);
  });
});
