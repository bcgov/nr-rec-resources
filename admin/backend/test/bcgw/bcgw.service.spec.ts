import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BcgwService } from '@/bcgw/bcgw.service';
import { S3Service } from '@/s3/s3.service';

describe('BcgwService', () => {
  let service: BcgwService;
  let s3Service: {
    objectExists: ReturnType<typeof vi.fn>;
    getSignedUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    s3Service = {
      objectExists: vi.fn(),
      getSignedUrl: vi.fn(),
    };
    service = new BcgwService(s3Service as unknown as S3Service);
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
      const unconfigured = new BcgwService(null);

      await expect(
        unconfigured.getLayerDownloadUrl('recreation-lines'),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
