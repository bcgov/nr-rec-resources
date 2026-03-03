import { BadRequestException } from '@nestjs/common';
import { ExportController } from '@/recreation-resources/exports/export.controller';
import { ExportService } from '@/recreation-resources/exports/export.service';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

describe('ExportController', () => {
  let exportService: Mocked<ExportService>;
  let controller: ExportController;

  beforeEach(() => {
    exportService = {
      listDatasets: vi.fn(),
      getPreview: vi.fn(),
      getDownload: vi.fn(),
    } as unknown as Mocked<ExportService>;

    controller = new ExportController(exportService);
  });

  describe('getPreview', () => {
    it('returns preview rows and columns from the service', async () => {
      const preview = {
        columns: ['REC_RESOURCE_ID', 'NAME'],
        rows: [
          {
            REC_RESOURCE_ID: 'REC0001',
            NAME: 'Alpha',
          },
        ],
      };

      exportService.getPreview.mockResolvedValue(preview);

      const result = await controller.getPreview({
        dataset: 'file-details',
        district: 'D01',
        resourceType: 'CABIN',
        limit: 50,
      });

      expect(exportService.getPreview).toHaveBeenCalledWith({
        dataset: 'file-details',
        district: 'D01',
        resourceType: 'CABIN',
        limit: 50,
      });
      expect(result).toEqual(preview);
    });

    it('rethrows bad requests from the service for unavailable datasets', async () => {
      const error = new BadRequestException(
        'Export dataset is unavailable: missing-dataset',
      );
      exportService.getPreview.mockRejectedValue(error);

      await expect(
        controller.getPreview({
          dataset: 'file-details',
          limit: 50,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('download', () => {
    it('sets CSV headers and sends the file payload', async () => {
      const response = {
        setHeader: vi.fn(),
        send: vi.fn(),
      };

      exportService.getDownload.mockResolvedValue({
        csv: 'A,B\r\n1,2',
        fileName: 'file-details-2026-03-03.csv',
      });

      await controller.download(
        {
          dataset: 'file-details',
          district: 'D01',
          resourceType: 'CABIN',
        },
        response as any,
      );

      expect(exportService.getDownload).toHaveBeenCalledWith({
        dataset: 'file-details',
        district: 'D01',
        resourceType: 'CABIN',
      });
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8',
      );
      expect(response.setHeader).toHaveBeenCalledWith(
        'Access-Control-Expose-Headers',
        'Content-Disposition',
      );
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="file-details-2026-03-03.csv"',
      );
      expect(response.send).toHaveBeenCalledWith('A,B\r\n1,2');
    });
  });
});
