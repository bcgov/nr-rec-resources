import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BcgwService } from './bcgw.service';
import { PrismaService } from 'src/prisma.service';

const makeLineRow = (
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> => ({
  rmf_skey: 1001,
  forest_file_id: 'REC4531',
  section_id: '15',
  recreation_map_feature_code: 'RTR',
  project_type: 'Recreation Trail',
  retirement_date: null,
  amendment_id: 2,
  map_label: 'REC4531 15',
  project_name: 'OKEOVER TRAILS',
  recreation_feature_code: 'H3',
  resource_feature_ind: 'N',
  right_of_way: '10.0',
  arch_impact_assess_ind: 'Y',
  site_location: 'POWELL RIVER',
  project_established_date: new Date('2005-06-01'),
  recreation_view_ind: 'Y',
  recreation_district_code: 'RDPW',
  defined_campsites: BigInt(0),
  life_cycle_status_code: 'ACTIVE',
  file_status_code: 'HI',
  district_code: 'DCC',
  district_name: 'DCC',
  feature_length: '0.3338',
  feature_length_m: '333.8',
  geometry:
    '{"type":"LineString","coordinates":[[-123.0935,55.3237],[-123.1,55.33]]}',
  total_count: 1,
  ...overrides,
});

const makePolyRow = (
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> => ({
  rmf_skey: 2001,
  forest_file_id: 'REC0054',
  section_id: null,
  recreation_map_feature_code: 'SIT',
  project_type: 'Recreation Site',
  retirement_date: null,
  amendment_id: 1,
  map_label: 'REC0054',
  project_name: 'CHILLIWACK LAKE',
  recreation_feature_code: 'E5',
  resource_feature_ind: 'N',
  arch_impact_assess_ind: 'Y',
  site_location: 'CHILLIWACK',
  project_established_date: new Date('2001-03-15'),
  recreation_view_ind: 'Y',
  recreation_district_code: 'RDCC',
  defined_campsites: BigInt(0),
  life_cycle_status_code: 'ACTIVE',
  file_status_code: 'HI',
  geographic_district_code: 'DCC',
  geographic_district_name: 'Chilliwack Natural Resource District',
  feature_area: '2.9634',
  feature_perimeter: '1.0079',
  feature_area_sqm: '29634.357175518',
  feature_length_m: '1007.9',
  geometry:
    '{"type":"Polygon","coordinates":[[[-121.9,49.6],[-121.85,49.6],[-121.85,49.65],[-121.9,49.65],[-121.9,49.6]]]}',
  total_count: 1,
  ...overrides,
});

const makeRow = (
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> => ({
  forest_file_id: 'REC204117',
  project_name: 'Aileen Lake',
  project_type_code: 'SIT - Recreation site',
  project_type: 'SIT',
  project_established_date: new Date('2000-01-01'),
  closure_ind: 'N',
  closure_date: null,
  closure_type: null,
  closure_comment: null,
  recreation_view_ind: 'Y',
  file_status_st: 'HI',
  status_description: 'HI - Issued',
  site_location: 'PEMBERTON',
  defined_campsites: BigInt(5),
  site_description_brief: 'Elevation 1555m',
  arch_impact_assess_ind: 'Y',
  tenure_app_total_area: 1.5,
  tenure_app_total_length: null,
  site_description: 'A beautiful lake site.',
  site_description_date: new Date('2020-06-15'),
  driving_directions: 'Turn left at the fork.',
  driving_directions_date: new Date('2019-03-10'),
  rec_feature_code: 'B2',
  rec_feature_description: 'B2 - Sand Beach',
  recreation_district_code: 'RDPG',
  recreation_district_name: 'Prince George-Mackenzie',
  org_unit_code: 'DPG',
  org_unit_name: 'Prince George Natural Resource District',
  utm_zone: 10,
  utm_easting: 500000,
  utm_northing: 6000000,
  latitude: 54.123,
  longitude: -123.456,
  shape: '{"type":"Point","coordinates":[-123.456,54.123]}',
  total_count: 1,
  ...overrides,
});

describe('BcgwService', () => {
  let service: BcgwService;
  let prisma: { $queryRawTyped: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = { $queryRawTyped: vi.fn() };
    service = new BcgwService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('returns a GeoJSON FeatureCollection', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makeRow()]);

      const result = await service.findAll(1);

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        totalPages: 1,
        pageSize: BcgwService.PAGE_SIZE,
      });
    });

    it('returns empty FeatureCollection when no rows', async () => {
      prisma.$queryRawTyped.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result.features).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('clamps page to minimum 1', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makeRow()]);

      const result = await service.findAll(0);

      expect(result.meta.page).toBe(1);
    });

    it('computes correct offset for page 2', async () => {
      prisma.$queryRawTyped.mockResolvedValue([]);
      await service.findAll(2);

      const [typedQuery] = prisma.$queryRawTyped.mock.calls[0];
      expect(typedQuery.values).toEqual([
        BcgwService.PAGE_SIZE,
        BcgwService.PAGE_SIZE,
      ]);
    });

    it('calculates totalPages correctly across multiple pages', async () => {
      const rows = [makeRow({ total_count: 2500 })];
      prisma.$queryRawTyped.mockResolvedValue(rows);

      const result = await service.findAll(1);

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('toFeature (via findAll)', () => {
    it('maps all properties correctly', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makeRow()]);

      const { features } = await service.findAll(1);
      const { properties } = features[0];

      expect(properties.forest_file_id).toBe('REC204117');
      expect(properties.defined_campsites).toBe(5);
      expect(properties.arch_impact_assess_ind).toBe('Y');
      expect(properties.site_description_date).toEqual(new Date('2020-06-15'));
      expect(properties.driving_directions_date).toEqual(
        new Date('2019-03-10'),
      );
    });

    it('converts bigint defined_campsites to number', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeRow({ defined_campsites: BigInt(42) }),
      ]);

      const { features } = await service.findAll(1);

      expect(typeof features[0].properties.defined_campsites).toBe('number');
      expect(features[0].properties.defined_campsites).toBe(42);
    });

    it('converts string tenure totals to numbers', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeRow({
          tenure_app_total_area: '5.8969',
          tenure_app_total_length: '1.1118',
        }),
      ]);

      const { features } = await service.findAll(1);
      const { properties } = features[0];

      expect(typeof properties.tenure_app_total_area).toBe('number');
      expect(properties.tenure_app_total_area).toBe(5.8969);
      expect(typeof properties.tenure_app_total_length).toBe('number');
      expect(properties.tenure_app_total_length).toBe(1.1118);
    });

    it('preserves null tenure totals', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeRow({ tenure_app_total_area: null, tenure_app_total_length: null }),
      ]);

      const { features } = await service.findAll(1);
      const { properties } = features[0];

      expect(properties.tenure_app_total_area).toBeNull();
      expect(properties.tenure_app_total_length).toBeNull();
    });

    it('parses shape JSON into geometry object', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makeRow()]);

      const { features } = await service.findAll(1);

      expect(features[0].geometry).toEqual({
        type: 'Point',
        coordinates: [-123.456, 54.123],
      });
    });

    it('sets geometry to null when shape is null', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makeRow({ shape: null })]);

      const { features } = await service.findAll(1);

      expect(features[0].geometry).toBeNull();
    });
  });

  describe('findAllLines', () => {
    it('returns a GeoJSON FeatureCollection', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makeLineRow()]);

      const result = await service.findAllLines(1);

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        totalPages: 1,
        pageSize: BcgwService.PAGE_SIZE,
      });
    });

    it('returns empty FeatureCollection when no rows', async () => {
      prisma.$queryRawTyped.mockResolvedValue([]);

      const result = await service.findAllLines(1);

      expect(result.features).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('converts string numeric fields to numbers', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeLineRow({
          right_of_way: '10.0',
          feature_length: '0.3338',
          feature_length_m: '333.8',
        }),
      ]);

      const { features } = await service.findAllLines(1);
      const { properties } = features[0];

      expect(typeof properties.right_of_way).toBe('number');
      expect(properties.right_of_way).toBe(10.0);
      expect(typeof properties.feature_length).toBe('number');
      expect(properties.feature_length).toBe(0.3338);
      expect(typeof properties.feature_length_m).toBe('number');
      expect(properties.feature_length_m).toBe(333.8);
    });

    it('preserves null numeric fields', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeLineRow({
          right_of_way: null,
          feature_length: null,
          feature_length_m: null,
        }),
      ]);

      const { features } = await service.findAllLines(1);
      const { properties } = features[0];

      expect(properties.right_of_way).toBeNull();
      expect(properties.feature_length).toBeNull();
      expect(properties.feature_length_m).toBeNull();
    });

    it('converts bigint defined_campsites to number', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeLineRow({ defined_campsites: BigInt(3) }),
      ]);

      const { features } = await service.findAllLines(1);

      expect(typeof features[0].properties.defined_campsites).toBe('number');
      expect(features[0].properties.defined_campsites).toBe(3);
    });

    it('parses geometry JSON into geometry object', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makeLineRow()]);

      const { features } = await service.findAllLines(1);

      expect(features[0].geometry).toEqual({
        type: 'LineString',
        coordinates: [
          [-123.0935, 55.3237],
          [-123.1, 55.33],
        ],
      });
    });

    it('sets geometry to null when geometry is null', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeLineRow({ geometry: null }),
      ]);

      const { features } = await service.findAllLines(1);

      expect(features[0].geometry).toBeNull();
    });

    it('maps all properties correctly', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makeLineRow()]);

      const { features } = await service.findAllLines(1);
      const { properties } = features[0];

      expect(properties.rmf_skey).toBe(1001);
      expect(properties.forest_file_id).toBe('REC4531');
      expect(properties.map_label).toBe('REC4531 15');
      expect(properties.life_cycle_status_code).toBe('ACTIVE');
      expect(properties.district_code).toBe('DCC');
      expect(properties.district_name).toBe('DCC');
    });
  });

  describe('findAllPolygons', () => {
    it('returns a GeoJSON FeatureCollection', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makePolyRow()]);

      const result = await service.findAllPolygons(1);

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        totalPages: 1,
        pageSize: BcgwService.PAGE_SIZE,
      });
    });

    it('returns empty FeatureCollection when no rows', async () => {
      prisma.$queryRawTyped.mockResolvedValue([]);

      const result = await service.findAllPolygons(1);

      expect(result.features).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('converts string numeric fields to numbers', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makePolyRow({
          feature_area: '2.9634',
          feature_perimeter: '1.0079',
          feature_length_m: '1007.9',
        }),
      ]);

      const { features } = await service.findAllPolygons(1);
      const { properties } = features[0];

      expect(typeof properties.feature_area).toBe('number');
      expect(properties.feature_area).toBe(2.9634);
      expect(typeof properties.feature_perimeter).toBe('number');
      expect(properties.feature_perimeter).toBe(1.0079);
      expect(typeof properties.feature_length_m).toBe('number');
      expect(properties.feature_length_m).toBe(1007.9);
    });

    it('preserves null numeric fields', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makePolyRow({
          feature_area: null,
          feature_perimeter: null,
          feature_length_m: null,
        }),
      ]);

      const { features } = await service.findAllPolygons(1);
      const { properties } = features[0];

      expect(properties.feature_area).toBeNull();
      expect(properties.feature_perimeter).toBeNull();
      expect(properties.feature_length_m).toBeNull();
    });

    it('passes feature_area_sqm through as a string', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makePolyRow({ feature_area_sqm: '29634.357175518' }),
      ]);

      const { features } = await service.findAllPolygons(1);
      const { properties } = features[0];

      expect(typeof properties.feature_area_sqm).toBe('string');
      expect(properties.feature_area_sqm).toBe('29634.357175518');
    });

    it('converts bigint defined_campsites to number', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makePolyRow({ defined_campsites: BigInt(5) }),
      ]);

      const { features } = await service.findAllPolygons(1);

      expect(typeof features[0].properties.defined_campsites).toBe('number');
      expect(features[0].properties.defined_campsites).toBe(5);
    });

    it('parses geometry JSON into geometry object', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makePolyRow()]);

      const { features } = await service.findAllPolygons(1);

      expect(features[0].geometry).toEqual({
        type: 'Polygon',
        coordinates: [
          [
            [-121.9, 49.6],
            [-121.85, 49.6],
            [-121.85, 49.65],
            [-121.9, 49.65],
            [-121.9, 49.6],
          ],
        ],
      });
    });

    it('sets geometry to null when geometry is null', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makePolyRow({ geometry: null }),
      ]);

      const { features } = await service.findAllPolygons(1);

      expect(features[0].geometry).toBeNull();
    });

    it('maps all properties correctly', async () => {
      prisma.$queryRawTyped.mockResolvedValue([makePolyRow()]);

      const { features } = await service.findAllPolygons(1);
      const { properties } = features[0];

      expect(properties.rmf_skey).toBe(2001);
      expect(properties.forest_file_id).toBe('REC0054');
      expect(properties.map_label).toBe('REC0054');
      expect(properties.life_cycle_status_code).toBe('ACTIVE');
      expect(properties.geographic_district_code).toBe('DCC');
      expect(properties.geographic_district_name).toBe(
        'Chilliwack Natural Resource District',
      );
    });
  });

  describe('toFeature (via findAll)', () => {
    it('sets closure_ind to N when no closure', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeRow({ closure_ind: 'N', closure_date: null, closure_type: null }),
      ]);

      const { features } = await service.findAll(1);
      const { properties } = features[0];

      expect(properties.closure_ind).toBe('N');
      expect(properties.closure_date).toBeNull();
      expect(properties.closure_type).toBeNull();
    });

    it('maps closure fields when resource is closed', async () => {
      prisma.$queryRawTyped.mockResolvedValue([
        makeRow({
          closure_ind: 'Y',
          closure_date: new Date('2024-07-01'),
          closure_type: 'Wildfire',
          closure_comment: 'Closed due to wildfire activity.',
        }),
      ]);

      const { features } = await service.findAll(1);
      const { properties } = features[0];

      expect(properties.closure_ind).toBe('Y');
      expect(properties.closure_date).toEqual(new Date('2024-07-01'));
      expect(properties.closure_type).toBe('Wildfire');
      expect(properties.closure_comment).toBe(
        'Closed due to wildfire activity.',
      );
    });
  });
});
