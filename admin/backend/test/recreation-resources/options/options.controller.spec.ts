import { OptionsController } from '@/recreation-resources/options/options.controller';
import { OptionsService } from '@/recreation-resources/options/options.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('OptionsController', () => {
  let controller: OptionsController;
  let service: OptionsService;
  let module: TestingModule;

  const mockOptionsService = {
    findAllByType: vi.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [OptionsController],
      providers: [
        {
          provide: OptionsService,
          useValue: mockOptionsService,
        },
      ],
    }).compile();

    controller = module.get<OptionsController>(OptionsController);
    service = module.get<OptionsService>(OptionsService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  describe('findAllByType', () => {
    it('should return an array of options when service resolves with values', async () => {
      const mockOptions = [
        { id: '1', label: 'Hiking' },
        { id: '2', label: 'Skiing' },
      ];
      mockOptionsService.findAllByType.mockResolvedValue(mockOptions);

      const result = await controller.findAllByType('activities');

      expect(result).toEqual(mockOptions);
      expect(service.findAllByType).toHaveBeenCalledWith('activities');
    });

    it('should return an empty array when service resolves with empty array', async () => {
      mockOptionsService.findAllByType.mockResolvedValue([]);

      const result = await controller.findAllByType('regions');

      expect(result).toEqual([]);
      expect(service.findAllByType).toHaveBeenCalledWith('regions');
    });

    it('should propagate service errors', async () => {
      const err = new BadRequestException('Invalid option type');
      mockOptionsService.findAllByType.mockRejectedValue(err);

      await expect(controller.findAllByType('invalid')).rejects.toBe(err);
      expect(service.findAllByType).toHaveBeenCalledWith('invalid');
    });
  });
});
