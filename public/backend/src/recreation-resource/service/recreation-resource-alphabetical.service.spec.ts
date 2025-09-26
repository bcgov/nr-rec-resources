import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecreationResourceAlphabeticalService } from './recreation-resource-alphabetical.service';
import { AlphabeticalRecreationResourceDto } from '../dto/alphabetical-recreation-resource.dto';

describe('RecreationResourceAlphabeticalService', () => {
  let service: RecreationResourceAlphabeticalService;

  const mockPrismaService = {
    recreation_resource: {
      findMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceAlphabeticalService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RecreationResourceAlphabeticalService>(
      RecreationResourceAlphabeticalService,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAlphabeticalResources', () => {
    const mockResource = {
      rec_resource_id: 'REC001',
      name: 'Alpine Trail',
      closest_community: 'Merritt',
      recreation_resource_type_view: [
        {
          rec_resource_type_code: 'TRAIL',
          description: 'Trail',
        },
      ],
    };

    const expectedResource: AlphabeticalRecreationResourceDto = {
      rec_resource_id: 'REC001',
      name: 'Alpine Trail',
      closest_community: 'Merritt',
      recreation_resource_type: 'Trail',
      recreation_resource_type_code: 'TRAIL',
    };

    it('should return resources starting with a specific letter', async () => {
      mockPrismaService.recreation_resource.findMany.mockResolvedValue([
        mockResource,
      ]);

      const result = await service.getAlphabeticalResources('A');

      expect(result).toEqual([expectedResource]);
      expect(
        mockPrismaService.recreation_resource.findMany,
      ).toHaveBeenCalledWith({
        where: {
          display_on_public_site: true,
          name: { startsWith: 'A', mode: 'insensitive' },
        },
        select: {
          rec_resource_id: true,
          name: true,
          closest_community: true,
          recreation_resource_type_view: {
            select: { rec_resource_type_code: true, description: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should handle case-insensitive filtering', async () => {
      mockPrismaService.recreation_resource.findMany.mockResolvedValue([
        mockResource,
      ]);

      await service.getAlphabeticalResources('a');

      const callArgs =
        mockPrismaService.recreation_resource.findMany.mock.calls[0][0];
      expect(callArgs.where.name.startsWith).toBe('A');
    });

    it('should return resources starting with numbers when letter is #', async () => {
      mockPrismaService.recreation_resource.findMany.mockResolvedValue([
        mockResource,
      ]);

      await service.getAlphabeticalResources('#');

      const callArgs =
        mockPrismaService.recreation_resource.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toHaveLength(10);
      expect(callArgs.where.OR[0]).toEqual({
        name: { startsWith: '0', mode: 'insensitive' },
      });
    });

    it('should return empty array when no resources found', async () => {
      mockPrismaService.recreation_resource.findMany.mockResolvedValue([]);

      const result = await service.getAlphabeticalResources('Z');

      expect(result).toEqual([]);
    });

    it('should filter by type when type parameter is provided', async () => {
      mockPrismaService.recreation_resource.findMany.mockResolvedValue([
        mockResource,
      ]);

      const result = await service.getAlphabeticalResources('A', 'TRAIL');

      expect(result).toEqual([expectedResource]);
      expect(
        mockPrismaService.recreation_resource.findMany,
      ).toHaveBeenCalledWith({
        where: {
          display_on_public_site: true,
          name: { startsWith: 'A', mode: 'insensitive' },
          recreation_resource_type_view: {
            some: { rec_resource_type_code: 'TRAIL' },
          },
        },
        select: {
          rec_resource_id: true,
          name: true,
          closest_community: true,
          recreation_resource_type_view: {
            select: { rec_resource_type_code: true, description: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });
  });
});
