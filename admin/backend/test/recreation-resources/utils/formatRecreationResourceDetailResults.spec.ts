import { OPEN_STATUS } from '@/recreation-resources/recreation-resource.constants';
import { formatRecreationResourceDetailResults } from '@/recreation-resources/utils';
import { describe, expect, it } from 'vitest';

/**
 * These tests verify the public formatting behavior of
 * `formatRecreationResourceDetailResults`.
 *
 * Notes on current implementation:
 * - Accesses are returned as `accessCodes: Array<{ code, description, subAccessCodes: Array<{code,description}> }>`
 * - Maintenance is returned as `maintenance_standard` (object) when available
 * - Defaults are used for missing status and other optional fields
 */

const baseResource = {
  rec_resource_id: '123',
  name: 'Test Site',
  closest_community: 'Testville',
  recreation_site_description: { description: 'A nice place' },
  recreation_driving_direction: { description: 'Turn left' },
  // raw value stored on the resource row
  maintenance_standard_code: 'A',
  // joined metadata row that contains the description for the above code
  recreation_maintenance_standard_code: { description: 'Standard A' },
  recreation_resource_type_view_admin: [{ description: 'Campground' }],
  recreation_access: [
    {
      recreation_access_code: { access_code: 'ROAD', description: 'Road' },
      recreation_sub_access_code: {
        sub_access_code: '4W',
        description: '4 wheel drive',
      },
    },
    {
      recreation_access_code: { access_code: 'TRAIL', description: 'Trail' },
      recreation_sub_access_code: null,
    },
  ],
  recreation_activity: [
    {
      recreation_activity: {
        description: 'Hiking',
        recreation_activity_code: 1,
      },
    },
  ],
  recreation_status: {
    recreation_status_code: { description: 'Closed' },
    comment: 'Seasonal closure',
    status_code: 2,
  },
  _count: { recreation_defined_campsite: 5 },
  recreation_structure: [
    { recreation_structure_code: { description: 'Toilet' } },
    { recreation_structure_code: { description: 'Table' } },
  ],
};

const mockGeometryResult = [
  {
    spatial_feature_geometry: [
      '{"type":"Polygon","coordinates":[[[1,2],[3,4],[5,6],[1,2]]]}',
    ],
    site_point_geometry: '{"type":"Point","coordinates":[123.45,67.89]}',
  },
];

describe('formatRecreationResourceDetailResults', () => {
  it('should format a fully populated resource (happy path)', () => {
    const input = {
      ...baseResource,
      recreation_district_code: {
        description: 'District 1',
        district_code: 'D1',
      },
      recreation_risk_rating_code: {
        risk_rating_code: 'H',
        description: 'High',
      },
      recreation_control_access_code: {
        recreation_control_access_code: 'CTRL1',
        description: 'Controlled',
      },
    };

    const result = formatRecreationResourceDetailResults(
      input as any,
      mockGeometryResult,
    );

    // basic scalars
    expect(result.rec_resource_id).toBe('123');
    expect(result.name).toBe('Test Site');
    expect(result.closest_community).toBe('Testville');
    expect(result.description).toBe('A nice place');
    expect(result.driving_directions).toBe('Turn left');

    // maintenance_standard is an object when present
    expect(result.maintenance_standard).toEqual({
      maintenance_standard_code: 'A',
      description: 'Standard A',
    });

    // resource type
    expect(result.rec_resource_type).toBe('Campground');

    // accessCodes - grouped by access_code and sorted by code
    expect(result.accessCodes).toEqual([
      {
        code: 'ROAD',
        description: 'Road',
        subAccessCodes: [{ code: '4W', description: '4 wheel drive' }],
      },
      {
        code: 'TRAIL',
        description: 'Trail',
        subAccessCodes: [],
      },
    ]);

    // activities and status
    expect(result.recreation_activity).toEqual([
      { description: 'Hiking', recreation_activity_code: 1 },
    ]);
    expect(result.recreation_status).toEqual({
      description: 'Closed',
      comment: 'Seasonal closure',
      status_code: 2,
    });

    // campsite count and structure
    expect(result.campsite_count).toBe(5);
    expect(result.recreation_structure).toEqual({
      has_toilet: true,
      has_table: true,
    });

    // district, risk and control access mapping
    expect(result.recreation_district).toEqual({
      description: 'District 1',
      district_code: 'D1',
    });
    expect(result.risk_rating).toEqual({
      risk_rating_code: 'H',
      description: 'High',
    });
    expect(result.recreation_control_access_code).toEqual({
      recreation_control_access_code: 'CTRL1',
      description: 'Controlled',
    });

    // spatial geometry mapping
    expect(result.spatial_feature_geometry).toEqual([
      '{"type":"Polygon","coordinates":[[[1,2],[3,4],[5,6],[1,2]]]}',
    ]);
    expect(result.site_point_geometry).toBe(
      '{"type":"Point","coordinates":[123.45,67.89]}',
    );
  });

  it('should handle missing optional fields and use OPEN_STATUS defaults', () => {
    const input = {
      rec_resource_id: '456',
      // missing many optional fields
      maintenance_standard_code: undefined,
      recreation_maintenance_standard_code: undefined,
      recreation_resource_type_view_admin: [],
      recreation_access: undefined,
      recreation_activity: undefined,
      recreation_status: undefined,
      _count: {},
      recreation_structure: undefined,
      recreation_district_code: undefined,
    };

    const result = formatRecreationResourceDetailResults(input as any, []);

    expect(result.name).toBe('');
    expect(result.closest_community).toBe('');
    expect(result.description).toBeUndefined();
    expect(result.driving_directions).toBeUndefined();
    expect(result.maintenance_standard).toBeUndefined();
    expect(result.rec_resource_type).toBe('');
    expect(result.accessCodes).toEqual([]);
    expect(result.recreation_activity).toEqual([]);
    expect(result.recreation_status).toEqual({
      description: OPEN_STATUS.DESCRIPTION,
      comment: '',
      status_code: OPEN_STATUS.STATUS_CODE,
    });
    expect(result.campsite_count).toBe(0);
    expect(result.recreation_structure).toEqual({
      has_toilet: false,
      has_table: false,
    });
    expect(result.recreation_district).toBeUndefined();
    expect(result.risk_rating).toBeUndefined();
  });

  it('should group subAccessCodes by access code and sort accessCodes by code', () => {
    const input = {
      ...baseResource,
      recreation_access: [
        {
          recreation_access_code: { access_code: 'B', description: 'Bdesc' },
          recreation_sub_access_code: {
            sub_access_code: 'b1',
            description: 'b1',
          },
        },
        {
          recreation_access_code: { access_code: 'A', description: 'Adesc' },
          recreation_sub_access_code: {
            sub_access_code: 'a1',
            description: 'a1',
          },
        },
        {
          recreation_access_code: { access_code: 'A', description: 'Adesc' },
          recreation_sub_access_code: {
            sub_access_code: 'a2',
            description: 'a2',
          },
        },
      ],
    };

    const result = formatRecreationResourceDetailResults(input as any, []);

    // sorted by code -> A then B
    expect(result.accessCodes.map((a: any) => a.code)).toEqual(['A', 'B']);
    const a = result.accessCodes[0];
    expect(result.accessCodes.length).toBeGreaterThanOrEqual(1);
    expect(a!.subAccessCodes.map((s: any) => s.code)).toEqual(['a1', 'a2']);
  });

  it('should set has_toilet and has_table to false if recreation_structure is not an array', () => {
    const input = { ...baseResource, recreation_structure: undefined };
    const result = formatRecreationResourceDetailResults(input as any, []);
    expect(result.recreation_structure).toEqual({
      has_toilet: false,
      has_table: false,
    });
  });

  it('should set has_toilet and has_table to false if no matching descriptions', () => {
    const input = {
      ...baseResource,
      recreation_structure: [
        { recreation_structure_code: { description: 'Other' } },
      ],
    };
    const result = formatRecreationResourceDetailResults(input as any, []);
    expect(result.recreation_structure).toEqual({
      has_toilet: false,
      has_table: false,
    });
  });

  it('should set activity description to empty string if undefined', () => {
    const input = {
      ...baseResource,
      recreation_activity: [
        {
          recreation_activity: {
            description: undefined,
            recreation_activity_code: 1,
          },
        },
      ],
    };
    const result = formatRecreationResourceDetailResults(input as any, []);
    expect(result.recreation_activity).toEqual([
      { description: '', recreation_activity_code: 1 },
    ]);
  });
});
