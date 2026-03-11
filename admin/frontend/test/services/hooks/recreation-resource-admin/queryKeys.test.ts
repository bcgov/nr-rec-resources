import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';

describe('RECREATION_RESOURCE_QUERY_KEYS', () => {
  it('builds stable keys for export datasets and previews', () => {
    expect(RECREATION_RESOURCE_QUERY_KEYS.exportDatasets()).toEqual([
      'recreation-resource-admin',
      'exports',
      'datasets',
    ]);

    expect(
      RECREATION_RESOURCE_QUERY_KEYS.exportPreview({
        dataset: 'file-details',
        district: 'RDKA',
        resourceType: 'SIT',
        limit: 50,
      }),
    ).toEqual([
      'recreation-resource-admin',
      'exports',
      'preview',
      'file-details',
      'RDKA',
      'SIT',
      50,
    ]);
  });

  it('uses fallback values for optional preview fields', () => {
    expect(RECREATION_RESOURCE_QUERY_KEYS.exportPreview(null)).toEqual([
      'recreation-resource-admin',
      'exports',
      'preview',
      '',
      '',
      '',
      0,
    ]);
  });

  it('builds option and detail keys', () => {
    expect(RECREATION_RESOURCE_QUERY_KEYS.detail('abc')).toEqual([
      'recreation-resource-admin',
      'detail',
      'abc',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.options(['district'])).toEqual([
      'recreation-resource-options',
      'district',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.images('abc')).toEqual([
      'recreation-resource-admin',
      'images',
      'abc',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.documents('abc')).toEqual([
      'recreation-resource-admin',
      'documents',
      'abc',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.activities('abc')).toEqual([
      'recreation-resource-admin',
      'activities',
      'abc',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.features('abc')).toEqual([
      'recreation-resource-admin',
      'features',
      'abc',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.fees('abc')).toEqual([
      'recreation-resource-admin',
      'fees',
      'abc',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.geospatial('abc')).toEqual([
      'recreation-resource-admin',
      'geospatial',
      'abc',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.reservation('abc')).toEqual([
      'recreation-resource-admin',
      'reservation',
      'abc',
    ]);
    expect(RECREATION_RESOURCE_QUERY_KEYS.all).toEqual([
      'recreation-resource-admin',
    ]);
  });
});
