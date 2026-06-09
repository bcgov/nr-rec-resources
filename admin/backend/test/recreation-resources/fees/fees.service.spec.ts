import { FeesService } from '@/recreation-resources/fees/fees.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateRecreationFeeDto } from '@/recreation-resources/fees/dto/create-recreation-fee.dto';
import { UserContextService } from '@/common/modules/user-context/user-context.service';

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
  let userContextService: Mocked<UserContextService>;
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
              findFirst: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
            },
            recreation_resource: {
              findUnique: vi.fn(),
            },
            recreation_fee_fdl_log: {
              create: vi.fn().mockResolvedValue({}),
            },
          },
        },
        {
          provide: UserContextService,
          useValue: {
            getCurrentUserName: vi.fn().mockReturnValue('testuser'),
            getIdentityProviderPrefixedUsername: vi
              .fn()
              .mockReturnValue('IDIR\\test.user'),
          },
        },
      ],
    }).compile();

    service = module.get<FeesService>(FeesService);
    prismaService = module.get(PrismaService);
    userContextService = module.get(UserContextService);
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
          is_deleted: false,
        },
        include: {
          with_description: {
            select: {
              description: true,
            },
          },
          with_sub_description: {
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
            recreation_fee_sub_code: 'asc',
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

    it('should return fees with recurring indicator and dates', async () => {
      const feesWithRecurring = [
        {
          rec_resource_id: 'REC1222',
          fee_amount: 20,
          fee_start_date: null,
          fee_end_date: null,
          recreation_fee_code: 'C',
          recurring_ind: true,
          recurring_start_mmdd: '06-01',
          recurring_end_mmdd: '08-31',
          monday_ind: 'Y',
          tuesday_ind: 'Y',
          wednesday_ind: 'Y',
          thursday_ind: 'Y',
          friday_ind: 'Y',
          saturday_ind: 'Y',
          sunday_ind: 'N',
          with_description: {
            description: 'Camping',
          },
        },
        {
          rec_resource_id: 'REC1222',
          fee_amount: 15,
          fee_start_date: new Date('2024-06-01'),
          fee_end_date: new Date('2024-09-30'),
          recreation_fee_code: 'D',
          recurring_ind: false,
          recurring_start_mmdd: null,
          recurring_end_mmdd: null,
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
      ];

      vi.mocked(prismaService.recreation_fee.findMany).mockResolvedValue(
        feesWithRecurring as any,
      );

      const result = await service.getAll('REC1222');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        fee_amount: 20,
        recreation_fee_code: 'C',
        recurring_ind: true,
        recurring_start_mmdd: '06-01',
        recurring_end_mmdd: '08-31',
        fee_type_description: 'Camping',
      });
      expect(result[1]).toMatchObject({
        fee_amount: 15,
        recreation_fee_code: 'D',
        recurring_ind: false,
        fee_type_description: 'Day use',
      });
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
        fee_id: 100,
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
      expect(prismaService.recreation_fee.findFirst).not.toHaveBeenCalled();
    });

    it('throws ConflictException when an active duplicate fee exists', async () => {
      const recId = 'REC123';
      const input: CreateRecreationFeeDto = {
        recreation_fee_code: 'C',
        recreation_fee_sub_code: 'ST',
        monday_ind: 'Y',
      };

      vi.mocked(
        prismaService.recreation_resource!.findUnique as any,
      ).mockResolvedValue({
        rec_resource_id: recId,
      });
      vi.mocked(
        prismaService.recreation_fee.findFirst as any,
      ).mockResolvedValue({
        fee_id: 10,
      });

      await expect(service.create(recId, input)).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(prismaService.recreation_fee.findFirst).toHaveBeenCalledWith({
        where: {
          rec_resource_id: recId,
          recreation_fee_code: 'C',
          recreation_fee_sub_code: 'ST',
          is_deleted: false,
        },
        select: { fee_id: true },
      });
      expect(prismaService.recreation_fee.create).not.toHaveBeenCalled();
    });

    it('creates fee when only deleted duplicate exists', async () => {
      const recId = 'REC123';
      const input: CreateRecreationFeeDto = {
        recreation_fee_code: 'C',
        recreation_fee_sub_code: 'ST',
        monday_ind: 'Y',
      };

      vi.mocked(
        prismaService.recreation_resource!.findUnique as any,
      ).mockResolvedValue({
        rec_resource_id: recId,
      });
      vi.mocked(
        prismaService.recreation_fee.findFirst as any,
      ).mockResolvedValue(null);
      vi.mocked(prismaService.recreation_fee.create as any).mockResolvedValue({
        rec_resource_id: recId,
        recreation_fee_code: 'C',
        fee_amount: null,
        fee_start_date: null,
        fee_end_date: null,
        monday_ind: 'Y',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
        with_description: { description: 'Camping' },
      });

      const result = await service.create(recId, input);

      expect(result.recreation_fee_code).toBe('C');
      expect(prismaService.recreation_fee.findFirst).toHaveBeenCalledWith({
        where: {
          rec_resource_id: recId,
          recreation_fee_code: 'C',
          recreation_fee_sub_code: 'ST',
          is_deleted: false,
        },
        select: { fee_id: true },
      });
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

    it('creates a recurring fee successfully with month-day range', async () => {
      const recId = 'REC456';
      const input: CreateRecreationFeeDto = {
        recreation_fee_code: 'C',
        fee_amount: 20,
        recurring_ind: true,
        recurring_start_mmdd: '06-01',
        recurring_end_mmdd: '08-31',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
      };

      vi.mocked(
        prismaService.recreation_resource!.findUnique as any,
      ).mockResolvedValue({
        rec_resource_id: recId,
      });

      const createdRecord = {
        fee_id: 456,
        rec_resource_id: recId,
        recreation_fee_code: 'C',
        fee_amount: 20,
        fee_start_date: null,
        fee_end_date: null,
        recurring_ind: true,
        recurring_start_mmdd: '06-01',
        recurring_end_mmdd: '08-31',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
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

      expect(result.recurring_ind).toBe(true);
      expect(result.recurring_start_mmdd).toBe('06-01');
      expect(result.recurring_end_mmdd).toBe('08-31');

      const createCallArg = (prismaService.recreation_fee!.create as any).mock
        .calls[0][0];
      expect(createCallArg.data.recurring_ind).toBe(true);
      expect(createCallArg.data.recurring_start_mmdd).toBe('06-01');
      expect(createCallArg.data.recurring_end_mmdd).toBe('08-31');
    });

    it('creates a non-recurring fee with recurring fields set to null', async () => {
      const recId = 'REC789';
      const input: CreateRecreationFeeDto = {
        recreation_fee_code: 'D',
        fee_amount: 15,
        recurring_ind: false,
        recurring_start_mmdd: '06-01',
        recurring_end_mmdd: '08-31',
      };

      vi.mocked(
        prismaService.recreation_resource!.findUnique as any,
      ).mockResolvedValue({
        rec_resource_id: recId,
      });

      const createdRecord = {
        fee_id: 789,
        rec_resource_id: recId,
        recreation_fee_code: 'D',
        fee_amount: 15,
        fee_start_date: null,
        fee_end_date: null,
        recurring_ind: false,
        recurring_start_mmdd: null,
        recurring_end_mmdd: null,
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
        with_description: { description: 'Day use' },
      };

      vi.mocked(prismaService.recreation_fee!.create as any).mockResolvedValue(
        createdRecord,
      );

      const result = await service.create(recId, input);

      expect(result.recurring_ind).toBe(false);
      expect(result.recurring_start_mmdd).toBeUndefined();
      expect(result.recurring_end_mmdd).toBeUndefined();

      const createCallArg = (prismaService.recreation_fee!.create as any).mock
        .calls[0][0];
      expect(createCallArg.data.recurring_ind).toBe(false);
      expect(createCallArg.data.recurring_start_mmdd).toBeNull();
      expect(createCallArg.data.recurring_end_mmdd).toBeNull();
    });

    it('creates a recurring fee with undefined recurring dates when recurring_ind is true', async () => {
      const recId = 'REC999';
      const input: CreateRecreationFeeDto = {
        recreation_fee_code: 'P',
        fee_amount: 10,
        recurring_ind: true,
      };

      vi.mocked(
        prismaService.recreation_resource!.findUnique as any,
      ).mockResolvedValue({
        rec_resource_id: recId,
      });

      const createdRecord = {
        fee_id: 999,
        rec_resource_id: recId,
        recreation_fee_code: 'P',
        fee_amount: 10,
        fee_start_date: null,
        fee_end_date: null,
        recurring_ind: true,
        recurring_start_mmdd: null,
        recurring_end_mmdd: null,
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
        with_description: { description: 'Parking' },
      };

      vi.mocked(prismaService.recreation_fee!.create as any).mockResolvedValue(
        createdRecord,
      );

      const result = await service.create(recId, input);

      expect(result.recurring_ind).toBe(true);
      expect(result.recurring_start_mmdd).toBeUndefined();
      expect(result.recurring_end_mmdd).toBeUndefined();

      const createCallArg = (prismaService.recreation_fee!.create as any).mock
        .calls[0][0];
      expect(createCallArg.data.recurring_ind).toBe(true);
      expect(createCallArg.data.recurring_start_mmdd).toBeNull();
      expect(createCallArg.data.recurring_end_mmdd).toBeNull();
    });
  });

  describe('update', () => {
    it('throws NotFoundException when fee does not exist', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue(
        null,
      );

      await expect(
        service.update('REC1222', 123, { fee_amount: 25 } as any),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaService.recreation_fee.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when fee belongs to a different resource', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
        fee_id: 123,
        rec_resource_id: 'REC_DIFFERENT',
      } as any);

      await expect(
        service.update('REC1222', 123, { fee_amount: 25 } as any),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaService.recreation_fee.update).not.toHaveBeenCalled();
    });

    it('maps provided fields only, converts date strings to Date, and preserves null-clearing', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
        fee_id: 123,
        rec_resource_id: 'REC1222',
        fee_amount: 20,
      } as any);

      const updateDto = {
        recreation_fee_code: 'D',
        fee_amount: null,
        fee_start_date: '2024-06-01',
        fee_end_date: null,
        monday_ind: 'Y',
        wednesday_ind: 'N',
      };

      const updatedRecord = {
        fee_id: 123,
        rec_resource_id: 'REC1222',
        recreation_fee_code: 'D',
        fee_amount: null,
        fee_start_date: new Date('2024-06-01'),
        fee_end_date: null,
        monday_ind: 'Y',
        wednesday_ind: 'N',
        tuesday_ind: 'Y',
        with_description: { description: 'Day use' },
      };

      vi.mocked(prismaService.recreation_fee.update).mockResolvedValue(
        updatedRecord as any,
      );

      const result = await service.update('REC1222', 123, updateDto as any);

      expect(result).toMatchObject({
        fee_id: 123,
        recreation_fee_code: 'D',
        fee_amount: undefined,
        fee_type_description: 'Day use',
        monday_ind: 'Y',
        wednesday_ind: 'N',
      });
      expect(result.fee_start_date).toEqual(new Date('2024-06-01'));
      expect(result.fee_end_date).toBeUndefined();

      const updateCallArg = (prismaService.recreation_fee.update as any).mock
        .calls[0][0];
      expect(updateCallArg.where).toEqual({ fee_id: 123 });

      expect(updateCallArg.data).toMatchObject({
        with_description: {
          connect: {
            recreation_fee_code: 'D',
          },
        },
        fee_amount: null,
        fee_start_date: new Date('2024-06-01'),
        fee_end_date: null,
        monday_ind: 'Y',
        wednesday_ind: 'N',
      });
      expect('tuesday_ind' in updateCallArg.data).toBe(false);
      expect('thursday_ind' in updateCallArg.data).toBe(false);
      expect('friday_ind' in updateCallArg.data).toBe(false);
      expect('saturday_ind' in updateCallArg.data).toBe(false);
      expect('sunday_ind' in updateCallArg.data).toBe(false);
    });

    it('updates recurring fee fields when provided', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
        fee_id: 456,
        rec_resource_id: 'REC1222',
      } as any);

      const updateDto = {
        recurring_ind: true,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: '09-15',
      };

      const updatedRecord = {
        fee_id: 456,
        rec_resource_id: 'REC1222',
        recreation_fee_code: 'C',
        fee_amount: 20,
        fee_start_date: null,
        fee_end_date: null,
        recurring_ind: true,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: '09-15',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: 'Y',
        friday_ind: 'Y',
        saturday_ind: 'Y',
        sunday_ind: 'N',
        with_description: { description: 'Camping' },
      };

      vi.mocked(prismaService.recreation_fee.update).mockResolvedValue(
        updatedRecord as any,
      );

      const result = await service.update('REC1222', 456, updateDto as any);

      expect(result.recurring_ind).toBe(true);
      expect(result.recurring_start_mmdd).toBe('06-15');
      expect(result.recurring_end_mmdd).toBe('09-15');

      const updateCallArg = (prismaService.recreation_fee.update as any).mock
        .calls[0][0];
      expect(updateCallArg.data.recurring_ind).toBe(true);
      expect(updateCallArg.data.recurring_start_mmdd).toBe('06-15');
      expect(updateCallArg.data.recurring_end_mmdd).toBe('09-15');
    });

    it('clears recurring dates when updating recurring_ind to false', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
        fee_id: 789,
        rec_resource_id: 'REC1222',
      } as any);

      const updateDto = {
        recurring_ind: false,
        recurring_start_mmdd: '05-01',
        recurring_end_mmdd: '07-31',
      };

      const updatedRecord = {
        fee_id: 789,
        rec_resource_id: 'REC1222',
        recreation_fee_code: 'D',
        fee_amount: 15,
        fee_start_date: null,
        fee_end_date: null,
        recurring_ind: false,
        recurring_start_mmdd: null,
        recurring_end_mmdd: null,
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: 'Y',
        friday_ind: 'Y',
        saturday_ind: 'Y',
        sunday_ind: 'N',
        with_description: { description: 'Day use' },
      };

      vi.mocked(prismaService.recreation_fee.update).mockResolvedValue(
        updatedRecord as any,
      );

      const result = await service.update('REC1222', 789, updateDto as any);

      expect(result.recurring_ind).toBe(false);

      const updateCallArg = (prismaService.recreation_fee.update as any).mock
        .calls[0][0];
      expect(updateCallArg.data.recurring_ind).toBe(false);
      expect(updateCallArg.data.recurring_start_mmdd).toBe('05-01');
      expect(updateCallArg.data.recurring_end_mmdd).toBe('07-31');
    });

    it('updates only recurring_start_mmdd without affecting other recurring fields', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
        fee_id: 111,
        rec_resource_id: 'REC1222',
      } as any);

      const updateDto = {
        recurring_start_mmdd: '07-01',
      };

      const updatedRecord = {
        fee_id: 111,
        rec_resource_id: 'REC1222',
        recreation_fee_code: 'C',
        fee_amount: 25,
        fee_start_date: null,
        fee_end_date: null,
        recurring_ind: true,
        recurring_start_mmdd: '07-01',
        recurring_end_mmdd: '09-30',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: 'Y',
        friday_ind: 'Y',
        saturday_ind: 'Y',
        sunday_ind: 'N',
        with_description: { description: 'Camping' },
      };

      vi.mocked(prismaService.recreation_fee.update).mockResolvedValue(
        updatedRecord as any,
      );

      const result = await service.update('REC1222', 111, updateDto as any);

      expect(result.recurring_start_mmdd).toBe('07-01');
      expect(result.recurring_end_mmdd).toBe('09-30');

      const updateCallArg = (prismaService.recreation_fee.update as any).mock
        .calls[0][0];
      expect(updateCallArg.data.recurring_start_mmdd).toBe('07-01');
      expect('recurring_end_mmdd' in updateCallArg.data).toBe(false);
      expect('recurring_ind' in updateCallArg.data).toBe(false);
    });

    it('updates recurring fee with additional fields like fee_amount and day indicators', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
        fee_id: 222,
        rec_resource_id: 'REC1222',
        fee_amount: 20,
      } as any);

      const updateDto = {
        fee_amount: 30,
        recurring_ind: true,
        recurring_start_mmdd: '05-15',
        recurring_end_mmdd: '10-15',
        friday_ind: 'Y',
        saturday_ind: 'Y',
        sunday_ind: 'Y',
      };

      const updatedRecord = {
        fee_id: 222,
        rec_resource_id: 'REC1222',
        recreation_fee_code: 'C',
        fee_amount: 30,
        fee_start_date: null,
        fee_end_date: null,
        recurring_ind: true,
        recurring_start_mmdd: '05-15',
        recurring_end_mmdd: '10-15',
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'Y',
        saturday_ind: 'Y',
        sunday_ind: 'Y',
        with_description: { description: 'Camping' },
      };

      vi.mocked(prismaService.recreation_fee.update).mockResolvedValue(
        updatedRecord as any,
      );

      const result = await service.update('REC1222', 222, updateDto as any);

      expect(result.fee_amount).toBe(30);
      expect(result.recurring_ind).toBe(true);
      expect(result.recurring_start_mmdd).toBe('05-15');
      expect(result.recurring_end_mmdd).toBe('10-15');
      expect(result.friday_ind).toBe('Y');
      expect(result.saturday_ind).toBe('Y');
      expect(result.sunday_ind).toBe('Y');

      const updateCallArg = (prismaService.recreation_fee.update as any).mock
        .calls[0][0];
      expect(updateCallArg.data.fee_amount).toBe(30);
      expect(updateCallArg.data.recurring_ind).toBe(true);
      expect(updateCallArg.data.recurring_start_mmdd).toBe('05-15');
      expect(updateCallArg.data.recurring_end_mmdd).toBe('10-15');
      expect(updateCallArg.data.friday_ind).toBe('Y');
      expect(updateCallArg.data.saturday_ind).toBe('Y');
      expect(updateCallArg.data.sunday_ind).toBe('Y');
    });

    it('throws ConflictException when update would duplicate an active fee subtype', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValueOnce({
        fee_id: 333,
        rec_resource_id: 'REC1222',
        fee_amount: 10,
        recreation_fee_code: 'C',
        recreation_fee_sub_code: 'DAY',
      } as any);

      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValueOnce({
        fee_id: 333,
        rec_resource_id: 'REC1222',
        fee_amount: 10,
        recreation_fee_code: 'C',
        recreation_fee_sub_code: 'DAY',
      } as any);

      vi.mocked(prismaService.recreation_fee.findFirst).mockResolvedValue({
        fee_id: 999,
      } as any);

      await expect(
        service.update('REC1222', 333, {
          recreation_fee_sub_code: 'DAY',
        } as any),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(prismaService.recreation_fee.findFirst).toHaveBeenCalledWith({
        where: {
          fee_id: { not: 333 },
          rec_resource_id: 'REC1222',
          recreation_fee_code: 'C',
          recreation_fee_sub_code: 'DAY',
          is_deleted: false,
        },
        select: { fee_id: true },
      });
      expect(prismaService.recreation_fee.update).not.toHaveBeenCalled();
    });

    it('updates when subtype duplicate check finds no conflict', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValueOnce({
        fee_id: 334,
        rec_resource_id: 'REC1222',
        fee_amount: 10,
        recreation_fee_code: 'C',
        recreation_fee_sub_code: 'DAY',
      } as any);

      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValueOnce({
        fee_id: 334,
        rec_resource_id: 'REC1222',
        fee_amount: 10,
        recreation_fee_code: 'C',
        recreation_fee_sub_code: 'DAY',
      } as any);

      vi.mocked(prismaService.recreation_fee.findFirst).mockResolvedValue(null);

      vi.mocked(prismaService.recreation_fee.update).mockResolvedValue({
        fee_id: 334,
        rec_resource_id: 'REC1222',
        recreation_fee_code: 'C',
        recreation_fee_sub_code: 'DAY',
        fee_amount: 10,
        fee_start_date: null,
        fee_end_date: null,
        recurring_ind: false,
        recurring_start_mmdd: null,
        recurring_end_mmdd: null,
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
        with_description: { description: 'Camping' },
        with_sub_description: { description: 'Day' },
      } as any);

      const result = await service.update('REC1222', 334, {
        recreation_fee_sub_code: 'DAY',
      } as any);

      expect(prismaService.recreation_fee.findFirst).toHaveBeenCalledWith({
        where: {
          fee_id: { not: 334 },
          rec_resource_id: 'REC1222',
          recreation_fee_code: 'C',
          recreation_fee_sub_code: 'DAY',
          is_deleted: false,
        },
        select: { fee_id: true },
      });
      expect(result.fee_sub_type_description).toBe('Day');
    });
  });

  describe('delete', () => {
    it('throws NotFoundException when fee does not exist', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue(
        null,
      );

      await expect(service.delete('REC1222', 123)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prismaService.recreation_fee.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when fee is already deleted', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
        fee_id: 123,
        rec_resource_id: 'REC1222',
        is_deleted: true,
      } as any);

      await expect(service.delete('REC1222', 123)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prismaService.recreation_fee.update).not.toHaveBeenCalled();
    });

    it('soft-deletes the fee and returns mapped dto', async () => {
      vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
        fee_id: 123,
        rec_resource_id: 'REC1222',
        is_deleted: false,
      } as any);

      vi.mocked(prismaService.recreation_fee.update).mockResolvedValue({
        fee_id: 123,
        rec_resource_id: 'REC1222',
        recreation_fee_code: 'D',
        fee_amount: 25,
        fee_start_date: null,
        fee_end_date: null,
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: 'Y',
        friday_ind: 'Y',
        saturday_ind: 'Y',
        sunday_ind: 'Y',
        with_description: { description: 'Day use' },
      } as any);

      const result = await service.delete('REC1222', 123);

      expect(prismaService.recreation_fee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { fee_id: 123 },
          data: expect.objectContaining({
            is_deleted: true,
            deleted_by: 'IDIR\\test.user',
            deleted_at: expect.any(Date),
          }),
        }),
      );
      expect(
        userContextService.getIdentityProviderPrefixedUsername,
      ).toHaveBeenCalled();
      expect(result).toMatchObject({
        fee_id: 123,
        recreation_fee_code: 'D',
        fee_type_description: 'Day use',
      });
    });
  });

  describe('FDL log behaviour', () => {
    const baseCreatedRecord = {
      fee_id: 101,
      rec_resource_id: 'REC_FDL',
      recreation_fee_code: 'D',
      fee_amount: 15,
      fee_start_date: null,
      fee_end_date: null,
      recurring_ind: false,
      recurring_start_mmdd: null,
      recurring_end_mmdd: null,
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'N',
      sunday_ind: 'N',
      with_description: { description: 'Day use' },
    };

    const baseUpdatedRecord = {
      ...baseCreatedRecord,
      fee_id: 200,
    };

    describe('create', () => {
      it('always writes an FDL log entry recording the confirming user', async () => {
        vi.mocked(
          prismaService.recreation_resource!.findUnique as any,
        ).mockResolvedValue({ rec_resource_id: 'REC_FDL' });

        vi.mocked(
          prismaService.recreation_fee!.create as any,
        ).mockResolvedValue(baseCreatedRecord);

        await service.create('REC_FDL', {
          recreation_fee_code: 'D',
          fee_amount: 15,
        });

        expect(
          prismaService.recreation_fee_fdl_log!.create,
        ).toHaveBeenCalledWith({
          data: {
            fee_id: 101,
            confirmed_by: 'testuser',
          },
        });
      });
    });

    describe('update', () => {
      it('writes FDL log when fee_amount changes', async () => {
        vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
          fee_id: 200,
          rec_resource_id: 'REC_FDL',
          fee_amount: 15,
        } as any);

        vi.mocked(prismaService.recreation_fee.update).mockResolvedValue(
          baseUpdatedRecord as any,
        );

        await service.update('REC_FDL', 200, { fee_amount: 25 } as any);

        expect(
          prismaService.recreation_fee_fdl_log!.create,
        ).toHaveBeenCalledWith({
          data: {
            fee_id: 200,
            confirmed_by: 'testuser',
          },
        });
      });

      it('writes FDL log when fee_amount is cleared to null', async () => {
        vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
          fee_id: 200,
          rec_resource_id: 'REC_FDL',
          fee_amount: 15,
        } as any);

        vi.mocked(prismaService.recreation_fee.update).mockResolvedValue({
          ...baseUpdatedRecord,
          fee_amount: null,
        } as any);

        await service.update('REC_FDL', 200, { fee_amount: null } as any);

        expect(
          prismaService.recreation_fee_fdl_log!.create,
        ).toHaveBeenCalledOnce();
      });

      it('does not write FDL log when fee_amount is unchanged', async () => {
        vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
          fee_id: 200,
          rec_resource_id: 'REC_FDL',
          fee_amount: 15,
        } as any);

        vi.mocked(prismaService.recreation_fee.update).mockResolvedValue(
          baseUpdatedRecord as any,
        );

        await service.update('REC_FDL', 200, { fee_amount: 15 } as any);

        expect(
          prismaService.recreation_fee_fdl_log!.create,
        ).not.toHaveBeenCalled();
      });

      it('does not write FDL log when fee_amount is not part of the update', async () => {
        vi.mocked(prismaService.recreation_fee.findUnique).mockResolvedValue({
          fee_id: 200,
          rec_resource_id: 'REC_FDL',
          fee_amount: 15,
        } as any);

        vi.mocked(prismaService.recreation_fee.update).mockResolvedValue(
          baseUpdatedRecord as any,
        );

        await service.update('REC_FDL', 200, {
          monday_ind: 'N',
          saturday_ind: 'Y',
        } as any);

        expect(
          prismaService.recreation_fee_fdl_log!.create,
        ).not.toHaveBeenCalled();
      });
    });
  });
});
