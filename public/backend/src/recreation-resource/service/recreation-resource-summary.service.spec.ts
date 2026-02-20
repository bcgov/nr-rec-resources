import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import { RecreationResourceSummaryService } from './recreation-resource-summary.service';
import { getRecreationResourceSummary } from '@prisma-generated-sql';

vi.mock('@prisma-generated-sql', () => ({
  getRecreationResourceSummary: vi.fn(),
}));

const MOCK_GEOJSON =
  '{"type":"Point","coordinates":[1292239.7691,1133870.4011]}';

const createMockDbRow = (
  id = 'REC204117',
  overrides: Partial<getRecreationResourceSummary.Result> = {},
): getRecreationResourceSummary.Result => ({
  rec_resource_id: id,
  name: 'Aileen Lake',
  display_on_public_site: true,
  district_code: 'RDCK',
  district_description: 'Chilliwack',
  rec_resource_type_code: 'SIT',
  rec_resource_type_description: 'Recreation Site',
  status_code: 2,
  status_description: 'Closed',
  closure_comment: 'Closed due to wildfire activity in the area',
  site_point_geometry: MOCK_GEOJSON,
  total_count: 1,
  ...overrides,
});

const expectedDto = {
  rec_resource_id: 'REC204117',
  name: 'Aileen Lake',
  district_code: 'RDCK',
  district: 'Chilliwack',
  rec_resource_type_code: 'SIT',
  rec_resource_type: 'Recreation Site',
  display_on_public_site: true,
  status_code: 2,
  status: 'Closed',
  closure_comment: 'Closed due to wildfire activity in the area',
  site_point_geometry: MOCK_GEOJSON,
};

describe('RecreationResourceSummaryService', () => {
  let service: RecreationResourceSummaryService;
  let prismaService: Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceSummaryService,
        {
          provide: PrismaService,
          useValue: {
            $queryRawTyped: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceSummaryService>(
      RecreationResourceSummaryService,
    );
    prismaService = module.get(PrismaService);
  });

  it('should return mapped DTOs with correct field mapping', async () => {
    vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce([
      createMockDbRow(),
    ]);

    const result = await service.findAll();

    expect(result.data).toEqual([expectedDto]);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('should default to page 1', async () => {
    await service.findAll();

    expect(prismaService.$queryRawTyped).toHaveBeenCalledOnce();
  });

  it('should calculate totalPages correctly', async () => {
    vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce([
      createMockDbRow('REC000001', { total_count: 2500 }),
    ]);

    const result = await service.findAll();

    expect(result.totalPages).toBe(3);
  });

  it('should return total of 0 when no results', async () => {
    vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce([]);

    const result = await service.findAll();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('should clamp page below 1 to page 1', async () => {
    await service.findAll(0);
    await service.findAll(-1);

    expect(prismaService.$queryRawTyped).toHaveBeenCalledTimes(2);
  });

  it('should handle null site_point_geometry', async () => {
    vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce([
      createMockDbRow('REC204117', { site_point_geometry: null }),
    ]);

    const result = await service.findAll();

    expect(result.data[0].site_point_geometry).toBeNull();
  });

  it('should handle resources with no status (open)', async () => {
    vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce([
      createMockDbRow('REC204117', {
        status_code: null,
        status_description: null,
        closure_comment: null,
      }),
    ]);

    const result = await service.findAll();

    expect(result.data[0].status_code).toBeNull();
    expect(result.data[0].status).toBeNull();
    expect(result.data[0].closure_comment).toBeNull();
  });

  it('should fall back to empty strings when district, type, name, and display are null', async () => {
    vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce([
      createMockDbRow('REC204117', {
        name: null,
        display_on_public_site: null,
        district_code: null,
        district_description: null,
        rec_resource_type_code: null,
        rec_resource_type_description: null,
      }),
    ]);

    const result = await service.findAll();

    expect(result.data[0].name).toBe('');
    expect(result.data[0].district_code).toBe('');
    expect(result.data[0].district).toBe('');
    expect(result.data[0].rec_resource_type_code).toBe('');
    expect(result.data[0].rec_resource_type).toBe('');
    expect(result.data[0].display_on_public_site).toBe(false);
  });
});
