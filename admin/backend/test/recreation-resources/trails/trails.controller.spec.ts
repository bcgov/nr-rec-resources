import { TrailsController } from '@/recreation-resources/trails/trails.controller';
import { TrailsService } from '@/recreation-resources/trails/trails.service';
import { CreateTrailDto } from '@/recreation-resources/trails/dto/create-trail.dto';
import { UpdateTrailDto } from '@/recreation-resources/trails/dto/update-trail.dto';
import {
  RecreationTrailDto,
  TrailType,
} from '@/recreation-resources/trails/dto/recreation-trail.dto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('TrailsController', () => {
  let controller: TrailsController;
  let service: TrailsService;
  let module: TestingModule;

  const mockTrailsService = {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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
      controllers: [TrailsController],
      providers: [{ provide: TrailsService, useValue: mockTrailsService }],
    }).compile();

    controller = module.get<TrailsController>(TrailsController);
    service = module.get<TrailsService>(TrailsService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  describe('getAll', () => {
    it('should return trails for a resource', async () => {
      mockTrailsService.getAll.mockResolvedValue([mockTrail]);

      const result = await controller.getAll('REC0001');

      expect(result).toEqual([mockTrail]);
      expect(service.getAll).toHaveBeenCalledWith('REC0001');
    });

    it('should return empty array when no trails exist', async () => {
      mockTrailsService.getAll.mockResolvedValue([]);

      const result = await controller.getAll('REC0001');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    const rec_resource_id = 'REC0001';
    const createDto: CreateTrailDto = {
      recreation_activity_code: 34,
      trail_type: TrailType.BLUE,
      name: 'New Trail',
    };

    it('should create and return a trail', async () => {
      mockTrailsService.create.mockResolvedValue(mockTrail);

      const result = await controller.create(rec_resource_id, createDto);

      expect(result).toEqual(mockTrail);
      expect(service.create).toHaveBeenCalledWith(rec_resource_id, createDto);
    });

    it('should propagate NotFoundException from service', async () => {
      const error = new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      mockTrailsService.create.mockRejectedValue(error);

      await expect(
        controller.create(rec_resource_id, createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should propagate BadRequestException from service', async () => {
      const error = new BadRequestException(
        'Activity code 34 is not an accessible activity',
      );
      mockTrailsService.create.mockRejectedValue(error);

      await expect(
        controller.create(rec_resource_id, createDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should wrap non-HttpException errors in a 500 HttpException', async () => {
      mockTrailsService.create.mockRejectedValue(new Error('DB failure'));

      try {
        await controller.create(rec_resource_id, createDto);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect((e as HttpException).message).toBe('Error creating trail');
      }
    });
  });

  describe('update', () => {
    const rec_resource_id = 'REC0001';
    const trail_id = 1;
    const updateDto: UpdateTrailDto = { name: 'Updated Trail' };

    it('should update and return a trail', async () => {
      const updated = { ...mockTrail, name: 'Updated Trail' };
      mockTrailsService.update.mockResolvedValue(updated);

      const result = await controller.update(
        rec_resource_id,
        trail_id,
        updateDto,
      );

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(
        rec_resource_id,
        trail_id,
        updateDto,
      );
    });

    it('should propagate NotFoundException from service', async () => {
      mockTrailsService.update.mockRejectedValue(
        new NotFoundException(
          `Trail with ID ${trail_id} not found for recreation resource ${rec_resource_id}`,
        ),
      );

      await expect(
        controller.update(rec_resource_id, trail_id, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should wrap non-HttpException errors in a 500 HttpException', async () => {
      mockTrailsService.update.mockRejectedValue(new Error('DB failure'));

      try {
        await controller.update(rec_resource_id, trail_id, updateDto);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect((e as HttpException).message).toBe('Error updating trail');
      }
    });
  });

  describe('delete', () => {
    const rec_resource_id = 'REC0001';
    const trail_id = 1;

    it('should delete a trail and return void', async () => {
      mockTrailsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(rec_resource_id, trail_id);

      expect(result).toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(rec_resource_id, trail_id);
    });

    it('should propagate NotFoundException from service', async () => {
      mockTrailsService.delete.mockRejectedValue(
        new NotFoundException(
          `Trail with ID ${trail_id} not found for recreation resource ${rec_resource_id}`,
        ),
      );

      await expect(
        controller.delete(rec_resource_id, trail_id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should wrap non-HttpException errors in a 500 HttpException', async () => {
      mockTrailsService.delete.mockRejectedValue(new Error('DB failure'));

      try {
        await controller.delete(rec_resource_id, trail_id);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect((e as HttpException).message).toBe('Error deleting trail');
      }
    });
  });
});
