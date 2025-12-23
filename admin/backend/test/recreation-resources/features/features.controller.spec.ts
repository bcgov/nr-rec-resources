import { FeaturesController } from '@/recreation-resources/features/features.controller';
import { FeaturesService } from '@/recreation-resources/features/features.service';
import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecreationFeatureDto } from '@/recreation-resources/features/dtos/recreation-feature.dto';
import { UpdateFeaturesDto } from '@/recreation-resources/features/dtos/update-features.dto';

describe('FeaturesController', () => {
  let controller: FeaturesController;
  let service: FeaturesService;
  let module: TestingModule;

  const mockFeaturesService = {
    findAll: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [FeaturesController],
      providers: [
        {
          provide: FeaturesService,
          useValue: mockFeaturesService,
        },
      ],
    }).compile();

    controller = module.get<FeaturesController>(FeaturesController);
    service = module.get<FeaturesService>(FeaturesService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  describe('getAll', () => {
    const rec_resource_id = 'REC0001';
    const mockFeatures: RecreationFeatureDto[] = [
      { recreation_feature_code: 'A1', description: 'Sport Fish' },
      { recreation_feature_code: 'B2', description: 'Sand Beach' },
    ];

    it('should return features when service resolves successfully', async () => {
      mockFeaturesService.findAll.mockResolvedValue(mockFeatures);

      const result = await controller.getAll(rec_resource_id);

      expect(result).toEqual(mockFeatures);
      expect(service.findAll).toHaveBeenCalledWith(rec_resource_id);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when resource has no features', async () => {
      mockFeaturesService.findAll.mockResolvedValue([]);

      const result = await controller.getAll(rec_resource_id);

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(rec_resource_id);
    });

    it('should propagate NotFoundException when resource not found', async () => {
      const error = new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      mockFeaturesService.findAll.mockRejectedValue(error);

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
      mockFeaturesService.findAll.mockRejectedValue(error);

      await expect(controller.getAll(rec_resource_id)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.getAll(rec_resource_id)).rejects.toThrow(
        'Error retrieving features',
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
      mockFeaturesService.findAll.mockRejectedValue(notFoundError);

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
    const updateDto: UpdateFeaturesDto = {
      feature_codes: ['A1', 'B2', 'X0'],
    };
    const mockUpdatedFeatures: RecreationFeatureDto[] = [
      { recreation_feature_code: 'A1', description: 'Sport Fish' },
      { recreation_feature_code: 'B2', description: 'Sand Beach' },
      { recreation_feature_code: 'X0', description: 'Miscellaneous Feature' },
    ];

    it('should update features when service resolves successfully', async () => {
      mockFeaturesService.update.mockResolvedValue(mockUpdatedFeatures);

      const result = await controller.update(rec_resource_id, updateDto);

      expect(result).toEqual(mockUpdatedFeatures);
      expect(service.update).toHaveBeenCalledWith(
        rec_resource_id,
        updateDto.feature_codes,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should handle empty feature codes array', async () => {
      const emptyUpdateDto: UpdateFeaturesDto = {
        feature_codes: [],
      };
      mockFeaturesService.update.mockResolvedValue([]);

      const result = await controller.update(rec_resource_id, emptyUpdateDto);

      expect(result).toEqual([]);
      expect(service.update).toHaveBeenCalledWith(rec_resource_id, []);
    });

    it('should propagate NotFoundException when resource not found', async () => {
      const error = new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      mockFeaturesService.update.mockRejectedValue(error);

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
        updateDto.feature_codes,
      );
    });

    it('should throw HttpException with 500 status for non-HttpException errors', async () => {
      const error = new Error('Database transaction failed');
      mockFeaturesService.update.mockRejectedValue(error);

      await expect(
        controller.update(rec_resource_id, updateDto),
      ).rejects.toThrow(HttpException);
      await expect(
        controller.update(rec_resource_id, updateDto),
      ).rejects.toThrow('Error updating features');

      try {
        await controller.update(rec_resource_id, updateDto);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(500);
      }
    });

    it('should not wrap HttpException errors', async () => {
      const notFoundError = new NotFoundException('Resource not found');
      mockFeaturesService.update.mockRejectedValue(notFoundError);

      await expect(
        controller.update(rec_resource_id, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(controller.update(rec_resource_id, updateDto)).rejects.toBe(
        notFoundError,
      );
    });

    it('should handle single feature code update', async () => {
      const singleFeatureDto: UpdateFeaturesDto = {
        feature_codes: ['A1'],
      };
      const singleFeature: RecreationFeatureDto[] = [
        { recreation_feature_code: 'A1', description: 'Sport Fish' },
      ];
      mockFeaturesService.update.mockResolvedValue(singleFeature);

      const result = await controller.update(rec_resource_id, singleFeatureDto);

      expect(result).toEqual(singleFeature);
      expect(service.update).toHaveBeenCalledWith(rec_resource_id, ['A1']);
    });
  });
});
