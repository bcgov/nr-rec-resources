import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeospatialModule } from '@/recreation-resources/geospatial/geospatial.module';
import { GeospatialService } from '@/recreation-resources/geospatial/geospatial.service';
import { GeospatialController } from '@/recreation-resources/geospatial/geospatial.controller';
import { PrismaService } from '@/prisma.service';

describe('GeospatialModule', () => {
  let service: GeospatialService;
  let controller: GeospatialController;

  const prismaMock = {
    $queryRawTyped: vi.fn(),
    $executeRawUnsafe: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GeospatialModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    service = moduleRef.get(GeospatialService);
    controller = moduleRef.get(GeospatialController);
  });

  it('compiles and provides GeospatialService and GeospatialController', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  it('GeospatialService.findGeospatialDataById uses PrismaService (mocked) and returns null for empty result', async () => {
    (prismaMock.$queryRawTyped as any).mockResolvedValue([]);
    const result = await service.findGeospatialDataById('REC_TEST');
    expect(prismaMock.$queryRawTyped).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('GeospatialService.upsertSitePointFromUtm calls prisma.$executeRawUnsafe with parameters', async () => {
    (prismaMock.$executeRawUnsafe as any).mockResolvedValue(undefined);

    const recId = 'REC_UPSERT';
    const zone = 12;
    const easting = 111111;
    const northing = 222222;

    await service.upsertSitePointFromUtm(recId, zone, easting, northing);

    expect(prismaMock.$executeRawUnsafe).toHaveBeenCalled();
    // Ensure parameters include rec_resource_id and computed EPSG (32600 + zone)
    const callArgs = (prismaMock.$executeRawUnsafe as any).mock.calls[0];
    expect(callArgs[0]).toEqual(expect.any(String)); // SQL string
    // Depending on implementation, parameters may start after the SQL; assert presence of our values
    expect(callArgs).toEqual(
      expect.arrayContaining([
        expect.any(String),
        recId,
        easting,
        northing,
        32600 + Math.trunc(zone),
      ]),
    );
  });
});
