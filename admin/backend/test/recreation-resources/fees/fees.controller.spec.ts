import { FeesController } from '@/recreation-resources/fees/fees.controller';
import { FeesService } from '@/recreation-resources/fees/fees.service';
import { HttpException, INestApplication } from '@nestjs/common';
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
            create: vi.fn(),
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

  describe('create', () => {
    it('should create and return a fee', async () => {
      const createFeeDto = {
        recreation_fee_code: 'D',
        fee_amount: 20,
        fee_start_date: new Date('2024-06-01'),
        fee_end_date: new Date('2024-09-30'),
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: 'Y',
        friday_ind: 'Y',
        saturday_ind: 'Y',
        sunday_ind: 'Y',
      };

      const expectedResult = {
        ...createFeeDto,
        fee_type_description: 'Day use',
      };

      vi.spyOn(feesService, 'create').mockResolvedValue(expectedResult as any);

      const response = await controller.create('REC1222', createFeeDto as any);

      expect(response).toBe(expectedResult);
      expect(feesService.create).toHaveBeenCalledWith('REC1222', createFeeDto);
    });

    it('should re-throw HttpException as-is', async () => {
      const createFeeDto = {
        recreation_fee_code: 'D',
        fee_amount: 20,
        fee_start_date: new Date('2024-06-01'),
      };

      const httpException = new HttpException('Not Found', 404);
      vi.spyOn(feesService, 'create').mockRejectedValue(httpException);

      await expect(
        controller.create('REC1222', createFeeDto as any),
      ).rejects.toThrow(httpException);
    });

    it('should wrap generic errors in 500 HttpException', async () => {
      const createFeeDto = {
        recreation_fee_code: 'D',
        fee_amount: 20,
        fee_start_date: new Date('2024-06-01'),
      };

      const genericError = new Error('Database error');
      vi.spyOn(feesService, 'create').mockRejectedValue(genericError);

      await expect(
        controller.create('REC1222', createFeeDto as any),
      ).rejects.toThrow(new HttpException('Error creating fee', 500));
    });
  });
});
