import { ActivitiesController } from '@/recreation-resources/activities/activities.controller';
import { ActivitiesService } from '@/recreation-resources/activities/activities.service';
import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecreationActivityDto } from '@/recreation-resources/dtos/recreation-resource-detail.dto';
import { UpdateActivitiesDto } from '@/recreation-resources/activities/dtos/update-activities.dto';

describe('ActivitiesController', () => {
  let controller: ActivitiesController;
  let service: ActivitiesService;
  let module: TestingModule;

  const mockActivitiesService = {
    findAll: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
        },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    service = module.get<ActivitiesService>(ActivitiesService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  describe('getAll', () => {
    const rec_resource_id = 'REC0001';
    const mockActivities: RecreationActivityDto[] = [
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
      {
        recreation_activity_code: 2,
        description: 'Camping',
      },
    ];

    it('should return activities when service resolves successfully', async () => {
      mockActivitiesService.findAll.mockResolvedValue(mockActivities);

      const result = await controller.getAll(rec_resource_id);

      expect(result).toEqual(mockActivities);
      expect(service.findAll).toHaveBeenCalledWith(rec_resource_id);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when resource has no activities', async () => {
      mockActivitiesService.findAll.mockResolvedValue([]);

      const result = await controller.getAll(rec_resource_id);

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(rec_resource_id);
    });

    it('should propagate NotFoundException when resource not found', async () => {
      const error = new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      mockActivitiesService.findAll.mockRejectedValue(error);

      await expect(controller.getAll(rec_resource_id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getAll(rec_resource_id)).rejects.toThrow(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      expect(service.findAll).toHaveBeenCalledWith(rec_resource_id);
    });

    it('should throw HttpException with 500 status for non-HttpException errors', async () => {
      const error = new Error('Database connection failed');
      mockActivitiesService.findAll.mockRejectedValue(error);

      await expect(controller.getAll(rec_resource_id)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.getAll(rec_resource_id)).rejects.toThrow(
        'Error retrieving activities',
      );

      try {
        await controller.getAll(rec_resource_id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(500);
      }
    });

    it('should not wrap HttpException errors', async () => {
      const notFoundError = new NotFoundException('Resource not found');
      mockActivitiesService.findAll.mockRejectedValue(notFoundError);

      await expect(controller.getAll(rec_resource_id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getAll(rec_resource_id)).rejects.toBe(
        notFoundError,
      );
    });
  });

  describe('update', () => {
    const rec_resource_id = 'REC0001';
    const updateDto: UpdateActivitiesDto = {
      activity_codes: [1, 2, 3],
    };
    const mockUpdatedActivities: RecreationActivityDto[] = [
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
      {
        recreation_activity_code: 2,
        description: 'Camping',
      },
      {
        recreation_activity_code: 3,
        description: 'Fishing',
      },
    ];

    it('should update activities when service resolves successfully', async () => {
      mockActivitiesService.update.mockResolvedValue(mockUpdatedActivities);

      const result = await controller.update(rec_resource_id, updateDto);

      expect(result).toEqual(mockUpdatedActivities);
      expect(service.update).toHaveBeenCalledWith(
        rec_resource_id,
        updateDto.activity_codes,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should handle empty activity codes array', async () => {
      const emptyUpdateDto: UpdateActivitiesDto = {
        activity_codes: [],
      };
      mockActivitiesService.update.mockResolvedValue([]);

      const result = await controller.update(rec_resource_id, emptyUpdateDto);

      expect(result).toEqual([]);
      expect(service.update).toHaveBeenCalledWith(rec_resource_id, []);
    });

    it('should propagate NotFoundException when resource not found', async () => {
      const error = new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      mockActivitiesService.update.mockRejectedValue(error);

      await expect(
        controller.update(rec_resource_id, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.update(rec_resource_id, updateDto),
      ).rejects.toThrow(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      expect(service.update).toHaveBeenCalledWith(
        rec_resource_id,
        updateDto.activity_codes,
      );
    });

    it('should throw HttpException with 500 status for non-HttpException errors', async () => {
      const error = new Error('Database transaction failed');
      mockActivitiesService.update.mockRejectedValue(error);

      await expect(
        controller.update(rec_resource_id, updateDto),
      ).rejects.toThrow(HttpException);
      await expect(
        controller.update(rec_resource_id, updateDto),
      ).rejects.toThrow('Error updating activities');

      try {
        await controller.update(rec_resource_id, updateDto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(500);
      }
    });

    it('should not wrap HttpException errors', async () => {
      const notFoundError = new NotFoundException('Resource not found');
      mockActivitiesService.update.mockRejectedValue(notFoundError);

      await expect(
        controller.update(rec_resource_id, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(controller.update(rec_resource_id, updateDto)).rejects.toBe(
        notFoundError,
      );
    });

    it('should handle single activity code update', async () => {
      const singleActivityDto: UpdateActivitiesDto = {
        activity_codes: [1],
      };
      const singleActivity: RecreationActivityDto[] = [
        {
          recreation_activity_code: 1,
          description: 'Hiking',
        },
      ];
      mockActivitiesService.update.mockResolvedValue(singleActivity);

      const result = await controller.update(
        rec_resource_id,
        singleActivityDto,
      );

      expect(result).toEqual(singleActivity);
      expect(service.update).toHaveBeenCalledWith(rec_resource_id, [1]);
    });
  });
});
