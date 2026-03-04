import { ExportDatasetDto } from '@/recreation-resources/exports/dtos/export-dataset.dto';
import { ExportDownloadQueryDto } from '@/recreation-resources/exports/dtos/export-download-query.dto';
import { ExportPreviewQueryDto } from '@/recreation-resources/exports/dtos/export-preview-query.dto';
import { ExportPreviewResponseDto } from '@/recreation-resources/exports/dtos/export-preview-response.dto';
import { ListExportDatasetsResponseDto } from '@/recreation-resources/exports/dtos/list-export-datasets-response.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('Export DTOs', () => {
  it('validates allowed download datasets', async () => {
    const validDto = plainToInstance(ExportDownloadQueryDto, {
      dataset: 'file-details',
      district: 'RDKA',
      resourceType: 'SIT',
    });
    const invalidDto = plainToInstance(ExportDownloadQueryDto, {
      dataset: 'site-inspection',
    });

    expect(await validate(validDto)).toHaveLength(0);
    expect((await validate(invalidDto)).length).toBeGreaterThan(0);
  });

  it('applies preview defaults and validation', async () => {
    const defaultDto = plainToInstance(ExportPreviewQueryDto, {
      dataset: 'file-details',
      district: 'RDKA',
      resourceType: 'SIT',
    });
    const invalidDto = plainToInstance(ExportPreviewQueryDto, {
      dataset: 'file-details',
      district: 'RDKA',
      resourceType: 'SIT',
      limit: 101,
    });

    expect(await validate(defaultDto)).toHaveLength(0);
    expect(defaultDto.limit).toBe(50);
    expect((await validate(invalidDto)).length).toBeGreaterThan(0);
  });

  it('assigns response DTO properties', () => {
    const dataset = new ExportDatasetDto();
    dataset.id = 'file-details';
    dataset.label = 'File details';
    dataset.source = 'RST';

    const listResponse = new ListExportDatasetsResponseDto();
    listResponse.datasets = [dataset];

    const previewResponse = new ExportPreviewResponseDto();
    previewResponse.columns = ['REC_RESOURCE_ID'];
    previewResponse.rows = [{ REC_RESOURCE_ID: 'REC0001' }];

    expect(listResponse.datasets[0]?.id).toBe('file-details');
    expect(previewResponse.columns).toEqual(['REC_RESOURCE_ID']);
    expect(previewResponse.rows).toEqual([{ REC_RESOURCE_ID: 'REC0001' }]);
  });
});
