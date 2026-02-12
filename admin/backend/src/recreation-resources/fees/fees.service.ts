import { PrismaService } from '@/prisma.service';
import { Prisma } from '@generated/prisma';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RecreationFeeDto } from '@/recreation-resources/fees/dto/recreation-fee.dto';
import { CreateRecreationFeeDto } from '@/recreation-resources/fees/dto/create-recreation-fee.dto';
import { UpdateRecreationFeeDto } from '@/recreation-resources/fees/dto/update-recreation-fee.dto';
import {
  formatRecreationFeeResult,
  FeeWithDescription,
} from '@/recreation-resources/fees/utils/formatRecreationFeeResult';

@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all fees for a recreation resource
   * Fetches fees from database with fee code descriptions
   * @param rec_resource_id - Recreation Resource ID
   * @returns Array of fees sorted by fee type then start date
   */
  async getAll(rec_resource_id: string): Promise<RecreationFeeDto[]> {
    this.logger.log(`Fetching fees for rec_resource_id: ${rec_resource_id}`);

    // Fetch all fees from database with fee code description
    const fees = await this.prisma.recreation_fee.findMany({
      where: {
        rec_resource_id,
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

    // Map to DTO format
    const feesDto: RecreationFeeDto[] = fees.map((fee) =>
      formatRecreationFeeResult(fee as FeeWithDescription),
    );

    return feesDto;
  }

  /**
   * Create a new fee for a recreation resource
   * @param rec_resource_id - Recreation Resource ID
   * @param createFeeDto - Fee data to create
   * @returns The created fee
   * @throws NotFoundException if resource not found
   */
  async create(
    rec_resource_id: string,
    createFeeDto: CreateRecreationFeeDto,
  ): Promise<RecreationFeeDto> {
    this.logger.log(
      `Creating fee for rec_resource_id: ${rec_resource_id}, fee_code: ${createFeeDto.recreation_fee_code}`,
    );

    // Verify resource exists
    const resource = await this.prisma.recreation_resource.findUnique({
      where: { rec_resource_id },
      select: { rec_resource_id: true },
    });

    if (!resource) {
      throw new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
    }

    const createdFee = await this.prisma.recreation_fee.create({
      data: {
        rec_resource_id,
        recreation_fee_code: createFeeDto.recreation_fee_code,
        fee_amount: createFeeDto.fee_amount ?? null,
        fee_start_date: createFeeDto.fee_start_date
          ? new Date(createFeeDto.fee_start_date)
          : null,
        fee_end_date: createFeeDto.fee_end_date
          ? new Date(createFeeDto.fee_end_date)
          : null,
        monday_ind: createFeeDto.monday_ind ?? 'N',
        tuesday_ind: createFeeDto.tuesday_ind ?? 'N',
        wednesday_ind: createFeeDto.wednesday_ind ?? 'N',
        thursday_ind: createFeeDto.thursday_ind ?? 'N',
        friday_ind: createFeeDto.friday_ind ?? 'N',
        saturday_ind: createFeeDto.saturday_ind ?? 'N',
        sunday_ind: createFeeDto.sunday_ind ?? 'N',
      },
      include: {
        with_description: {
          select: {
            description: true,
          },
        },
      },
    });

    return formatRecreationFeeResult(createdFee as FeeWithDescription);
  }

  /**
   * Update an existing fee for a recreation resource
   * @param rec_resource_id - Recreation Resource ID
   * @param fee_id - Fee ID
   * @param updateFeeDto - Fee fields to update
   * @returns The updated fee
   * @throws NotFoundException if fee not found for this resource
   */
  async update(
    rec_resource_id: string,
    fee_id: number,
    updateFeeDto: UpdateRecreationFeeDto,
  ): Promise<RecreationFeeDto> {
    this.logger.log(
      `Updating fee ${fee_id} for rec_resource_id: ${rec_resource_id}`,
    );

    const existingFee = await this.prisma.recreation_fee.findUnique({
      where: { fee_id },
      select: { fee_id: true, rec_resource_id: true },
    });

    if (!existingFee || existingFee.rec_resource_id !== rec_resource_id) {
      throw new NotFoundException(
        `Fee with ID ${fee_id} not found for recreation resource ${rec_resource_id}`,
      );
    }

    const data: Prisma.recreation_feeUpdateArgs['data'] = {};

    if (updateFeeDto.recreation_fee_code !== undefined) {
      data.recreation_fee_code = updateFeeDto.recreation_fee_code;
    }

    if (updateFeeDto.fee_amount !== undefined) {
      data.fee_amount = updateFeeDto.fee_amount ?? null;
    }

    if (updateFeeDto.fee_start_date !== undefined) {
      data.fee_start_date = updateFeeDto.fee_start_date
        ? new Date(updateFeeDto.fee_start_date)
        : null;
    }

    if (updateFeeDto.fee_end_date !== undefined) {
      data.fee_end_date = updateFeeDto.fee_end_date
        ? new Date(updateFeeDto.fee_end_date)
        : null;
    }

    const dayFields = [
      'monday_ind',
      'tuesday_ind',
      'wednesday_ind',
      'thursday_ind',
      'friday_ind',
      'saturday_ind',
      'sunday_ind',
    ] as const;

    for (const field of dayFields) {
      const value = updateFeeDto[field];
      if (value !== undefined) data[field] = value;
    }

    const updatedFee = await this.prisma.recreation_fee.update({
      where: { fee_id },
      data,
      include: {
        with_description: {
          select: {
            description: true,
          },
        },
      },
    });

    return formatRecreationFeeResult(updatedFee as FeeWithDescription);
  }
}
