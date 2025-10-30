import { OptionsRepository } from '@/recreation-resources/options/options.repository';
import { OptionsService } from '@/recreation-resources/options/options.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('OptionsService', () => {
  let service: OptionsService;
  let repository: OptionsRepository;
  let module: TestingModule;

  beforeEach(async () => {
    const mockOptionsRepository = {
      findAllByType: vi.fn(),
      findOneByTypeAndId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      findAccessCode: vi.fn(),
      findSubAccessByAccessCode: vi.fn(),
      findSubAccessCode: vi.fn(),
      findAccessSubAccessCombination: vi.fn(),
      createSubAccess: vi.fn(),
      updateSubAccess: vi.fn(),
      removeSubAccess: vi.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        OptionsService,
        {
          provide: OptionsRepository,
          useValue: mockOptionsRepository,
        },
      ],
    }).compile();

    service = module.get<OptionsService>(OptionsService);
    repository = module.get<OptionsRepository>(OptionsRepository);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    if (module) {
      await module.close();
    }
  });

  describe('validateOptionType', () => {
    it('should accept valid option types', () => {
      expect(() => service['validateOptionType']('activities')).not.toThrow();
      expect(() => service['validateOptionType']('regions')).not.toThrow();
      expect(() => service['validateOptionType']('access')).not.toThrow();
      expect(() =>
        service['validateOptionType']('recreationStatus'),
      ).not.toThrow();
    });

    it('should reject invalid option types', () => {
      expect(() => service['validateOptionType']('invalid')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllByType', () => {
    it('should return activities', async () => {
      const mockActivities = [
        { id: '1', label: 'Hiking' },
        { id: '2', label: 'Skiing' },
      ];

      repository.findAllByType = vi.fn().mockResolvedValue(mockActivities);

      const result = await service.findAllByType('activities');

      expect(result).toEqual(mockActivities);
      expect(repository.findAllByType).toHaveBeenCalledWith({
        idField: 'recreation_activity_code',
        labelField: 'description',
        prismaModel: 'recreation_activity_code',
      });
    });

    it('should return regions', async () => {
      const mockRegions = [
        { id: 'VAN', label: 'Vancouver' },
        { id: 'VIC', label: 'Victoria' },
      ];

      repository.findAllByType = vi.fn().mockResolvedValue(mockRegions);

      const result = await service.findAllByType('regions');

      expect(result).toEqual(mockRegions);
      expect(repository.findAllByType).toHaveBeenCalledWith({
        idField: 'district_code',
        labelField: 'description',
        prismaModel: 'recreation_district_code',
      });
    });

    it('should return recreation status options', async () => {
      const mockRecreationStatus = [
        { id: '1', label: 'Active' },
        { id: '2', label: 'Inactive' },
      ];

      repository.findAllByType = vi
        .fn()
        .mockResolvedValue(mockRecreationStatus);

      const result = await service.findAllByType('recreationStatus');

      expect(result).toEqual(mockRecreationStatus);
      expect(repository.findAllByType).toHaveBeenCalledWith({
        idField: 'status_code',
        labelField: 'description',
        prismaModel: 'recreation_status_code',
      });
    });
  });

  describe('findOneByTypeAndId', () => {
    it('should return a single activity', async () => {
      const mockActivity = { id: '1', label: 'Hiking' };

      repository.findOneByTypeAndId = vi.fn().mockResolvedValue(mockActivity);

      const result = await service.findOneByTypeAndId('activities', '1');

      expect(result).toEqual(mockActivity);
      expect(repository.findOneByTypeAndId).toHaveBeenCalledWith(
        {
          idField: 'recreation_activity_code',
          labelField: 'description',
          prismaModel: 'recreation_activity_code',
        },
        1,
      );
    });

    it('should throw NotFoundException for non-existent option', async () => {
      repository.findOneByTypeAndId = vi.fn().mockResolvedValue(null);

      await expect(
        service.findOneByTypeAndId('activities', '999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new activity', async () => {
      const mockCreatedActivity = { id: '3', label: 'Mountain Biking' };

      repository.create = vi.fn().mockResolvedValue(mockCreatedActivity);

      const result = await service.create('activities', {
        label: 'Mountain Biking',
      });

      expect(result).toEqual(mockCreatedActivity);
      expect(repository.create).toHaveBeenCalledWith(
        {
          idField: 'recreation_activity_code',
          labelField: 'description',
          prismaModel: 'recreation_activity_code',
        },
        { description: 'Mountain Biking' },
      );
    });

    it('should create a new region with generated ID', async () => {
      const mockCreatedRegion = {
        id: 'mountain_b',
        label: 'Mountain Bike Region',
      };

      repository.create = vi.fn().mockResolvedValue(mockCreatedRegion);

      const result = await service.create('regions', {
        label: 'Mountain Bike Region',
      });

      expect(result).toEqual(mockCreatedRegion);
      expect(repository.create).toHaveBeenCalledWith(
        {
          idField: 'district_code',
          labelField: 'description',
          prismaModel: 'recreation_district_code',
        },
        { district_code: 'mountain_b', description: 'Mountain Bike Region' },
      );
    });
  });

  describe('update', () => {
    it('should update an existing option', async () => {
      const mockExistingActivity = { id: '1', label: 'Hiking' };
      const mockUpdatedActivity = { id: '1', label: 'Alpine Hiking' };

      repository.findOneByTypeAndId = vi
        .fn()
        .mockResolvedValue(mockExistingActivity);
      repository.update = vi.fn().mockResolvedValue(mockUpdatedActivity);

      const result = await service.update('activities', '1', {
        label: 'Alpine Hiking',
      });

      expect(result).toEqual(mockUpdatedActivity);
      expect(repository.findOneByTypeAndId).toHaveBeenCalledWith(
        {
          idField: 'recreation_activity_code',
          labelField: 'description',
          prismaModel: 'recreation_activity_code',
        },
        1,
      );
      expect(repository.update).toHaveBeenCalledWith(
        {
          idField: 'recreation_activity_code',
          labelField: 'description',
          prismaModel: 'recreation_activity_code',
        },
        1,
        { description: 'Alpine Hiking' },
      );
    });
  });

  describe('remove', () => {
    it('should remove an existing option', async () => {
      const mockExistingActivity = { id: '1', label: 'Hiking' };

      repository.findOneByTypeAndId = vi
        .fn()
        .mockResolvedValue(mockExistingActivity);
      repository.remove = vi.fn().mockResolvedValue(undefined);

      await service.remove('activities', '1');

      expect(repository.findOneByTypeAndId).toHaveBeenCalledWith(
        {
          idField: 'recreation_activity_code',
          labelField: 'description',
          prismaModel: 'recreation_activity_code',
        },
        1,
      );
      expect(repository.remove).toHaveBeenCalledWith(
        {
          idField: 'recreation_activity_code',
          labelField: 'description',
          prismaModel: 'recreation_activity_code',
        },
        1,
      );
    });
  });

  describe('sub-access methods', () => {
    describe('findSubAccessByAccessCode', () => {
      it('should return sub-access options for valid access code', async () => {
        const mockAccessCode = { access_code: 'road', description: 'Road' };
        const mockSubAccessCodes = [
          { id: 'paved', label: 'Paved' },
          { id: 'gravel', label: 'Gravel' },
        ];

        repository.findAccessCode = vi.fn().mockResolvedValue(mockAccessCode);
        repository.findSubAccessByAccessCode = vi
          .fn()
          .mockResolvedValue(mockSubAccessCodes);

        const result = await service.findSubAccessByAccessCode('road');

        expect(result).toEqual(mockSubAccessCodes);
        expect(repository.findAccessCode).toHaveBeenCalledWith('road');
        expect(repository.findSubAccessByAccessCode).toHaveBeenCalledWith(
          'road',
        );
      });

      it('should throw NotFoundException for invalid access code', async () => {
        repository.findAccessCode = vi.fn().mockResolvedValue(null);

        await expect(
          service.findSubAccessByAccessCode('invalid'),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('findSubAccessByAccessAndSubAccessCode', () => {
      it('should return sub-access option when valid combination exists', async () => {
        const mockAccessCode = { access_code: 'road', description: 'Road' };
        const mockSubAccessCode = {
          sub_access_code: 'paved',
          description: 'Paved',
        };
        const mockCombination = {
          access_code: 'road',
          sub_access_code: 'paved',
        };

        repository.findAccessCode = vi.fn().mockResolvedValue(mockAccessCode);
        repository.findSubAccessCode = vi
          .fn()
          .mockResolvedValue(mockSubAccessCode);
        repository.findAccessSubAccessCombination = vi
          .fn()
          .mockResolvedValue(mockCombination);

        const result = await service.findSubAccessByAccessAndSubAccessCode(
          'road',
          'paved',
        );

        expect(result).toEqual({ id: 'paved', label: 'Paved' });
      });

      it('should throw NotFoundException for invalid access code', async () => {
        repository.findAccessCode = vi.fn().mockResolvedValue(null);

        await expect(
          service.findSubAccessByAccessAndSubAccessCode('invalid', 'paved'),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException for invalid sub-access code', async () => {
        const mockAccessCode = { access_code: 'road', description: 'Road' };

        repository.findAccessCode = vi.fn().mockResolvedValue(mockAccessCode);
        repository.findSubAccessCode = vi.fn().mockResolvedValue(null);

        await expect(
          service.findSubAccessByAccessAndSubAccessCode('road', 'invalid'),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException for invalid combination', async () => {
        const mockAccessCode = { access_code: 'road', description: 'Road' };
        const mockSubAccessCode = {
          sub_access_code: 'paved',
          description: 'Paved',
        };

        repository.findAccessCode = vi.fn().mockResolvedValue(mockAccessCode);
        repository.findSubAccessCode = vi
          .fn()
          .mockResolvedValue(mockSubAccessCode);
        repository.findAccessSubAccessCombination = vi
          .fn()
          .mockResolvedValue(null);

        await expect(
          service.findSubAccessByAccessAndSubAccessCode('road', 'paved'),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('createSubAccess', () => {
      it('should create new sub-access option', async () => {
        const mockAccessCode = { access_code: 'road', description: 'Road' };
        const mockCreatedSubAccess = { id: 'dirt', label: 'Dirt Road' };

        repository.findAccessCode = vi.fn().mockResolvedValue(mockAccessCode);
        repository.findSubAccessCode = vi.fn().mockResolvedValue(null);
        repository.createSubAccess = vi
          .fn()
          .mockResolvedValue(mockCreatedSubAccess);

        const result = await service.createSubAccess('road', {
          label: 'Dirt Road',
        });

        expect(result).toEqual(mockCreatedSubAccess);
        expect(repository.createSubAccess).toHaveBeenCalledWith(
          'dirt_road',
          'Dirt Road',
        );
      });

      it('should throw NotFoundException for invalid access code', async () => {
        repository.findAccessCode = vi.fn().mockResolvedValue(null);

        await expect(
          service.createSubAccess('invalid', { label: 'Test' }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw BadRequestException for existing sub-access code', async () => {
        const mockAccessCode = { access_code: 'road', description: 'Road' };
        const mockExistingSubAccess = {
          sub_access_code: 'dirt_road',
          description: 'Dirt Road',
        };

        repository.findAccessCode = vi.fn().mockResolvedValue(mockAccessCode);
        repository.findSubAccessCode = vi
          .fn()
          .mockResolvedValue(mockExistingSubAccess);

        await expect(
          service.createSubAccess('road', { label: 'Dirt Road' }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateSubAccess', () => {
      it('should update existing sub-access option', async () => {
        const mockAccessCode = { access_code: 'road', description: 'Road' };
        const mockSubAccessCode = {
          sub_access_code: 'paved',
          description: 'Paved',
        };
        const mockCombination = {
          access_code: 'road',
          sub_access_code: 'paved',
        };
        const mockUpdatedSubAccess = { id: 'paved', label: 'Paved Highway' };

        repository.findAccessCode = vi.fn().mockResolvedValue(mockAccessCode);
        repository.findSubAccessCode = vi
          .fn()
          .mockResolvedValue(mockSubAccessCode);
        repository.findAccessSubAccessCombination = vi
          .fn()
          .mockResolvedValue(mockCombination);
        repository.updateSubAccess = vi
          .fn()
          .mockResolvedValue(mockUpdatedSubAccess);

        const result = await service.updateSubAccess('road', 'paved', {
          label: 'Paved Highway',
        });

        expect(result).toEqual(mockUpdatedSubAccess);
        expect(repository.updateSubAccess).toHaveBeenCalledWith(
          'paved',
          'Paved Highway',
        );
      });
    });

    describe('removeSubAccess', () => {
      it('should remove existing sub-access option', async () => {
        const mockAccessCode = { access_code: 'road', description: 'Road' };
        const mockSubAccessCode = {
          sub_access_code: 'paved',
          description: 'Paved',
        };
        const mockCombination = {
          access_code: 'road',
          sub_access_code: 'paved',
        };

        repository.findAccessCode = vi.fn().mockResolvedValue(mockAccessCode);
        repository.findSubAccessCode = vi
          .fn()
          .mockResolvedValue(mockSubAccessCode);
        repository.findAccessSubAccessCombination = vi
          .fn()
          .mockResolvedValue(mockCombination);
        repository.removeSubAccess = vi.fn().mockResolvedValue(undefined);

        await service.removeSubAccess('road', 'paved');

        expect(repository.removeSubAccess).toHaveBeenCalledWith('paved');
      });
    });
  });

  describe('convertIdForSearch', () => {
    it('should convert string ID to number for integer fields', () => {
      const result = service['convertIdForSearch'](
        '123',
        'recreation_activity_code',
      );
      expect(result).toBe(123);
    });

    it('should return string ID for string fields', () => {
      const result = service['convertIdForSearch']('test', 'district_code');
      expect(result).toBe('test');
    });

    it('should throw BadRequestException for invalid number format', () => {
      expect(() =>
        service['convertIdForSearch']('invalid', 'recreation_activity_code'),
      ).toThrow(BadRequestException);
    });
  });

  describe('generateIdFromLabel', () => {
    it('should generate ID from label', () => {
      const result = service['generateIdFromLabel']('Mountain Biking & Hiking');
      expect(result).toBe('mountain_b');
    });

    it('should handle special characters', () => {
      const result = service['generateIdFromLabel']('Test@#$%^&*()Label');
      expect(result).toBe('testlabel');
    });
  });
});
