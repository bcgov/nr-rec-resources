import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeospatialService } from '@/recreation-resources/geospatial/geospatial.service';
import { PrismaService } from '@/prisma.service';
import { getRecreationResourceGeospatialData } from '@/prisma-generated-sql';
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

  it('findGeospatialDataById maps result to DTO', async () => {
    const dbRow = {
      rec_resource_id: 'REC1',
      spatial_feature_geometry: ['{"type":"Polygon","coordinates":[]}'],
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
      site_point_geometry: dbRow.site_point_geometry,
      utm_zone: dbRow.utm_zone,
      utm_easting: dbRow.utm_easting,
      utm_northing: dbRow.utm_northing,
      latitude: dbRow.latitude,
      longitude: dbRow.longitude,
    };
    expect(res).toEqual(expected);
  });

  it('updateGeospatialData calls upsertSitePointFromUtm when full UTM provided', async () => {
    const upsertSpy = vi
      .spyOn(service as any, 'upsertSitePointFromUtm')
      .mockResolvedValue(undefined);

    const dto = { utm_zone: 10, utm_easting: 500000, utm_northing: 5450000 };

    await service.updateGeospatialData('REC2', dto as any);

    expect(upsertSpy).toHaveBeenCalledWith('REC2', 10, 500000, 5450000);
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
    const callArgs = (prismaMock.$executeRawUnsafe as unknown as jest.Mock).mock
      .calls[0];

    // callArgs[0] is the SQL string, then parameters: rec_resource_id, easting, northing, epsg
    expect(callArgs[0]).toEqual(expect.any(String));
    expect(callArgs[1]).toBe(recId);
    expect(callArgs[2]).toBe(easting);
    expect(callArgs[3]).toBe(northing);
    expect(callArgs[4]).toBe(expectedEpsg);
  });
});
