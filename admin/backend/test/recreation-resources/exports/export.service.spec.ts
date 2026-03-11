import { type ExportDatasetId } from '@/recreation-resources/exports/datasets';
import { ExportRepository } from '@/recreation-resources/exports/export.repository';
import { ExportService } from '@/recreation-resources/exports/export.service';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

describe('ExportService', () => {
  let exportRepository: Mocked<ExportRepository>;
  let service: ExportService;

  beforeEach(() => {
    exportRepository = {
      getPreviewRows: vi.fn(),
      getDownloadRows: vi.fn(),
    } as unknown as Mocked<ExportRepository>;

    service = new ExportService(exportRepository);
  });

  describe('getPreview', () => {
    it('returns columns from the first row and preserves rows', async () => {
      const rows = [
        {
          REC_RESOURCE_ID: 'REC0001',
          NAME: 'Alpha',
          STATUS: 'Open',
        },
        {
          REC_RESOURCE_ID: 'REC0002',
          NAME: 'Beta',
          STATUS: 'Closed',
        },
      ];

      exportRepository.getPreviewRows.mockResolvedValue(rows);

      const result = await service.getPreview({
        dataset: 'file-details',
        district: 'D01',
        resourceType: 'CABIN',
        limit: 50,
      });

      expect(exportRepository.getPreviewRows).toHaveBeenCalledWith({
        dataset: 'file-details',
        district: 'D01',
        resourceType: 'CABIN',
        limit: 50,
      });
      expect(result).toEqual({
        columns: ['REC_RESOURCE_ID', 'NAME', 'STATUS'],
        rows,
      });
    });

    it('returns an empty preview shape when no rows match', async () => {
      exportRepository.getPreviewRows.mockResolvedValue([]);

      const result = await service.getPreview({
        dataset: 'file-details',
        limit: 50,
      });

      expect(result).toEqual({
        columns: [],
        rows: [],
      });
    });
  });

  describe('getDownload', () => {
    it('builds escaped CSV, hardens formulas, and returns a dated filename', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-03T12:00:00.000Z'));

      exportRepository.getDownloadRows.mockResolvedValue([
        {
          REC_RESOURCE_ID: 'REC0001',
          NAME: 'Alpha, Site',
          NOTES: '"quoted"',
          FORMULA: '=2+2',
          MULTILINE: 'Line 1\nLine 2',
        },
      ]);

      const result = await service.getDownload({
        dataset: 'fee-list-fta',
        district: 'D01',
        resourceType: 'CABIN',
      });

      expect(exportRepository.getDownloadRows).toHaveBeenCalledWith({
        dataset: 'fee-list-fta',
        district: 'D01',
        resourceType: 'CABIN',
      });
      expect(result.fileName).toBe('fee-list-fta-2026-03-03.csv');
      expect(result.csv).toBe(
        [
          'REC_RESOURCE_ID,NAME,NOTES,FORMULA,MULTILINE',
          'REC0001,"Alpha, Site","""quoted""",\'=2+2,"Line 1\nLine 2"',
        ].join('\r\n'),
      );

      vi.useRealTimers();
    });

    it('returns an empty CSV when no rows are available', async () => {
      exportRepository.getDownloadRows.mockResolvedValue([]);

      const result = await service.getDownload({
        dataset: 'file-details' as ExportDatasetId,
      });

      expect(result.csv).toBe('');
      expect(result.fileName).toMatch(/^file-details-\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });
});
