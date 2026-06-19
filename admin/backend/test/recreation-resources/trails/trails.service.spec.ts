import { PrismaService } from '@/prisma.service';
import { TrailsRepository } from '@/recreation-resources/trails/trails.repository';
import { TrailsService } from '@/recreation-resources/trails/trails.service';
import { CreateTrailDto } from '@/recreation-resources/trails/dto/create-trail.dto';
import { UpdateTrailDto } from '@/recreation-resources/trails/dto/update-trail.dto';
import {
  RecreationTrailDto,
  TrailType,
} from '@/recreation-resources/trails/dto/recreation-trail.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('TrailsService', () => {
  let service: TrailsService;
  let repository: TrailsRepository;
  let module: TestingModule;

  const mockTrailsRepository = {
    findAllByResourceId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findOne: vi.fn(),
  };

  const mockPrismaService = {
    recreation_resource: {
      findUnique: vi.fn(),
    },
    recreation_activity_code: {
      findUnique: vi.fn(),
    },
    recreation_activity: {
      findUnique: vi.fn(),
    },
  };

  const mockTrail: RecreationTrailDto = {
    recreation_activity_code_trails_id: 1,
    recreation_activity_code: 34,
    trail_type: TrailType.BLUE,
    name: 'Test Trail',
    description: 'A test trail',
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TrailsService,
        { provide: TrailsRepository, useValue: mockTrailsRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TrailsService>(TrailsService);
    repository = module.get<TrailsRepository>(TrailsRepository);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  describe('getAll', () => {
    it('should return all trails for a resource', async () => {
      mockTrailsRepository.findAllByResourceId.mockResolvedValue([mockTrail]);

      const result = await service.getAll('REC0001');

      expect(result).toEqual([mockTrail]);
      expect(repository.findAllByResourceId).toHaveBeenCalledWith('REC0001');
    });

    it('should return empty array when resource has no trails', async () => {
      mockTrailsRepository.findAllByResourceId.mockResolvedValue([]);

      const result = await service.getAll('REC0001');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    const rec_resource_id = 'REC0001';
    const createDto: CreateTrailDto = {
      recreation_activity_code: 34,
      trail_type: TrailType.BLUE,
      name: 'New Trail',
      description: 'A new trail',
    };

    it('should create a trail when resource and activity are valid', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockPrismaService.recreation_activity_code.findUnique.mockResolvedValue({
        is_accessible: true,
      });
      mockPrismaService.recreation_activity.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockTrailsRepository.create.mockResolvedValue(mockTrail);

      const result = await service.create(rec_resource_id, createDto);

      expect(result).toEqual(mockTrail);
      expect(repository.create).toHaveBeenCalledWith(
        rec_resource_id,
        createDto,
      );
    });

    it('should throw NotFoundException when resource does not exist', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(service.create(rec_resource_id, createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(rec_resource_id, createDto)).rejects.toThrow(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when activity code is not accessible', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockPrismaService.recreation_activity_code.findUnique.mockResolvedValue({
        is_accessible: false,
      });

      await expect(service.create(rec_resource_id, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(rec_resource_id, createDto)).rejects.toThrow(
        `Activity code ${createDto.recreation_activity_code} is not an accessible activity`,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when activity code does not exist', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockPrismaService.recreation_activity_code.findUnique.mockResolvedValue(
        null,
      );

      await expect(service.create(rec_resource_id, createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when activity is not assigned to resource', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockPrismaService.recreation_activity_code.findUnique.mockResolvedValue({
        is_accessible: true,
      });
      mockPrismaService.recreation_activity.findUnique.mockResolvedValue(null);

      await expect(service.create(rec_resource_id, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(rec_resource_id, createDto)).rejects.toThrow(
        `Activity code ${createDto.recreation_activity_code} is not assigned to resource ${rec_resource_id}`,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const rec_resource_id = 'REC0001';
    const trail_id = 1;
    const updateDto: UpdateTrailDto = {
      name: 'Updated Trail',
      trail_type: TrailType.GREEN,
    };

    it('should update a trail when it belongs to the resource', async () => {
      mockTrailsRepository.findOne.mockResolvedValue({
        recreation_activity_code_trails_id: trail_id,
        rec_resource_id,
      });
      mockTrailsRepository.update.mockResolvedValue({
        ...mockTrail,
        ...updateDto,
      });

      const result = await service.update(rec_resource_id, trail_id, updateDto);

      expect(result).toEqual({ ...mockTrail, ...updateDto });
      expect(repository.update).toHaveBeenCalledWith(trail_id, updateDto);
    });

    it('should throw NotFoundException when trail does not exist', async () => {
      mockTrailsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(rec_resource_id, trail_id, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(rec_resource_id, trail_id, updateDto),
      ).rejects.toThrow(
        `Trail with ID ${trail_id} not found for recreation resource ${rec_resource_id}`,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when trail belongs to a different resource', async () => {
      mockTrailsRepository.findOne.mockResolvedValue({
        recreation_activity_code_trails_id: trail_id,
        rec_resource_id: 'REC9999',
      });

      await expect(
        service.update(rec_resource_id, trail_id, updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const rec_resource_id = 'REC0001';
    const trail_id = 1;

    it('should delete a trail when it belongs to the resource', async () => {
      mockTrailsRepository.findOne.mockResolvedValue({
        recreation_activity_code_trails_id: trail_id,
        rec_resource_id,
      });
      mockTrailsRepository.delete.mockResolvedValue(undefined);

      await service.delete(rec_resource_id, trail_id);

      expect(repository.delete).toHaveBeenCalledWith(trail_id);
    });

    it('should throw NotFoundException when trail does not exist', async () => {
      mockTrailsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(rec_resource_id, trail_id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete(rec_resource_id, trail_id)).rejects.toThrow(
        `Trail with ID ${trail_id} not found for recreation resource ${rec_resource_id}`,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when trail belongs to a different resource', async () => {
      mockTrailsRepository.findOne.mockResolvedValue({
        recreation_activity_code_trails_id: trail_id,
        rec_resource_id: 'REC9999',
      });

      await expect(service.delete(rec_resource_id, trail_id)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
