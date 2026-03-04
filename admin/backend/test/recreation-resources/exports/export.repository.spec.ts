import { PrismaService } from '@/prisma.service';
import { ExportRepository } from '@/recreation-resources/exports/export.repository';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ExportRepository', () => {
  let repository: ExportRepository;
  let prisma: Pick<PrismaService, '$queryRaw'>;

  beforeEach(() => {
    prisma = {
      $queryRaw: vi.fn(),
    } as unknown as Pick<PrismaService, '$queryRaw'>;

    repository = new ExportRepository(prisma as PrismaService);
  });

  it('builds a limited preview query and normalizes raw values into strings', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      {
        REC_RESOURCE_ID: 'REC0001',
        COUNT: 2n,
        CREATED_AT: new Date('2026-03-03T00:00:00.000Z'),
        IS_ACTIVE: true,
        NOTES: null,
      },
    ]);

    const result = await repository.getPreviewRows({
      dataset: 'file-details',
      district: 'RDKA',
      resourceType: 'SIT',
      limit: 25,
    });

    expect(result).toEqual([
      {
        REC_RESOURCE_ID: 'REC0001',
        COUNT: '2',
        CREATED_AT: '2026-03-03T00:00:00.000Z',
        IS_ACTIVE: 'true',
        NOTES: null,
      },
    ]);

    const query = vi.mocked(prisma.$queryRaw).mock.calls[0]?.[0] as Prisma.Sql;
    const normalizedSql = query.sql.replace(/\s+/g, ' ').trim();

    expect(normalizedSql).toContain('FROM recreation_resource rr');
    expect(normalizedSql).toContain('rr.district_code = ?');
    expect(normalizedSql).toContain('rrtva.rec_resource_type_code = ?');
    expect(normalizedSql).toContain('LIMIT');
  });

  it('builds a full download query without applying a preview limit', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

    await repository.getDownloadRows({
      dataset: 'file-details',
      district: 'RDKA',
      resourceType: 'SIT',
    });

    const query = vi.mocked(prisma.$queryRaw).mock.calls[0]?.[0] as Prisma.Sql;
    const normalizedSql = query.sql.replace(/\s+/g, ' ').trim();

    expect(normalizedSql).toContain('FROM recreation_resource rr');
    expect(normalizedSql).not.toContain('LIMIT');
  });

  it('rejects datasets that do not have a registered builder', async () => {
    await expect(
      repository.getPreviewRows({
        dataset: 'site-inspection' as any,
        limit: 10,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      repository.getPreviewRows({
        dataset: 'site-inspection' as any,
        limit: 10,
      }),
    ).rejects.toThrow('Export dataset is unavailable: site-inspection');

    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });
});
