import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BcgwService } from './bcgw.service';
import { PrismaService } from 'src/prisma.service';

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
