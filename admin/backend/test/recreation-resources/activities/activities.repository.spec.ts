import { PrismaService } from '@/prisma.service';
import { ActivitiesRepository } from '@/recreation-resources/activities/activities.repository';
import { RecreationActivityDto } from '@/recreation-resources/dtos/recreation-resource-detail.dto';
import { syncManyToMany } from '@/recreation-resources/utils/syncManyToManyUtils';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the utility function
vi.mock('@/recreation-resources/utils/syncManyToManyUtils', () => ({
  syncManyToMany: vi.fn(),
}));

describe('ActivitiesRepository', () => {
  let repository: ActivitiesRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  const mockPrismaService = {
    recreation_activity: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ActivitiesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ActivitiesRepository>(ActivitiesRepository);
    prisma = module.get<PrismaService>(PrismaService);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    if (module) {
      await module.close();
    }
  });

  describe('findActivitiesByResourceId', () => {
    const rec_resource_id = 'REC0001';

    it('should return mapped activities when activities exist', async () => {
      const mockPrismaResults = [
        {
          recreation_activity: {
            recreation_activity_code: 1,
            description: 'Hiking',
          },
        },
        {
          recreation_activity: {
            recreation_activity_code: 2,
            description: 'Camping',
          },
        },
      ];

      const expected: RecreationActivityDto[] = [
        {
          recreation_activity_code: 1,
          description: 'Hiking',
        },
        {
          recreation_activity_code: 2,
          description: 'Camping',
        },
      ];

      mockPrismaService.recreation_activity.findMany.mockResolvedValue(
        mockPrismaResults,
      );

      const result =
        await repository.findActivitiesByResourceId(rec_resource_id);

      expect(result).toEqual(expected);
      expect(prisma.recreation_activity.findMany).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: {
          recreation_activity: {
            select: {
              recreation_activity_code: true,
              description: true,
            },
          },
        },
      });
    });

    it('should return empty array when no activities exist', async () => {
      mockPrismaService.recreation_activity.findMany.mockResolvedValue([]);

      const result =
        await repository.findActivitiesByResourceId(rec_resource_id);

      expect(result).toEqual([]);
    });

    it('should handle activities with null descriptions', async () => {
      const mockPrismaResults = [
        {
          recreation_activity: {
            recreation_activity_code: 1,
            description: null,
          },
        },
        {
          recreation_activity: {
            recreation_activity_code: 2,
            description: 'Camping',
          },
        },
      ];

      const expected: RecreationActivityDto[] = [
        {
          recreation_activity_code: 1,
          description: '',
        },
        {
          recreation_activity_code: 2,
          description: 'Camping',
        },
      ];

      mockPrismaService.recreation_activity.findMany.mockResolvedValue(
        mockPrismaResults,
      );

      const result =
        await repository.findActivitiesByResourceId(rec_resource_id);

      expect(result).toEqual(expected);
    });
  });

  describe('updateActivities', () => {
    const rec_resource_id = 'REC0001';

    it('should call syncManyToMany with correct parameters and createData function', async () => {
      const activity_codes = [1, 2, 3];
      const mockTx = {} as any;
      let capturedCreateData: ((key: number) => any) | undefined;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Capture the createData function when syncManyToMany is called
      vi.mocked(syncManyToMany).mockImplementation(async (config) => {
        capturedCreateData = config.createData;
        return Promise.resolve();
      });

      await repository.updateActivities(rec_resource_id, activity_codes);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(syncManyToMany).toHaveBeenCalledWith({
        tx: mockTx,
        tableName: 'recreation_activity',
        where: { rec_resource_id },
        keyField: 'recreation_activity_code',
        newKeys: activity_codes,
        createData: expect.any(Function),
      });

      // Verify createData function works correctly (improves coverage)
      expect(capturedCreateData).toBeDefined();
      const result = capturedCreateData!(5);
      expect(result).toEqual({
        rec_resource_id,
        recreation_activity_code: 5,
      });
    });

    it('should use transaction for atomicity', async () => {
      const activity_codes = [1, 2];
      const mockTx = {} as any;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await repository.updateActivities(rec_resource_id, activity_codes);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
