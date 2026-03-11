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
      $executeRawUnsafe: vi.fn(),
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
    const upsertSpy = vi
      .spyOn(service as any, 'upsertSitePointFromUtm')
      .mockResolvedValue(undefined);

    const dto = { utm_zone: 10, utm_easting: 500000, utm_northing: 5450000 };

    await service.updateGeospatialData('REC2', dto as any);

    expect(upsertSpy).toHaveBeenCalledWith('REC2', 10, 500000, 5450000);
  });

  it('updateGeospatialData does not call upsert when no UTM payload and logs warn', async () => {
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

  it('upsertSitePointFromUtm calls prisma.$executeRawUnsafe with computed epsg and parameters', async () => {
    (
      prismaMock.$executeRawUnsafe as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    const recId = 'REC-UPSERT';
    const utmZone = 11;
    const easting = 12345;
    const northing = 67890;

    await service.upsertSitePointFromUtm(recId, utmZone, easting, northing);

    const expectedEpsg = 32600 + Math.trunc(utmZone);

    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalled();
    const callArgs = (
      prismaMock.$executeRawUnsafe as unknown as ReturnType<typeof vi.fn>
    ).mock.calls[0]!;

    // callArgs[0] is the SQL string, then parameters: rec_resource_id, easting, northing, epsg
    expect(callArgs[0]).toEqual(expect.any(String));
    expect(callArgs[1]).toBe(recId);
    expect(callArgs[2]).toBe(easting);
    expect(callArgs[3]).toBe(northing);
    expect(callArgs[4]).toBe(expectedEpsg);
  });
});
