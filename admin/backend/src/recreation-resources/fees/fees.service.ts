import { PrismaService } from '@/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RecreationFeeDto } from '@/recreation-resources/fees/dto/recreation-fee.dto';
import { CreateRecreationFeeDto } from '@/recreation-resources/fees/dto/create-recreation-fee.dto';
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
}
