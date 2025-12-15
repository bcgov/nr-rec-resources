import { FeesService } from '@/recreation-resources/fees/fees.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CreateRecreationFeeDto } from '@/recreation-resources/fees/dto/create-recreation-fee.dto';

const mockedFees = [
  {
    rec_resource_id: 'REC1222',
    fee_amount: 15,
    fee_start_date: new Date('2024-05-15'),
    fee_end_date: new Date('2024-10-15'),
    recreation_fee_code: 'D',
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'N',
    with_description: {
      description: 'Day use',
    },
  },
  {
    rec_resource_id: 'REC1222',
    fee_amount: 7,
    fee_start_date: new Date('2024-05-15'),
    fee_end_date: new Date('2024-10-15'),
    recreation_fee_code: 'T',
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'N',
    with_description: {
      description: 'Trail use',
    },
  },
];

describe('FeesService', () => {
  let prismaService: Mocked<PrismaService>;
  let service: FeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeesService,
        {
          provide: PrismaService,
          useValue: {
            recreation_fee: {
              findMany: vi.fn(),
              create: vi.fn(),
              findUnique: vi.fn(),
            },
            recreation_resource: {
              findUnique: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FeesService>(FeesService);
    prismaService = module.get(PrismaService);
  });

  describe('getAll', () => {
    it('should return all fees sorted by fee type and start date', async () => {
      vi.mocked(prismaService.recreation_fee.findMany).mockResolvedValue(
        mockedFees as any,
      );

      const result = await service.getAll('REC1222');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        fee_amount: 15,
        recreation_fee_code: 'D',
        fee_type_description: 'Day use',
        monday_ind: 'Y',
        sunday_ind: 'N',
      });
      expect(result[1]).toMatchObject({
        fee_amount: 7,
        recreation_fee_code: 'T',
        fee_type_description: 'Trail use',
      });

      expect(prismaService.recreation_fee.findMany).toHaveBeenCalledWith({
        where: {
          rec_resource_id: 'REC1222',
        },
        include: {
          with_description: {
            select: {
              description: true,
            },
          },
        },
        orderBy: [
          {
            recreation_fee_code: 'asc',
          },
          {
            fee_start_date: 'asc',
          },
        ],
      });
    });

    it('should return empty array when no fees found', async () => {
      vi.mocked(prismaService.recreation_fee.findMany).mockResolvedValue([]);

      const result = await service.getAll('REC9999');
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle null/undefined values in database fields', async () => {
      const feeWithNulls = [
        {
          rec_resource_id: 'REC0002',
          fee_amount: null,
          fee_start_date: null,
          fee_end_date: null,
          recreation_fee_code: 'C',
          monday_ind: null,
          tuesday_ind: null,
          wednesday_ind: null,
          thursday_ind: null,
          friday_ind: null,
          saturday_ind: null,
          sunday_ind: null,
          with_description: {
            description: 'Camping',
          },
        },
      ];

      vi.mocked(prismaService.recreation_fee.findMany).mockResolvedValue(
        feeWithNulls as any,
      );

      const result = await service.getAll('REC0002');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        fee_amount: undefined,
        fee_start_date: undefined,
        fee_end_date: undefined,
        recreation_fee_code: 'C',
        fee_type_description: 'Camping',
        monday_ind: undefined,
        tuesday_ind: undefined,
        wednesday_ind: undefined,
        thursday_ind: undefined,
        friday_ind: undefined,
        saturday_ind: undefined,
        sunday_ind: undefined,
      });
    });

    it('should handle missing fee description', async () => {
      const feeWithoutDescription = [
        {
          rec_resource_id: 'REC0003',
          fee_amount: 10,
          fee_start_date: new Date('2024-06-01'),
          fee_end_date: new Date('2024-09-30'),
          recreation_fee_code: 'P',
          monday_ind: 'Y',
          tuesday_ind: 'Y',
          wednesday_ind: 'Y',
          thursday_ind: 'Y',
          friday_ind: 'Y',
          saturday_ind: 'Y',
          sunday_ind: 'Y',
          with_description: null,
        },
      ];

      vi.mocked(prismaService.recreation_fee.findMany).mockResolvedValue(
        feeWithoutDescription as any,
      );

      const result = await service.getAll('REC0003');

      expect(result).toHaveLength(1);
      expect(result[0]?.fee_type_description).toBe('');
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(prismaService.recreation_fee.findMany).mockRejectedValue(
        dbError,
      );

      await expect(service.getAll('REC1222')).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should log when fetching fees', async () => {
      const loggerSpy = vi.spyOn(service['logger'], 'log');
      vi.mocked(prismaService.recreation_fee.findMany).mockResolvedValue([]);

      await service.getAll('REC1222');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Fetching fees for rec_resource_id: REC1222',
      );
    });
  });

  describe('create', () => {
    it('creates a fee successfully and maps the returned record to DTO', async () => {
      const recId = 'REC123';
      const input: CreateRecreationFeeDto = {
        recreation_fee_code: 'C',
        fee_amount: 15.5,
        fee_start_date: '2024-06-01',
        fee_end_date: '2024-09-30',
        monday_ind: 'Y',
      };

      vi.mocked(
        prismaService.recreation_resource!.findUnique as any,
      ).mockResolvedValue({
        rec_resource_id: recId,
      });

      const createdRecord = {
        rec_resource_id: recId,
        recreation_fee_code: 'C',
        fee_amount: 15.5,
        fee_start_date: new Date('2024-06-01'),
        fee_end_date: new Date('2024-09-30'),
        monday_ind: 'Y',
        tuesday_ind: null,
        wednesday_ind: null,
        thursday_ind: null,
        friday_ind: null,
        saturday_ind: null,
        sunday_ind: null,
        with_description: { description: 'Camping' },
      };

      vi.mocked(prismaService.recreation_fee!.create as any).mockResolvedValue(
        createdRecord,
      );

      const result = await service.create(recId, input);

      expect(result.recreation_fee_code).toBe('C');
      expect(result.fee_amount).toBe(15.5);
      expect(result.fee_type_description).toBe('Camping');
      expect(result.fee_start_date).toEqual(createdRecord.fee_start_date);
      expect(result.fee_end_date).toEqual(createdRecord.fee_end_date);
      expect(result.monday_ind).toBe('Y');

      const createCallArg = (prismaService.recreation_fee!.create as any).mock
        .calls[0][0];
      expect(createCallArg).toBeTruthy();
      expect(createCallArg.data.fee_start_date).toBeInstanceOf(Date);
      expect(createCallArg.data.fee_start_date).toEqual(new Date('2024-06-01'));
      expect(createCallArg.data.fee_end_date).toBeInstanceOf(Date);
      expect(createCallArg.data.fee_end_date).toEqual(new Date('2024-09-30'));
      expect(createCallArg.data.recreation_fee_code).toBe('C');
      expect(createCallArg.data.rec_resource_id).toBe(recId);
    });

    it('throws NotFoundException when the recreation resource does not exist', async () => {
      const recId = 'REC_NOT_FOUND';
      const input: CreateRecreationFeeDto = {
        recreation_fee_code: 'D',
      };

      vi.mocked(
        prismaService.recreation_resource!.findUnique as any,
      ).mockResolvedValue(null);

      await expect(service.create(recId, input)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prismaService.recreation_fee!.create).not.toHaveBeenCalled();
    });
  });
});
