import { PrismaService } from '@/prisma.service';
import { TrailsRepository } from '@/recreation-resources/trails/trails.repository';
import { CreateTrailDto } from '@/recreation-resources/trails/dto/create-trail.dto';
import { UpdateTrailDto } from '@/recreation-resources/trails/dto/update-trail.dto';
import { TrailType } from '@/recreation-resources/trails/dto/recreation-trail.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('TrailsRepository', () => {
  let repository: TrailsRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  const mockPrismaService = {
    recreation_activity_code_trails: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  const prismaTrailRecord = {
    recreation_activity_code_trails_id: 1,
    rec_resource_id: 'REC0001',
    recreation_activity_code: 34,
    trail_type: 'BLUE',
    name: 'Test Trail',
    description: 'A test trail',
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TrailsRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<TrailsRepository>(TrailsRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  describe('findAllByResourceId', () => {
    it('should return mapped trails for a resource', async () => {
      mockPrismaService.recreation_activity_code_trails.findMany.mockResolvedValue(
        [prismaTrailRecord],
      );

      const result = await repository.findAllByResourceId('REC0001');

      expect(result).toEqual([
        {
          recreation_activity_code_trails_id: 1,
          recreation_activity_code: 34,
          trail_type: TrailType.BLUE,
          name: 'Test Trail',
          description: 'A test trail',
        },
      ]);
      expect(
        prisma.recreation_activity_code_trails.findMany,
      ).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC0001' },
        select: {
          recreation_activity_code_trails_id: true,
          recreation_activity_code: true,
          trail_type: true,
          name: true,
          description: true,
        },
        orderBy: [{ recreation_activity_code: 'asc' }, { name: 'asc' }],
      });
    });

    it('should return empty array when no trails exist', async () => {
      mockPrismaService.recreation_activity_code_trails.findMany.mockResolvedValue(
        [],
      );

      const result = await repository.findAllByResourceId('REC0001');

      expect(result).toEqual([]);
    });

    it('should map null trail_type to null', async () => {
      mockPrismaService.recreation_activity_code_trails.findMany.mockResolvedValue(
        [{ ...prismaTrailRecord, trail_type: null }],
      );

      const result = await repository.findAllByResourceId('REC0001');

      expect(result[0].trail_type).toBeNull();
    });

    it('should map null description to undefined', async () => {
      mockPrismaService.recreation_activity_code_trails.findMany.mockResolvedValue(
        [{ ...prismaTrailRecord, description: null }],
      );

      const result = await repository.findAllByResourceId('REC0001');

      expect(result[0].description).toBeUndefined();
    });
  });

  describe('create', () => {
    const createDto: CreateTrailDto = {
      recreation_activity_code: 34,
      trail_type: TrailType.BLUE,
      name: 'New Trail',
      description: 'A new trail',
    };

    it('should create and return a mapped trail', async () => {
      mockPrismaService.recreation_activity_code_trails.create.mockResolvedValue(
        prismaTrailRecord,
      );

      const result = await repository.create('REC0001', createDto);

      expect(result).toEqual({
        recreation_activity_code_trails_id: 1,
        recreation_activity_code: 34,
        trail_type: TrailType.BLUE,
        name: 'Test Trail',
        description: 'A test trail',
      });
      expect(
        prisma.recreation_activity_code_trails.create,
      ).toHaveBeenCalledWith({
        data: {
          rec_resource_id: 'REC0001',
          recreation_activity_code: createDto.recreation_activity_code,
          trail_type: createDto.trail_type,
          name: createDto.name,
          description: createDto.description,
        },
      });
    });

    it('should pass null for undefined trail_type', async () => {
      const dtoNoType: CreateTrailDto = { ...createDto, trail_type: undefined };
      mockPrismaService.recreation_activity_code_trails.create.mockResolvedValue(
        {
          ...prismaTrailRecord,
          trail_type: null,
        },
      );

      await repository.create('REC0001', dtoNoType);

      expect(
        prisma.recreation_activity_code_trails.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ trail_type: null }),
        }),
      );
    });

    it('should pass null when description is undefined', async () => {
      const dtoNoDesc: CreateTrailDto = {
        ...createDto,
        description: undefined,
      };
      mockPrismaService.recreation_activity_code_trails.create.mockResolvedValue(
        prismaTrailRecord,
      );

      await repository.create('REC0001', dtoNoDesc);

      expect(
        prisma.recreation_activity_code_trails.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ description: null }),
        }),
      );
    });

    it('should map null description on created trail to undefined', async () => {
      mockPrismaService.recreation_activity_code_trails.create.mockResolvedValue(
        { ...prismaTrailRecord, description: null },
      );

      const result = await repository.create('REC0001', createDto);

      expect(result.description).toBeUndefined();
    });
  });

  describe('update', () => {
    const updateDto: UpdateTrailDto = {
      name: 'Updated Trail',
      trail_type: TrailType.GREEN,
    };

    it('should update and return a mapped trail', async () => {
      const updatedRecord = {
        ...prismaTrailRecord,
        name: 'Updated Trail',
        trail_type: 'GREEN',
      };
      mockPrismaService.recreation_activity_code_trails.update.mockResolvedValue(
        updatedRecord,
      );

      const result = await repository.update(1, updateDto);

      expect(result.name).toBe('Updated Trail');
      expect(result.trail_type).toBe(TrailType.GREEN);
      expect(
        prisma.recreation_activity_code_trails.update,
      ).toHaveBeenCalledWith({
        where: { recreation_activity_code_trails_id: 1 },
        data: {
          trail_type: TrailType.GREEN,
          name: 'Updated Trail',
        },
      });
    });

    it('should only include defined fields in the update data', async () => {
      const partialDto: UpdateTrailDto = { name: 'Partial Update' };
      mockPrismaService.recreation_activity_code_trails.update.mockResolvedValue(
        {
          ...prismaTrailRecord,
          name: 'Partial Update',
        },
      );

      await repository.update(1, partialDto);

      const callArgs =
        mockPrismaService.recreation_activity_code_trails.update.mock
          .calls[0][0];
      expect(callArgs.data).toEqual({ name: 'Partial Update' });
      expect(callArgs.data).not.toHaveProperty('trail_type');
    });

    it('should pass null when trail_type is explicitly null', async () => {
      const dtoNullType: UpdateTrailDto = { trail_type: null, name: 'Trail' };
      mockPrismaService.recreation_activity_code_trails.update.mockResolvedValue(
        { ...prismaTrailRecord, trail_type: null, name: 'Trail' },
      );

      await repository.update(1, dtoNullType);

      const callArgs =
        mockPrismaService.recreation_activity_code_trails.update.mock
          .calls[0][0];
      expect(callArgs.data).toHaveProperty('trail_type', null);
    });

    it('should include description in update data when defined', async () => {
      const dtoWithDesc: UpdateTrailDto = { description: 'Updated desc' };
      mockPrismaService.recreation_activity_code_trails.update.mockResolvedValue(
        { ...prismaTrailRecord, description: 'Updated desc' },
      );

      await repository.update(1, dtoWithDesc);

      const callArgs =
        mockPrismaService.recreation_activity_code_trails.update.mock
          .calls[0][0];
      expect(callArgs.data).toEqual({ description: 'Updated desc' });
    });

    it('should map null trail_type and null description on updated trail', async () => {
      mockPrismaService.recreation_activity_code_trails.update.mockResolvedValue(
        { ...prismaTrailRecord, trail_type: null, description: null },
      );

      const result = await repository.update(1, { name: 'Trail' });

      expect(result.trail_type).toBeNull();
      expect(result.description).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should call prisma delete with the correct trail id', async () => {
      mockPrismaService.recreation_activity_code_trails.delete.mockResolvedValue(
        undefined,
      );

      await repository.delete(1);

      expect(
        prisma.recreation_activity_code_trails.delete,
      ).toHaveBeenCalledWith({
        where: { recreation_activity_code_trails_id: 1 },
      });
    });
  });

  describe('findOne', () => {
    it('should return trail id and resource id when trail exists', async () => {
      mockPrismaService.recreation_activity_code_trails.findUnique.mockResolvedValue(
        {
          recreation_activity_code_trails_id: 1,
          rec_resource_id: 'REC0001',
        },
      );

      const result = await repository.findOne(1);

      expect(result).toEqual({
        recreation_activity_code_trails_id: 1,
        rec_resource_id: 'REC0001',
      });
      expect(
        prisma.recreation_activity_code_trails.findUnique,
      ).toHaveBeenCalledWith({
        where: { recreation_activity_code_trails_id: 1 },
        select: {
          recreation_activity_code_trails_id: true,
          rec_resource_id: true,
        },
      });
    });

    it('should return null when trail does not exist', async () => {
      mockPrismaService.recreation_activity_code_trails.findUnique.mockResolvedValue(
        null,
      );

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });
  });
});
