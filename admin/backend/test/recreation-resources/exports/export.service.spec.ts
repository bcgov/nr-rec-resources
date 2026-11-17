import { type ExportDatasetId } from '@/recreation-resources/exports/datasets';
import { ExportRepository } from '@/recreation-resources/exports/export.repository';
import { ExportService } from '@/recreation-resources/exports/export.service';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

describe('ExportService', () => {
  let exportRepository: Mocked<ExportRepository>;
  let userContext: { getCurrentUser: ReturnType<typeof vi.fn> };
  let service: ExportService;

  beforeEach(() => {
    exportRepository = {
      getPreviewRows: vi.fn(),
      getDownloadRows: vi.fn(),
    } as unknown as Mocked<ExportRepository>;

    userContext = {
      getCurrentUser: vi.fn(() => ({ client_roles: [] })),
    };

    service = new ExportService(exportRepository, userContext as any);
  });

  describe('listDatasets', () => {
    it('returns datasets sorted alphabetically by label', () => {
      const result = service.listDatasets();
      const labels = result.datasets.map((dataset) => dataset.label);

      expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    });

    it('does not include the old STRUCTURE_COUNT warning on RST datasets', () => {
      const result = service.listDatasets();
      const idsWithoutWarning = new Set([
        'fee-list',
        'campsite-list',
        'access-list',
        'activities-list',
      ]);

      const impacted = result.datasets.filter((dataset) =>
        idsWithoutWarning.has(dataset.id as ExportDatasetId),
      );

      expect(impacted).toHaveLength(idsWithoutWarning.size);
      expect(impacted.every((dataset) => dataset.info === undefined)).toBe(
        true,
      );
    });
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

    it('redacts restricted columns for viewer-only users', async () => {
      userContext.getCurrentUser.mockReturnValue({
        client_roles: ['rst-idir-viewer'],
      });
      exportRepository.getPreviewRows.mockResolvedValue([
        {
          REC_RESOURCE_ID: 'REC0001',
          CLIENT_NUMBER: 'C-123',
          ESTIMATED_REPAIR_COST: '999',
          ACTUAL_REPAIR_COST: '850',
          ACTUAL_VALUE: '1200',
          STATUS: 'Open',
        },
      ]);

      const result = await service.getPreview({
        dataset: 'file-details',
        limit: 10,
      });

      expect(result.columns).toEqual(['REC_RESOURCE_ID', 'STATUS']);
      expect(result.rows).toEqual([
        {
          REC_RESOURCE_ID: 'REC0001',
          STATUS: 'Open',
        },
      ]);
    });

    it('does not redact restricted columns for admin users', async () => {
      userContext.getCurrentUser.mockReturnValue({
        client_roles: ['rst-admin'],
      });
      exportRepository.getPreviewRows.mockResolvedValue([
        {
          REC_RESOURCE_ID: 'REC0001',
          CLIENT_NUMBER: 'C-123',
          ESTIMATED_REPAIR_COST: '999',
          ACTUAL_REPAIR_COST: '850',
          ACTUAL_VALUE: '1200',
        },
      ]);

      const result = await service.getPreview({
        dataset: 'file-details',
        limit: 10,
      });

      expect(result.columns).toEqual([
        'REC_RESOURCE_ID',
        'CLIENT_NUMBER',
        'ESTIMATED_REPAIR_COST',
        'ACTUAL_REPAIR_COST',
        'ACTUAL_VALUE',
      ]);
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
        dataset: 'fee-list',
        district: 'D01',
        resourceType: 'CABIN',
      });

      expect(exportRepository.getDownloadRows).toHaveBeenCalledWith({
        dataset: 'fee-list',
        district: 'D01',
        resourceType: 'CABIN',
      });
      expect(result.fileName).toBe('fee-list-2026-03-03.csv');
      expect(result.csv).toBe(
        [
          'REC_RESOURCE_ID,NAME,NOTES,FORMULA,MULTILINE',
          'REC0001,"Alpha, Site","""quoted""",\'=2+2,"Line 1\nLine 2"',
        ].join('\r\n'),
      );

      vi.useRealTimers();
    });

    it('returns an empty CSV when no rows are available', async () => {
      userContext.getCurrentUser.mockImplementation(() => {
        throw new Error('no auth context');
      });
      exportRepository.getDownloadRows.mockResolvedValue([]);

      const result = await service.getDownload({
        dataset: 'file-details' as ExportDatasetId,
      });

      expect(result.csv).toBe('');
      expect(result.fileName).toMatch(/^file-details-\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });
});
