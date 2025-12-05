import { PrismaService } from '@/prisma.service';
import { RecreationResourceRepository } from '@/recreation-resources/recreation-resource.repository';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

const createBaseTx = () => ({
  recreation_status: {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
  },
  recreation_resource: {
    update: vi.fn().mockResolvedValue({}),
    findUnique: vi.fn().mockResolvedValue({ id: 'test' }),
  },
  recreation_access: { deleteMany: vi.fn(), createMany: vi.fn() },
  recreation_site_description: {
    findUnique: vi.fn(),
    deleteMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  recreation_driving_direction: {
    findUnique: vi.fn(),
    deleteMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
});

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

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = createBaseTx();
        tx.recreation_resource.findUnique.mockResolvedValue({ id: recId });
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

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = createBaseTx();
        tx.recreation_resource.findUnique.mockResolvedValue({ id: recId });
        return cb(tx);
      });

      const result = await repo.update(recId, updateData);
      expect(result).toEqual({ id: recId });
    });

    it('should only update status if status_code is provided', async () => {
      const recId = 'res3';
      const updateData = { status_code: 2 } as any;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = createBaseTx();
        tx.recreation_resource.findUnique.mockResolvedValue({ id: recId });
        return cb(tx);
      });

      await repo.update(recId, updateData);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should not update status if status_code is not provided', async () => {
      const recId = 'res4';
      const updateData = { maintenance_standard_code: '3' } as any;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = createBaseTx();
        tx.recreation_resource.findUnique.mockResolvedValue({ id: recId });
        return cb(tx);
      });

      await repo.update(recId, updateData);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should set control_access_code to null when empty string provided', async () => {
      const recId = 'res7';
      const updateData = {
        maintenance_standard_code: '4',
        control_access_code: '',
      } as any;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = createBaseTx();
        tx.recreation_resource.findUnique.mockResolvedValue({ id: recId });
        return cb(tx);
      });

      const result = await repo.update(recId, updateData);
      expect(result).toEqual({ id: recId });
    });

    it('should call deleteMany but not createMany when access_codes is empty array', async () => {
      const recId = 'res8';
      const updateData = {
        status_code: 1,
        access_codes: [],
      } as any;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = createBaseTx();
        tx.recreation_resource.findUnique.mockResolvedValue({ id: recId });
        return cb(tx);
      });

      const result = await repo.update(recId, updateData);
      expect(result).toEqual({ id: recId });
    });

    it('should throw when updatedResource is not found after update', async () => {
      const recId = 'res9';
      const updateData = { maintenance_standard_code: '5' } as any;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(async (cb: any) => {
        const tx = createBaseTx();
        tx.recreation_resource.findUnique.mockResolvedValue(null);
        return cb(tx);
      });

      const loggerSpy = vi.spyOn((repo as any).logger, 'error');

      await expect(repo.update(recId, updateData)).rejects.toThrow(
        'Resource not found after update',
      );

      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should re-throw Prisma errors for service layer to handle', async () => {
      const recId = 'res5';
      const updateData = { status_code: 1 } as any;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Database connection failed'));

      await expect(repo.update(recId, updateData)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should log errors before re-throwing', async () => {
      const recId = 'res6';
      const updateData = { status_code: 1 } as any;

      (
        prisma.$transaction as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Some database error'));

      const loggerSpy = vi.spyOn((repo as any).logger, 'error');

      await expect(repo.update(recId, updateData)).rejects.toThrow();
      expect(loggerSpy).toHaveBeenCalled();
    });

    it.each([
      {
        data: { site_description: 'New desc' },
        existing: null,
        expectedMethod: 'create',
      },
      {
        data: { site_description: 'Updated' },
        existing: { rec_resource_id: 'rec1', description: 'Old' },
        expectedMethod: 'update',
      },
      {
        data: { site_description: null },
        existing: { rec_resource_id: 'rec1', description: 'Old' },
        expectedMethod: 'update',
      },
      {
        data: { site_description: null },
        existing: null,
        expectedMethod: 'create',
      },
      {
        data: { driving_directions: 'New directions' },
        existing: null,
        expectedMethod: 'create',
      },
      {
        data: { driving_directions: 'Updated directions' },
        existing: { rec_resource_id: 'rec1', description: 'Old' },
        expectedMethod: 'update',
      },
      {
        data: { driving_directions: null },
        existing: { rec_resource_id: 'rec1', description: 'Old' },
        expectedMethod: 'update',
      },
      {
        data: { driving_directions: null },
        existing: null,
        expectedMethod: 'create',
      },
    ])(
      'should handle description field updates: %j',
      async ({ data, existing, expectedMethod }) => {
        const recId = 'rec1234';
        let capturedTx: ReturnType<typeof createBaseTx>;

        (
          prisma.$transaction as unknown as ReturnType<typeof vi.fn>
        ).mockImplementation(async (cb: any) => {
          capturedTx = createBaseTx();
          capturedTx.recreation_resource.findUnique.mockResolvedValue({
            id: recId,
          });
          capturedTx.recreation_site_description.findUnique.mockResolvedValue(
            existing,
          );
          capturedTx.recreation_driving_direction.findUnique.mockResolvedValue(
            existing,
          );
          return cb(capturedTx);
        });

        await repo.update(recId, data as any);

        const tableName =
          data.site_description !== undefined
            ? 'recreation_site_description'
            : 'recreation_driving_direction';

        expect(capturedTx![tableName][expectedMethod]).toHaveBeenCalled();
      },
    );

    it.each([
      {
        existing: null,
        status_code: 10,
        expectedMethod: 'create',
      },
      {
        existing: { rec_resource_id: 'status-case', status_code: 9 },
        status_code: 11,
        expectedMethod: 'update',
      },
    ])(
      'should %s when existing status is %j',
      async ({ existing, status_code, expectedMethod }) => {
        const recId = 'status-case';
        let capturedTx: ReturnType<typeof createBaseTx>;

        (
          prisma.$transaction as unknown as ReturnType<typeof vi.fn>
        ).mockImplementationOnce(async (cb: any) => {
          capturedTx = createBaseTx();
          capturedTx.recreation_status.findUnique.mockResolvedValue(existing);
          capturedTx.recreation_resource.findUnique.mockResolvedValue({
            id: recId,
          });
          return cb(capturedTx);
        });

        await repo.update(recId, { status_code } as any);

        if (expectedMethod === 'create') {
          expect(capturedTx!.recreation_status.create).toHaveBeenCalledWith({
            data: {
              rec_resource_id: recId,
              status_code,
              comment: 'Closed status',
            },
          });
        } else {
          expect(capturedTx!.recreation_status.update).toHaveBeenCalledWith({
            where: { rec_resource_id: recId },
            data: { status_code },
          });
        }
      },
    );
  });
});
