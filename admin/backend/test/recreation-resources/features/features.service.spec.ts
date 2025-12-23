import { FeaturesRepository } from '@/recreation-resources/features/features.repository';
import { FeaturesService } from '@/recreation-resources/features/features.service';
import { PrismaService } from '@/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecreationFeatureDto } from '@/recreation-resources/features/dtos/recreation-feature.dto';

describe('FeaturesService', () => {
  let service: FeaturesService;
  let repository: FeaturesRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  const mockFeaturesRepository = {
    findFeaturesByResourceId: vi.fn(),
    updateFeatures: vi.fn(),
  };

  const mockPrismaService = {
    recreation_resource: {
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        FeaturesService,
        {
          provide: FeaturesRepository,
          useValue: mockFeaturesRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FeaturesService>(FeaturesService);
    repository = module.get<FeaturesRepository>(FeaturesRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    if (module) {
      await module.close();
    }
  });

  describe('findAll', () => {
    const rec_resource_id = 'REC0001';
    const mockFeatures: RecreationFeatureDto[] = [
      { recreation_feature_code: 'A1', description: 'Sport Fish' },
      { recreation_feature_code: 'B2', description: 'Sand Beach' },
    ];

    it('should return features when resource exists', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockFeaturesRepository.findFeaturesByResourceId.mockResolvedValue(
        mockFeatures,
      );

      const result = await service.findAll(rec_resource_id);

      expect(result).toEqual(mockFeatures);
      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: { rec_resource_id: true },
      });
      expect(repository.findFeaturesByResourceId).toHaveBeenCalledWith(
        rec_resource_id,
      );
    });

    it('should throw NotFoundException when resource does not exist', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(service.findAll(rec_resource_id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findAll(rec_resource_id)).rejects.toThrow(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: { rec_resource_id: true },
      });
      expect(repository.findFeaturesByResourceId).not.toHaveBeenCalled();
    });

    it('should return empty array when resource has no features', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockFeaturesRepository.findFeaturesByResourceId.mockResolvedValue([]);

      const result = await service.findAll(rec_resource_id);

      expect(result).toEqual([]);
      expect(repository.findFeaturesByResourceId).toHaveBeenCalledWith(
        rec_resource_id,
      );
    });
  });

  describe('update', () => {
    const rec_resource_id = 'REC0001';
    const feature_codes = ['A1', 'B2', 'X0'];
    const mockUpdatedFeatures: RecreationFeatureDto[] = [
      { recreation_feature_code: 'A1', description: 'Sport Fish' },
      { recreation_feature_code: 'B2', description: 'Sand Beach' },
      { recreation_feature_code: 'X0', description: 'Miscellaneous Feature' },
    ];

    it('should update features when resource exists', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockFeaturesRepository.updateFeatures.mockResolvedValue(undefined);
      mockFeaturesRepository.findFeaturesByResourceId.mockResolvedValue(
        mockUpdatedFeatures,
      );

      const result = await service.update(rec_resource_id, feature_codes);

      expect(result).toEqual(mockUpdatedFeatures);
      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: { rec_resource_id: true },
      });
      expect(repository.updateFeatures).toHaveBeenCalledWith(
        rec_resource_id,
        feature_codes,
      );
      expect(repository.findFeaturesByResourceId).toHaveBeenCalledWith(
        rec_resource_id,
      );
    });

    it('should throw NotFoundException when resource does not exist', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(
        service.update(rec_resource_id, feature_codes),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(rec_resource_id, feature_codes),
      ).rejects.toThrow(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: { rec_resource_id: true },
      });
      expect(repository.updateFeatures).not.toHaveBeenCalled();
      expect(repository.findFeaturesByResourceId).not.toHaveBeenCalled();
    });

    it('should handle empty feature codes array', async () => {
      const emptyCodes: string[] = [];
      const emptyFeatures: RecreationFeatureDto[] = [];

      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockFeaturesRepository.updateFeatures.mockResolvedValue(undefined);
      mockFeaturesRepository.findFeaturesByResourceId.mockResolvedValue(
        emptyFeatures,
      );

      const result = await service.update(rec_resource_id, emptyCodes);

      expect(result).toEqual(emptyFeatures);
      expect(repository.updateFeatures).toHaveBeenCalledWith(
        rec_resource_id,
        emptyCodes,
      );
    });

    it('should handle single feature code', async () => {
      const singleCode = ['A1'];
      const singleFeature: RecreationFeatureDto[] = [
        { recreation_feature_code: 'A1', description: 'Sport Fish' },
      ];

      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockFeaturesRepository.updateFeatures.mockResolvedValue(undefined);
      mockFeaturesRepository.findFeaturesByResourceId.mockResolvedValue(
        singleFeature,
      );

      const result = await service.update(rec_resource_id, singleCode);

      expect(result).toEqual(singleFeature);
      expect(repository.updateFeatures).toHaveBeenCalledWith(
        rec_resource_id,
        singleCode,
      );
    });
  });
});
