import { PrismaService } from '@/prisma.service';
import { OptionsRepository } from '@/recreation-resources/options/options.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('OptionsRepository', () => {
  let repository: OptionsRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  const mockTableMapping = {
    idField: 'recreation_activity_code',
    labelField: 'description',
    prismaModel: 'recreation_activity_code',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      recreation_activity_code: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      recreation_status_code: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      recreation_access_code: {
        findUnique: vi.fn(),
      },
      recreation_sub_access_code: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      recreation_access: {
        findFirst: vi.fn(),
      },
    };

    module = await Test.createTestingModule({
      providers: [
        OptionsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<OptionsRepository>(OptionsRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    if (module) {
      await module.close();
    }
  });

  describe('findAllByType', () => {
    it('should return all options for a given type', async () => {
      const mockResults = [
        { recreation_activity_code: 1, description: 'Hiking' },
        { recreation_activity_code: 2, description: 'Skiing' },
      ];

      (prisma as any).recreation_activity_code.findMany.mockResolvedValue(
        mockResults,
      );

      const result = await repository.findAllByType(mockTableMapping);

      expect(result).toEqual([
        { id: '1', label: 'Hiking' },
        { id: '2', label: 'Skiing' },
      ]);
      expect(prisma.recreation_activity_code.findMany).toHaveBeenCalledWith({
        orderBy: {
          description: 'asc',
        },
      });
    });

    it('should return recreation status options', async () => {
      const mockRecreationStatusMapping = {
        idField: 'status_code',
        labelField: 'description',
        prismaModel: 'recreation_status_code',
      };

      const mockResults = [
        { status_code: 1, description: 'Active' },
        { status_code: 2, description: 'Inactive' },
      ];

      (prisma as any).recreation_status_code.findMany.mockResolvedValue(
        mockResults,
      );

      const result = await repository.findAllByType(
        mockRecreationStatusMapping,
      );

      expect(result).toEqual([
        { id: '1', label: 'Active' },
        { id: '2', label: 'Inactive' },
      ]);
      expect(prisma.recreation_status_code.findMany).toHaveBeenCalledWith({
        orderBy: {
          description: 'asc',
        },
      });
    });

    it('should use reducer when mapping has one', async () => {
      const mockAccessMapping = {
        idField: 'access_code',
        labelField: 'access_code_description',
        prismaModel: 'recreation_access_and_sub_access_code',
        reducer: vi.fn().mockReturnValue([
          {
            id: 'BOAT',
            label: 'Boat',
            children: [{ id: 'MOTOR', label: 'Motor' }],
          },
        ]),
      };

      const mockResults = [
        {
          access_code: 'BOAT',
          access_code_description: 'Boat',
          sub_access_code: 'MOTOR',
          description: 'Motor',
        },
      ];

      (prisma as any).recreation_access_and_sub_access_code = {
        findMany: vi.fn().mockResolvedValue(mockResults),
      };

      const result = await repository.findAllByType(mockAccessMapping);

      expect(mockAccessMapping.reducer).toHaveBeenCalledWith(mockResults);
      expect(result).toEqual([
        {
          id: 'BOAT',
          label: 'Boat',
          children: [{ id: 'MOTOR', label: 'Motor' }],
        },
      ]);
    });
  });

  describe('findOneByTypeAndId', () => {
    it('should return a single option when found', async () => {
      const mockResult = { recreation_activity_code: 1, description: 'Hiking' };

      (prisma as any).recreation_activity_code.findUnique.mockResolvedValue(
        mockResult,
      );

      const result = await repository.findOneByTypeAndId(mockTableMapping, 1);

      expect(result).toEqual({ id: '1', label: 'Hiking' });
      expect(prisma.recreation_activity_code.findUnique).toHaveBeenCalledWith({
        where: { recreation_activity_code: 1 },
        select: {
          recreation_activity_code: true,
          description: true,
        },
      });
    });

    it('should return null when option not found', async () => {
      (prisma as any).recreation_activity_code.findUnique.mockResolvedValue(
        null,
      );

      const result = await repository.findOneByTypeAndId(mockTableMapping, 999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new option', async () => {
      const mockData = { description: 'Mountain Biking' };
      const mockResult = {
        recreation_activity_code: 3,
        description: 'Mountain Biking',
      };

      (prisma as any).recreation_activity_code.create.mockResolvedValue(
        mockResult,
      );

      const result = await repository.create(mockTableMapping, mockData);

      expect(result).toEqual({ id: '3', label: 'Mountain Biking' });
      expect(prisma.recreation_activity_code.create).toHaveBeenCalledWith({
        data: mockData,
        select: {
          recreation_activity_code: true,
          description: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing option', async () => {
      const mockData = { description: 'Alpine Hiking' };
      const mockResult = {
        recreation_activity_code: 1,
        description: 'Alpine Hiking',
      };

      (prisma as any).recreation_activity_code.update.mockResolvedValue(
        mockResult,
      );

      const result = await repository.update(mockTableMapping, 1, mockData);

      expect(result).toEqual({ id: '1', label: 'Alpine Hiking' });
      expect(prisma.recreation_activity_code.update).toHaveBeenCalledWith({
        where: { recreation_activity_code: 1 },
        data: mockData,
        select: {
          recreation_activity_code: true,
          description: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete an option', async () => {
      (prisma as any).recreation_activity_code.delete.mockResolvedValue({});

      await repository.remove(mockTableMapping, 1);

      expect(prisma.recreation_activity_code.delete).toHaveBeenCalledWith({
        where: { recreation_activity_code: 1 },
      });
    });
  });

  describe('findAccessCode', () => {
    it('should find access code', async () => {
      const mockAccessCode = { access_code: 'road', description: 'Road' };

      (prisma as any).recreation_access_code.findUnique.mockResolvedValue(
        mockAccessCode,
      );

      const result = await repository.findAccessCode('road');

      expect(result).toEqual(mockAccessCode);
      expect(prisma.recreation_access_code.findUnique).toHaveBeenCalledWith({
        where: { access_code: 'road' },
      });
    });
  });

  describe('findSubAccessByAccessCode', () => {
    it('should find sub-access codes by access code', async () => {
      const mockResults = [
        { sub_access_code: 'paved', description: 'Paved' },
        { sub_access_code: 'gravel', description: 'Gravel' },
      ];

      (prisma as any).recreation_sub_access_code.findMany.mockResolvedValue(
        mockResults,
      );

      const result = await repository.findSubAccessByAccessCode('road');

      expect(result).toEqual([
        { id: 'paved', label: 'Paved' },
        { id: 'gravel', label: 'Gravel' },
      ]);
      expect(prisma.recreation_sub_access_code.findMany).toHaveBeenCalledWith({
        where: {
          recreation_access: {
            some: {
              access_code: 'road',
            },
          },
        },
        select: {
          sub_access_code: true,
          description: true,
        },
        orderBy: {
          description: 'asc',
        },
      });
    });
  });

  describe('findSubAccessCode', () => {
    it('should find sub-access code', async () => {
      const mockSubAccessCode = {
        sub_access_code: 'paved',
        description: 'Paved',
      };

      (prisma as any).recreation_sub_access_code.findUnique.mockResolvedValue(
        mockSubAccessCode,
      );

      const result = await repository.findSubAccessCode('paved');

      expect(result).toEqual(mockSubAccessCode);
      expect(prisma.recreation_sub_access_code.findUnique).toHaveBeenCalledWith(
        {
          where: { sub_access_code: 'paved' },
        },
      );
    });
  });

  describe('findAccessSubAccessCombination', () => {
    it('should find access and sub-access combination', async () => {
      const mockCombination = { access_code: 'road', sub_access_code: 'paved' };

      (prisma as any).recreation_access.findFirst.mockResolvedValue(
        mockCombination,
      );

      const result = await repository.findAccessSubAccessCombination(
        'road',
        'paved',
      );

      expect(result).toEqual(mockCombination);
      expect(prisma.recreation_access.findFirst).toHaveBeenCalledWith({
        where: {
          access_code: 'road',
          sub_access_code: 'paved',
        },
      });
    });
  });

  describe('createSubAccess', () => {
    it('should create sub-access code', async () => {
      const mockResult = { sub_access_code: 'dirt', description: 'Dirt Road' };

      (prisma as any).recreation_sub_access_code.create.mockResolvedValue(
        mockResult,
      );

      const result = await repository.createSubAccess('dirt', 'Dirt Road');

      expect(result).toEqual({ id: 'dirt', label: 'Dirt Road' });
      expect(prisma.recreation_sub_access_code.create).toHaveBeenCalledWith({
        data: {
          sub_access_code: 'dirt',
          description: 'Dirt Road',
        },
        select: {
          sub_access_code: true,
          description: true,
        },
      });
    });
  });

  describe('updateSubAccess', () => {
    it('should update sub-access code', async () => {
      const mockResult = {
        sub_access_code: 'paved',
        description: 'Paved Highway',
      };

      (prisma as any).recreation_sub_access_code.update.mockResolvedValue(
        mockResult,
      );

      const result = await repository.updateSubAccess('paved', 'Paved Highway');

      expect(result).toEqual({ id: 'paved', label: 'Paved Highway' });
      expect(prisma.recreation_sub_access_code.update).toHaveBeenCalledWith({
        where: { sub_access_code: 'paved' },
        data: { description: 'Paved Highway' },
        select: {
          sub_access_code: true,
          description: true,
        },
      });
    });
  });

  describe('removeSubAccess', () => {
    it('should delete sub-access code', async () => {
      (prisma as any).recreation_sub_access_code.delete.mockResolvedValue({});

      await repository.removeSubAccess('paved');

      expect(prisma.recreation_sub_access_code.delete).toHaveBeenCalledWith({
        where: { sub_access_code: 'paved' },
      });
    });
  });
});
