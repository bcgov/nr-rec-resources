import { beforeEach, describe, expect, it, vi, Mocked } from 'vitest';
import { RecreationResourceRepository } from '@/recreation-resource/recreation-resource.repository';
import { PrismaService } from '@/prisma.service';

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
});
