import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BcgwController } from './bcgw.controller';
import { BcgwService } from './bcgw.service';
import { BcgwFeatureCollectionDto } from './dto/bcgw-recreation-resource.dto';

const mockFeatureCollection = (): BcgwFeatureCollectionDto => ({
  type: 'FeatureCollection',
  features: [],
  meta: { total: 0, page: 1, totalPages: 0, pageSize: 1000 },
});

describe('BcgwController', () => {
  let controller: BcgwController;
  let service: BcgwService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BcgwController],
      providers: [
        {
          provide: BcgwService,
          useValue: { findAll: vi.fn() },
        },
      ],
    }).compile();

    controller = module.get<BcgwController>(BcgwController);
    service = module.get<BcgwService>(BcgwService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecreationResources', () => {
    it('calls service.findAll with the page param and returns the result', async () => {
      const expected = mockFeatureCollection();
      vi.spyOn(service, 'findAll').mockResolvedValue(expected);

      const result = await controller.getRecreationResources(2);

      expect(service.findAll).toHaveBeenCalledWith(2);
      expect(result).toBe(expected);
    });

    it('defaults to page 1 when no param provided', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue(mockFeatureCollection());

      await controller.getRecreationResources(1);

      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });
});
