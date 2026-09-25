import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeospatialService } from '@/recreation-resources/geospatial/geospatial.service';
import { PrismaService } from '@/prisma.service';
import { getRecreationResourceGeospatialData } from '@prisma-generated-sql/getRecreationResourceGeospatialData';
import { RecreationResourceGeospatialDto } from '@/recreation-resources/geospatial/dto/recreation-resource-geospatial.dto';

describe('GeospatialService', () => {
  let prismaMock: Partial<PrismaService>;
  let service: GeospatialService;

  beforeEach(() => {
    prismaMock = {
      $queryRawTyped: vi.fn(),
      $queryRaw: vi.fn(),
      $executeRaw: vi.fn(),
      $transaction: vi.fn(),
    };
    service = new GeospatialService(prismaMock as PrismaService);
  });

  it('findGeospatialDataById returns null when no result', async () => {
    (
      prismaMock.$queryRawTyped as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    const res = await service.findGeospatialDataById('REC123');
    expect(prismaMock.$queryRawTyped).toHaveBeenCalled();
    expect(res).toBeNull();
  });

  it('findGeospatialDataById returns null when first row is falsy', async () => {
    (
      prismaMock.$queryRawTyped as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([undefined]);

    const res = await service.findGeospatialDataById('REC123');
    expect(res).toBeNull();
  });

  it('findGeospatialDataById maps result to DTO', async () => {
    const dbRow = {
      spatial_feature_geometry: ['{"type":"Polygon","coordinates":[]}'],
      total_length_km: 2.5,
      total_area_hectares: 10.05,
      right_of_way_m: 6,
      site_point_geometry: '{"type":"Point","coordinates":[1,2]}',
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5450000,
      latitude: 53.1,
      longitude: -127.1,
    };

    (
      prismaMock.$queryRawTyped as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([dbRow]);

    const res = await service.findGeospatialDataById('REC1');

    expect(prismaMock.$queryRawTyped).toHaveBeenCalledWith(
      getRecreationResourceGeospatialData('REC1'),
    );
    const expected: RecreationResourceGeospatialDto = {
      rec_resource_id: 'REC1',
      spatial_feature_geometry: dbRow.spatial_feature_geometry,
      total_length_km: 2.5,
      total_area_hectares: 10.05,
      right_of_way_m: 6,
      site_point_geometry: dbRow.site_point_geometry,
      utm_zone: dbRow.utm_zone,
      utm_easting: dbRow.utm_easting,
      utm_northing: dbRow.utm_northing,
      latitude: dbRow.latitude,
      longitude: dbRow.longitude,
    };
    expect(res).toEqual(expected);
  });

  it('findGeospatialDataById maps null/undefined numeric fields via toNum', async () => {
    const dbRow = {
      spatial_feature_geometry: null,
      total_length_km: null,
      total_area_hectares: undefined,
      right_of_way_m: null,
      site_point_geometry: null,
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5450000,
      latitude: null,
      longitude: null,
    };
    (
      prismaMock.$queryRawTyped as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([dbRow]);

    const res = await service.findGeospatialDataById('REC1');

    expect(res).toEqual({
      rec_resource_id: 'REC1',
      spatial_feature_geometry: undefined,
      total_length_km: null,
      total_area_hectares: null,
      right_of_way_m: null,
      site_point_geometry: undefined,
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5450000,
      latitude: null,
      longitude: null,
    });
  });

  it('updateGeospatialData calls upsertSitePointFromUtm when full UTM provided', async () => {
    // Mock validation to pass (no features → skip)
    (
      prismaMock.$queryRaw as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([{ feature_count: BigInt(0), passes_check: null }]);

    const upsertSpy = vi
      .spyOn(service as any, 'upsertSitePointFromUtm')
      .mockResolvedValue(undefined);

    const dto = { utm_zone: 10, utm_easting: 500000, utm_northing: 5450000 };

    await service.updateGeospatialData('REC2', dto as any);

    expect(upsertSpy).toHaveBeenCalledWith('REC2', 10, 500000, 5450000);
  });

  it('updateGeospatialData skips validation and upsert when no UTM payload and logs warn', async () => {
    const upsertSpy = vi
      .spyOn(service as any, 'upsertSitePointFromUtm')
      .mockResolvedValue(undefined);
    const warnSpy = vi.spyOn(service['logger'], 'warn');

    await service.updateGeospatialData('REC2', {} as any);

    expect(upsertSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      'No UTM payload provided for rec_resource_id: REC2 - nothing updated.',
    );
  });

  it('createMapFeaturesFromValidatedFile flattens multi-geometries and writes P/L codes', async () => {
    const txMock = {
      recreation_resource: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(undefined),
      },
      recreation_map_feature: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      $executeRaw: vi.fn().mockResolvedValue(undefined),
      $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
      $queryRawUnsafe: vi.fn().mockResolvedValue([{ max_rmf_skey: 99 }]),
    };

    (
      prismaMock.$transaction as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(
      async (callback: (tx: typeof txMock) => Promise<void>) => {
        return callback(txMock);
      },
    );

    await service.createMapFeaturesFromValidatedFile('REC2', {
      features: [
        {
          geometry: {
            type: 'MultiPolygon',
            coordinates: [[[1, 1]], [[2, 2]], [[3, 3]]],
          },
        },
        { geometry: { type: 'LineString', coordinates: [] } },
      ],
    });

    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(txMock.recreation_resource.findUnique).toHaveBeenCalledWith({
      where: { rec_resource_id: 'REC2' },
      select: { rec_resource_id: true, district_code: true },
    });
    expect(txMock.recreation_resource.create).toHaveBeenCalledWith({
      data: {
        rec_resource_id: 'REC2',
        district_code: null,
        created_by: null,
      },
    });
    expect(txMock.$queryRawUnsafe).toHaveBeenCalledTimes(1);
    expect(txMock.$executeRawUnsafe).toHaveBeenCalledTimes(1);
    expect(txMock.$executeRaw).toHaveBeenCalledTimes(8);
    expect(txMock.$executeRawUnsafe.mock.calls[0]?.[0]).toContain(
      'pg_advisory_xact_lock',
    );

    const insertSql = txMock.$executeRaw.mock.calls
      .map((call) => call[0].strings.join(' '))
      .filter((sql) =>
        sql.includes('INSERT INTO rst.recreation_map_feature ('),
      );

    expect(insertSql).toHaveLength(4);

    const firstMapFeatureValues = txMock.$executeRaw.mock.calls[0]?.[0].values;
    expect(firstMapFeatureValues).toContain('PND');

    const geomSql = txMock.$executeRaw.mock.calls
      .map((call) => call[0].strings.join(' '))
      .filter((sql) =>
        sql.includes('INSERT INTO rst.recreation_map_feature_geom'),
      );

    expect(geomSql).toHaveLength(4);

    const geometryTypeCodes = txMock.$executeRaw.mock.calls
      .map((call) => call[0].values)
      .flat()
      .filter((value) => value === 'P' || value === 'L');

    expect(geometryTypeCodes.filter((value) => value === 'P')).toHaveLength(3);
    expect(geometryTypeCodes.filter((value) => value === 'L')).toHaveLength(1);
  });

  it('seeds recreation_resource and natural district metadata when provided', async () => {
    const txMock = {
      recreation_resource: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
      natural_resource_org_unit: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue({
          rec_resource_id: 'REC_TEMPLATE',
          org_unit_no: 123,
          org_unit_code: 'RCKL',
          org_unit_name: 'Rocky Lake Unit',
          location_code: null,
          org_level_code: null,
          office_name_code: null,
          region_no: null,
          region_code: null,
          district_no: null,
          district_code: 'NR1',
          effective_date: null,
          expiry_date: null,
          updated_at: null,
        }),
        create: vi.fn().mockResolvedValue(undefined),
      },
      recreation_map_feature: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      $executeRaw: vi.fn().mockResolvedValue(undefined),
      $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
      $queryRawUnsafe: vi.fn().mockResolvedValue([{ max_rmf_skey: 99 }]),
    };

    (
      prismaMock.$transaction as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(
      async (callback: (tx: typeof txMock) => Promise<void>) => {
        return callback(txMock);
      },
    );

    await service.createMapFeaturesFromValidatedFile('REC_NEW', {
      recreation_type_code: 'SIT',
      recreation_district_code: 'D001',
      natural_resource_district_code: 'RCKL',
      submitted_by: 'request.user@gov.bc.ca',
      features: [{ geometry: { type: 'Polygon', coordinates: [] } }],
    });

    expect(txMock.recreation_resource.create).toHaveBeenCalledWith({
      data: {
        rec_resource_id: 'REC_NEW',
        district_code: 'D001',
        created_by: 'request.user@gov.bc.ca',
      },
    });
    expect(txMock.natural_resource_org_unit.findFirst).toHaveBeenCalledWith({
      where: { org_unit_code: 'RCKL' },
      orderBy: { effective_date: 'desc' },
    });
    expect(txMock.natural_resource_org_unit.create).toHaveBeenCalled();

    const flattenedValues = txMock.$executeRaw.mock.calls
      .map((call) => call[0].values)
      .flat();

    expect(flattenedValues).toContain('SIT');
    expect(flattenedValues).toContain('request.user@gov.bc.ca');
  });

  it('rejects duplicate submissions when map features already exist', async () => {
    const txMock = {
      recreation_resource: {
        findUnique: vi.fn().mockResolvedValue({ rec_resource_id: 'REC2' }),
        create: vi.fn(),
      },
      recreation_map_feature: {
        findFirst: vi.fn().mockResolvedValue({ rmf_skey: 1 }),
      },
      $executeRaw: vi.fn(),
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    };

    (
      prismaMock.$transaction as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(
      async (callback: (tx: typeof txMock) => Promise<void>) => {
        return callback(txMock);
      },
    );

    await expect(
      service.createMapFeaturesFromValidatedFile('REC2', {
        features: [{ geometry: { type: 'Polygon', coordinates: [] } }],
      }),
    ).rejects.toThrow(
      'Map features already exist for this recreation resource.',
    );
  });

  it('createMapFeaturesFromValidatedFile rejects empty feature arrays', async () => {
    const emptyPayload = { features: [] } as any;

    await expect(
      service.createMapFeaturesFromValidatedFile('REC2', emptyPayload),
    ).rejects.toThrow('At least one validated feature is required.');
  });

  describe('validateUtmAgainstFeatureGeometry (via updateGeospatialData)', () => {
    const dto = { utm_zone: 10, utm_easting: 500000, utm_northing: 5450000 };

    it('skips validation and proceeds when resource has no spatial features', async () => {
      (
        prismaMock.$queryRaw as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue([{ feature_count: BigInt(0), passes_check: null }]);

      const upsertSpy = vi
        .spyOn(service as any, 'upsertSitePointFromUtm')
        .mockResolvedValue(undefined);

      await service.updateGeospatialData('REC-NO-FEAT', dto as any);
      expect(upsertSpy).toHaveBeenCalled();
    });

    it('proceeds when UTM point is within 10 m of a linear feature', async () => {
      (
        prismaMock.$queryRaw as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue([{ feature_count: BigInt(1), passes_check: true }]);

      const upsertSpy = vi
        .spyOn(service as any, 'upsertSitePointFromUtm')
        .mockResolvedValue(undefined);

      await service.updateGeospatialData('REC-LINEAR', dto as any);
      expect(upsertSpy).toHaveBeenCalled();
    });

    it('proceeds when UTM point is inside a polygon feature', async () => {
      (
        prismaMock.$queryRaw as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue([{ feature_count: BigInt(2), passes_check: true }]);

      const upsertSpy = vi
        .spyOn(service as any, 'upsertSitePointFromUtm')
        .mockResolvedValue(undefined);

      await service.updateGeospatialData('REC-POLY', dto as any);
      expect(upsertSpy).toHaveBeenCalled();
    });
  });

  it('upsertSitePointFromUtm calls prisma.$executeRawUnsafe with computed epsg and parameters', async () => {
    (
      prismaMock.$executeRaw as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    const recId = 'REC-UPSERT';
    const utmZone = 11;
    const easting = 12345;
    const northing = 67890;

    await service.upsertSitePointFromUtm(recId, utmZone, easting, northing);

    expect(prismaMock.$executeRaw).toHaveBeenCalled();
  });
});
