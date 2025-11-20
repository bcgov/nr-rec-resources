import { PrismaService } from '@/prisma.service';
import { RecreationResourceRepository } from '@/recreation-resources/recreation-resource.repository';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

type MockedPrismaService = Mocked<PrismaService> & {
  recreation_resource: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

describe('RecreationResourceRepository', () => {
  let repo: RecreationResourceRepository;
  let prisma: MockedPrismaService;

  beforeEach(() => {
    prisma = {
      $queryRawTyped: vi.fn(),
      recreation_resource: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(),
    } as unknown as MockedPrismaService;
    repo = new RecreationResourceRepository(prisma);
  });

  describe('findSuggestions', () => {
    it('should return total and data from findSuggestions', async () => {
      const mockData = [
        {
          name: 'Test Resource',
          rec_resource_id: 'REC123',
          recreation_resource_type: 'RR',
          recreation_resource_type_code: 'RR',
        },
      ];
      prisma.$queryRawTyped.mockResolvedValue(mockData);

      const result = await repo.findSuggestions('Test');
      expect(result.total).toBe(1);
      expect(result.data?.[0]?.name).toBe('Test Resource');
      expect(result.data?.[0]?.rec_resource_id).toBe('REC123');
    });
  });

  describe('findOneById', () => {
    it('should call findUnique with correct args and return resource', async () => {
      const mockResource = { id: 'abc' };
      prisma.recreation_resource.findUnique.mockResolvedValue(mockResource);
      const result = await repo.findOneById('abc');
      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id: 'abc' },
        select: expect.anything(),
      });
      expect(result).toBe(mockResource);
    });

    it('should return null if not found', async () => {
      prisma.recreation_resource.findUnique.mockResolvedValue(null);
      const result = await repo.findOneById('notfound');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update resource and return updated payload (no access_codes)', async () => {
      const recId = 'res1';
      const updateData = {
        status_code: 1,
        maintenance_standard_code: '2',
      } as any;

      // Mock transaction to call the provided callback
      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        // create a tx with the expected methods
        const tx = {
          recreation_status: { update: vi.fn().mockResolvedValue({}) },
          recreation_resource: {
            update: vi.fn().mockResolvedValue({}),
            findUnique: vi.fn().mockResolvedValue({ id: recId }),
          },
          recreation_access: { deleteMany: vi.fn(), createMany: vi.fn() },
        };
        return cb(tx);
      });

      const result = await repo.update(recId, updateData);
      expect(result).toEqual({ id: recId });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should handle access_codes: deleteMany and createMany called', async () => {
      const recId = 'res2';
      const updateData = {
        status_code: 1,
        access_codes: [
          { access_code: 'AC1', sub_access_codes: ['S1', 'S2'] },
          { access_code: 'AC2', sub_access_codes: ['S3'] },
        ],
      } as any;

      const deleteMany = vi.fn().mockResolvedValue({});
      const createMany = vi.fn().mockResolvedValue({ count: 3 });

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = {
          recreation_status: { update: vi.fn().mockResolvedValue({}) },
          recreation_resource: {
            update: vi.fn().mockResolvedValue({}),
            findUnique: vi.fn().mockResolvedValue({ id: recId }),
          },
          recreation_access: { deleteMany, createMany },
        };
        return cb(tx);
      });

      const result = await repo.update(recId, updateData);
      expect(result).toEqual({ id: recId });
      expect(deleteMany).toHaveBeenCalledWith({
        where: { rec_resource_id: recId },
      });
      // createMany should have been called once with 3 records
      expect(createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            rec_resource_id: recId,
            access_code: 'AC1',
            sub_access_code: 'S1',
          }),
          expect.objectContaining({
            rec_resource_id: recId,
            access_code: 'AC1',
            sub_access_code: 'S2',
          }),
          expect.objectContaining({
            rec_resource_id: recId,
            access_code: 'AC2',
            sub_access_code: 'S3',
          }),
        ]),
      });
    });

    it('should only update status if status_code is provided', async () => {
      const recId = 'res3';
      const updateData = { status_code: 2 } as any;

      const statusUpdate = vi.fn().mockResolvedValue({});

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = {
          recreation_status: { update: statusUpdate },
          recreation_resource: {
            update: vi.fn().mockResolvedValue({}),
            findUnique: vi.fn().mockResolvedValue({ id: recId }),
          },
          recreation_access: { deleteMany: vi.fn(), createMany: vi.fn() },
        };
        return cb(tx);
      });

      await repo.update(recId, updateData);
      expect(statusUpdate).toHaveBeenCalledWith({
        where: { rec_resource_id: recId },
        data: {
          status_code: 2,
        },
      });
    });

    it('should not update status if status_code is not provided', async () => {
      const recId = 'res4';
      const updateData = { maintenance_standard_code: '3' } as any;

      const statusUpdate = vi.fn();

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = {
          recreation_status: { update: statusUpdate },
          recreation_resource: {
            update: vi.fn().mockResolvedValue({}),
            findUnique: vi.fn().mockResolvedValue({ id: recId }),
          },
          recreation_access: { deleteMany: vi.fn(), createMany: vi.fn() },
        };
        return cb(tx);
      });

      await repo.update(recId, updateData);
      expect(statusUpdate).not.toHaveBeenCalled();
    });

    it('should set control_access_code to null when empty string provided and update main resource', async () => {
      const recId = 'res7';
      const updateData = {
        maintenance_standard_code: '4',
        control_access_code: '',
      } as any;

      let capturedUpdateData: any = null;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = {
          recreation_status: { update: vi.fn().mockResolvedValue({}) },
          recreation_resource: {
            update: vi.fn().mockImplementation((opts: any) => {
              capturedUpdateData = opts.data;
              return Promise.resolve({});
            }),
            findUnique: vi.fn().mockResolvedValue({ id: recId }),
          },
          recreation_access: { deleteMany: vi.fn(), createMany: vi.fn() },
        };
        return cb(tx);
      });

      const result = await repo.update(recId, updateData);
      expect(result).toEqual({ id: recId });
      // control_access_code should be converted to null in update data
      expect(capturedUpdateData.control_access_code).toBeNull();
    });

    it('should call deleteMany but not createMany when access_codes is empty array', async () => {
      const recId = 'res8';
      const updateData = {
        status_code: 1,
        access_codes: [],
      } as any;

      const deleteMany = vi.fn().mockResolvedValue({});
      const createMany = vi.fn().mockResolvedValue({});

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = {
          recreation_status: { update: vi.fn().mockResolvedValue({}) },
          recreation_resource: {
            update: vi.fn().mockResolvedValue({}),
            findUnique: vi.fn().mockResolvedValue({ id: recId }),
          },
          recreation_access: { deleteMany, createMany },
        };
        return cb(tx);
      });

      const result = await repo.update(recId, updateData);
      expect(result).toEqual({ id: recId });
      expect(deleteMany).toHaveBeenCalledWith({
        where: { rec_resource_id: recId },
      });
      expect(createMany).not.toHaveBeenCalled();
    });

    it('should throw when updatedResource is not found after update', async () => {
      const recId = 'res9';
      const updateData = { maintenance_standard_code: '5' } as any;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = {
          recreation_status: { update: vi.fn().mockResolvedValue({}) },
          recreation_resource: {
            update: vi.fn().mockResolvedValue({}),
            findUnique: vi.fn().mockResolvedValue(null),
          },
          recreation_access: { deleteMany: vi.fn(), createMany: vi.fn() },
        };
        return cb(tx);
      });

      // Spy on logger
      const loggerSpy = vi.spyOn((repo as any).logger, 'error');

      await expect(repo.update(recId, updateData)).rejects.toThrow(
        'Resource not found after update',
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `Failed to update recreation resource ${recId}`,
        expect.any(String),
      );
    });

    it('should re-throw Prisma errors for service layer to handle', async () => {
      const recId = 'res5';
      const updateData = { status_code: 1 } as any;

      const prismaError = new Error('Database connection failed');

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(prismaError);

      await expect(repo.update(recId, updateData)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should log errors before re-throwing', async () => {
      const recId = 'res6';
      const updateData = { status_code: 1 } as any;

      const prismaError = new Error('Some database error');

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(prismaError);

      // Spy on logger
      const loggerSpy = vi.spyOn((repo as any).logger, 'error');

      await expect(repo.update(recId, updateData)).rejects.toThrow();
      expect(loggerSpy).toHaveBeenCalledWith(
        `Failed to update recreation resource ${recId}`,
        expect.any(String),
      );
    });
  });
});
