import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BcgwService } from '@/bcgw/bcgw.service';
import { S3Service } from '@/s3/s3.service';
import { PrismaService } from 'src/prisma.service';
import { BcgwRecreationLinesDto } from '@/bcgw/dto/bcgw-recreation-lines.dto';

describe('BcgwService', () => {
  let service: BcgwService;
  let prisma: { $queryRawUnsafe: ReturnType<typeof vi.fn> };
  let s3Service: {
    objectExists: ReturnType<typeof vi.fn>;
    getSignedUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prisma = { $queryRawUnsafe: vi.fn() };
    s3Service = {
      objectExists: vi.fn(),
      getSignedUrl: vi.fn(),
    };
    service = new BcgwService(
      prisma as unknown as PrismaService,
      s3Service as unknown as S3Service,
    );
  });

  describe('getLayerDownloadUrl', () => {
    it('returns a presigned URL for the layer file', async () => {
      s3Service.objectExists.mockResolvedValue(true);
      s3Service.getSignedUrl.mockResolvedValue('https://example.test/signed');

      const url = await service.getLayerDownloadUrl('recreation-lines');

      expect(s3Service.objectExists).toHaveBeenCalledWith(
        'recreation-lines.geojson.gz',
      );
      expect(s3Service.getSignedUrl).toHaveBeenCalledWith(
        'recreation-lines.geojson.gz',
        3600,
      );
      expect(url).toBe('https://example.test/signed');
    });

    it('throws NotFoundException when the layer has never been exported', async () => {
      s3Service.objectExists.mockResolvedValue(false);

      await expect(
        service.getLayerDownloadUrl('recreation-polygons'),
      ).rejects.toThrow(NotFoundException);
      expect(s3Service.getSignedUrl).not.toHaveBeenCalled();
    });

    // BCGW_EXPORTS_BUCKET is optional config, so the injected S3Service is null on
    // an environment that does not run the export job.
    it('throws ServiceUnavailableException when no export bucket is configured', async () => {
      const unconfigured = new BcgwService(
        prisma as unknown as PrismaService,
        null,
      );

      await expect(
        unconfigured.getLayerDownloadUrl('recreation-lines'),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('findLayerPage', () => {
    const row = (overrides: Record<string, unknown> = {}) => ({
      rmf_skey: 1001,
      rec_resource_id: 'REC4531',
      geometry: '{"type":"LineString","coordinates":[[-121.9,49.6]]}',
      total_count: 4213,
      ...overrides,
    });

    it('returns a FeatureCollection with pagination metadata', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([row()]);

      const result = await service.findLayerPage('recreation-lines', 1);

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      // 250 per page for the line layer, so 4213 features span 17 pages.
      expect(result.meta).toEqual({
        total: 4213,
        page: 1,
        totalPages: 17,
        pageSize: 250,
      });
    });

    it('parses geometry text into an object and drops total_count', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([row()]);

      const { features } =
        await service.findLayerPage<BcgwRecreationLinesDto>('recreation-lines');
      const feature = features[0]!;

      expect(feature.geometry).toEqual({
        type: 'LineString',
        coordinates: [[-121.9, 49.6]],
      });
      expect(feature.properties).not.toHaveProperty('total_count');
      expect(feature.properties).not.toHaveProperty('geometry');
      expect(feature.properties.rec_resource_id).toBe('REC4531');
    });

    it('sets geometry to null when the column is empty', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([row({ geometry: null })]);

      const { features } = await service.findLayerPage('recreation-lines');

      expect(features[0]!.geometry).toBeNull();
    });

    it('uses the layer page size as the limit and derives the offset', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      await service.findLayerPage('recreation-lines', 3);

      const [, limit, offset] = prisma.$queryRawUnsafe.mock.calls[0]!;
      expect(limit).toBe(250);
      expect(offset).toBe(500);
    });

    it('clamps pages below 1', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.findLayerPage('recreation-lines', 0);

      const [, , offset] = prisma.$queryRawUnsafe.mock.calls[0]!;
      expect(offset).toBe(0);
      expect(result.meta.page).toBe(1);
    });

    it('returns an empty collection when the page has no rows', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.findLayerPage('closures-short');

      expect(result.features).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('throws NotFoundException for an unknown layer', async () => {
      await expect(service.findLayerPage('not-a-layer')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
    });
  });
});
