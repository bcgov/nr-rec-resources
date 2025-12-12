import { ActivitiesRepository } from '@/recreation-resources/activities/activities.repository';
import { ActivitiesService } from '@/recreation-resources/activities/activities.service';
import { PrismaService } from '@/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecreationActivityDto } from '@/recreation-resources/dtos/recreation-resource-detail.dto';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let repository: ActivitiesRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  const mockActivitiesRepository = {
    findActivitiesByResourceId: vi.fn(),
    updateActivities: vi.fn(),
  };

  const mockPrismaService = {
    recreation_resource: {
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: ActivitiesRepository,
          useValue: mockActivitiesRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    repository = module.get<ActivitiesRepository>(ActivitiesRepository);
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

    it('should return activities when resource exists', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockActivitiesRepository.findActivitiesByResourceId.mockResolvedValue(
        mockActivities,
      );

      const result = await service.findAll(rec_resource_id);

      expect(result).toEqual(mockActivities);
      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: { rec_resource_id: true },
      });
      expect(repository.findActivitiesByResourceId).toHaveBeenCalledWith(
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
      expect(repository.findActivitiesByResourceId).not.toHaveBeenCalled();
    });

    it('should return empty array when resource has no activities', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockActivitiesRepository.findActivitiesByResourceId.mockResolvedValue([]);

      const result = await service.findAll(rec_resource_id);

      expect(result).toEqual([]);
      expect(repository.findActivitiesByResourceId).toHaveBeenCalledWith(
        rec_resource_id,
      );
    });
  });

  describe('update', () => {
    const rec_resource_id = 'REC0001';
    const activity_codes = [1, 2, 3];
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

    it('should update activities when resource exists', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockActivitiesRepository.updateActivities.mockResolvedValue(undefined);
      mockActivitiesRepository.findActivitiesByResourceId.mockResolvedValue(
        mockUpdatedActivities,
      );

      const result = await service.update(rec_resource_id, activity_codes);

      expect(result).toEqual(mockUpdatedActivities);
      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: { rec_resource_id: true },
      });
      expect(repository.updateActivities).toHaveBeenCalledWith(
        rec_resource_id,
        activity_codes,
      );
      expect(repository.findActivitiesByResourceId).toHaveBeenCalledWith(
        rec_resource_id,
      );
    });

    it('should throw NotFoundException when resource does not exist', async () => {
      mockPrismaService.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(
        service.update(rec_resource_id, activity_codes),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(rec_resource_id, activity_codes),
      ).rejects.toThrow(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id },
        select: { rec_resource_id: true },
      });
      expect(repository.updateActivities).not.toHaveBeenCalled();
      expect(repository.findActivitiesByResourceId).not.toHaveBeenCalled();
    });

    it('should handle empty activity codes array', async () => {
      const emptyActivityCodes: number[] = [];
      const emptyActivities: RecreationActivityDto[] = [];

      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockActivitiesRepository.updateActivities.mockResolvedValue(undefined);
      mockActivitiesRepository.findActivitiesByResourceId.mockResolvedValue(
        emptyActivities,
      );

      const result = await service.update(rec_resource_id, emptyActivityCodes);

      expect(result).toEqual(emptyActivities);
      expect(repository.updateActivities).toHaveBeenCalledWith(
        rec_resource_id,
        emptyActivityCodes,
      );
    });

    it('should handle single activity code', async () => {
      const singleActivityCode = [1];
      const singleActivity: RecreationActivityDto[] = [
        {
          recreation_activity_code: 1,
          description: 'Hiking',
        },
      ];

      mockPrismaService.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id,
      });
      mockActivitiesRepository.updateActivities.mockResolvedValue(undefined);
      mockActivitiesRepository.findActivitiesByResourceId.mockResolvedValue(
        singleActivity,
      );

      const result = await service.update(rec_resource_id, singleActivityCode);

      expect(result).toEqual(singleActivity);
      expect(repository.updateActivities).toHaveBeenCalledWith(
        rec_resource_id,
        singleActivityCode,
      );
    });
  });
});
