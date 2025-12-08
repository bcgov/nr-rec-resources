import { FeesController } from '@/recreation-resources/fees/fees.controller';
import { FeesService } from '@/recreation-resources/fees/fees.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('FeesController', () => {
  let controller: FeesController;
  let feesService: FeesService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeesController],
      providers: [
        {
          provide: FeesService,
          useValue: {
            getAll: vi.fn(),
          },
        },
      ],
    }).compile();

    feesService = module.get<FeesService>(FeesService);
    controller = module.get<FeesController>(FeesController);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return a list of fees', async () => {
      const result = [
        {
          fee_amount: 15,
          fee_start_date: new Date('2024-05-15'),
          fee_end_date: new Date('2024-10-15'),
          recreation_fee_code: 'D',
          fee_type_description: 'Day use',
          monday_ind: 'Y',
          tuesday_ind: 'Y',
          wednesday_ind: 'Y',
          thursday_ind: 'Y',
          friday_ind: 'Y',
          saturday_ind: 'Y',
          sunday_ind: 'N',
        },
      ];

      vi.spyOn(feesService, 'getAll').mockResolvedValue(result as any);

      const response = await controller.getAll('REC1222');

      expect(response).toBe(result);
      expect(response).toHaveLength(1);
      expect(feesService.getAll).toHaveBeenCalledWith('REC1222');
    });

    it('should return empty array when no fees found', async () => {
      vi.spyOn(feesService, 'getAll').mockResolvedValue([]);

      const response = await controller.getAll('REC9999');

      expect(response).toEqual([]);
      expect(feesService.getAll).toHaveBeenCalledWith('REC9999');
    });
  });
});
