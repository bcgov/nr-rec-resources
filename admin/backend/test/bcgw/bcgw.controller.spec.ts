import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { BcgwController } from '@/bcgw/bcgw.controller';
import { BcgwService } from '@/bcgw/bcgw.service';
import { BcgwExportService } from '@/bcgw/export/bcgw-export.service';

describe('BcgwController', () => {
  let controller: BcgwController;
  let service: BcgwService;
  let exportService: BcgwExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BcgwController],
      providers: [
        {
          provide: BcgwService,
          useValue: { getLayerDownloadUrl: vi.fn() },
        },
        {
          provide: BcgwExportService,
          useValue: { run: vi.fn() },
        },
      ],
    }).compile();

    controller = module.get<BcgwController>(BcgwController);
    service = module.get<BcgwService>(BcgwService);
    exportService = module.get<BcgwExportService>(BcgwExportService);
  });

  describe('layer redirects', () => {
    const cases = [
      ['closures-fully-attributed', () => controller.getRecreationResources()],
      ['closures-short', () => controller.getClosuresShort()],
      ['recreation-lines', () => controller.getRecreationLines()],
      ['recreation-polygons', () => controller.getRecreationPolygons()],
    ] as const;

    it.each(cases)(
      'redirects %s to its presigned URL',
      async (layerName, invoke) => {
        const url = `https://example.test/${layerName}.geojson.gz?signed`;
        vi.spyOn(service, 'getLayerDownloadUrl').mockResolvedValue(url);

        const result = await invoke();

        expect(service.getLayerDownloadUrl).toHaveBeenCalledWith(layerName);
        expect(result).toEqual({ url, statusCode: HttpStatus.FOUND });
      },
    );

    it('propagates NotFoundException when no export exists', async () => {
      vi.spyOn(service, 'getLayerDownloadUrl').mockRejectedValue(
        new NotFoundException('No export is available'),
      );

      await expect(controller.getRecreationLines()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('runExport', () => {
    it('returns the manifests from the export run', async () => {
      const manifests = [
        {
          layer: 'recreation-lines',
          generated_at: '2026-09-23T17:00:00.000Z',
          feature_count: 2,
          bytes: 1234,
        },
      ];
      vi.spyOn(exportService, 'run').mockResolvedValue(manifests);

      await expect(controller.runExport()).resolves.toEqual(manifests);
      expect(exportService.run).toHaveBeenCalledWith();
    });

    it('returns an empty array when the lock was already held', async () => {
      vi.spyOn(exportService, 'run').mockResolvedValue([]);

      await expect(controller.runExport()).resolves.toEqual([]);
    });
  });
});
