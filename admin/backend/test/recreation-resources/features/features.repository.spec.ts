import { PrismaService } from '@/prisma.service';
import { FeaturesRepository } from '@/recreation-resources/features/features.repository';
import { RecreationFeatureDto } from '@/recreation-resources/features/dtos/recreation-feature.dto';
import { syncManyToMany } from '@/recreation-resources/utils/syncManyToManyUtils';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/recreation-resources/utils/syncManyToManyUtils', () => ({
  syncManyToMany: vi.fn(),
}));

describe('FeaturesRepository', () => {
  let repository: FeaturesRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  const mockPrismaService = {
    recreation_feature: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        FeaturesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<FeaturesRepository>(FeaturesRepository);
    prisma = module.get<PrismaService>(PrismaService);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    if (module) {
      await module.close();
    }
  });

  describe('findFeaturesByResourceId', () => {
    const rec_resource_id = 'REC0001';

    it('should return mapped features when features exist', async () => {
      const mockPrismaResults = [
        {
          recreation_feature_code_ref: {
            recreation_feature_code: 'A1',
            description: 'Sport Fish',
          },
        },
        {
          recreation_feature_code_ref: {
            recreation_feature_code: 'B2',
            description: 'Sand Beach',
          },
        },
      ];

      const expected: RecreationFeatureDto[] = [
        { recreation_feature_code: 'A1', description: 'Sport Fish' },
        { recreation_feature_code: 'B2', description: 'Sand Beach' },
      ];

      mockPrismaService.recreation_feature.findMany.mockResolvedValue(
        mockPrismaResults,
      );

      const result = await repository.findFeaturesByResourceId(rec_resource_id);

      expect(result).toEqual(expected);
      expect(prisma.recreation_feature.findMany).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: {
          recreation_feature_code_ref: {
            select: {
              recreation_feature_code: true,
              description: true,
            },
          },
        },
      });
    });

    it('should return empty array when no features exist', async () => {
      mockPrismaService.recreation_feature.findMany.mockResolvedValue([]);

      const result = await repository.findFeaturesByResourceId(rec_resource_id);

      expect(result).toEqual([]);
    });
  });

  describe('updateFeatures', () => {
    const rec_resource_id = 'REC0001';

    it('should call syncManyToMany with correct parameters and createData function', async () => {
      const feature_codes = ['A1', 'B2', 'X0'];
      const mockTx = {} as any;
      let capturedCreateData: ((key: string) => any) | undefined;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      vi.mocked(syncManyToMany).mockImplementation(async (config) => {
        capturedCreateData = config.createData;
        return Promise.resolve();
      });

      await repository.updateFeatures(rec_resource_id, feature_codes);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(syncManyToMany).toHaveBeenCalledWith({
        tx: mockTx,
        tableName: 'recreation_feature',
        where: { rec_resource_id },
        keyField: 'recreation_feature_code',
        newKeys: feature_codes,
        createData: expect.any(Function),
      });

      expect(capturedCreateData).toBeDefined();
      const result = capturedCreateData!('A1');
      expect(result).toEqual({
        rec_resource_id,
        recreation_feature_code: 'A1',
      });
    });

    it('should use transaction for atomicity', async () => {
      const feature_codes = ['A1', 'B2'];
      const mockTx = {} as any;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await repository.updateFeatures(rec_resource_id, feature_codes);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
