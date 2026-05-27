import { PrismaService } from '@/prisma.service';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RecreationFeeDto } from '@/recreation-resources/fees/dto/recreation-fee.dto';
import { CreateRecreationFeeDto } from '@/recreation-resources/fees/dto/create-recreation-fee.dto';
import { UpdateRecreationFeeDto } from '@/recreation-resources/fees/dto/update-recreation-fee.dto';
import {
  formatRecreationFeeResult,
  FeeWithDescription,
} from '@/recreation-resources/fees/utils/formatRecreationFeeResult';

@Injectable()
export class FeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userContext: UserContextService,
  ) {}
  private readonly logger = new Logger(FeesService.name);

  private async ensureFeeBelongsToResource(
    rec_resource_id: string,
    fee_id: number,
  ): Promise<void> {
    const existingFee = (await this.prisma.recreation_fee.findUnique({
      where: { fee_id },
      select: { fee_id: true, rec_resource_id: true, is_deleted: true },
    } as any)) as {
      fee_id: number;
      rec_resource_id: string;
      is_deleted: boolean;
    } | null;

    if (
      !existingFee ||
      existingFee.rec_resource_id !== rec_resource_id ||
      existingFee.is_deleted
    ) {
      throw new NotFoundException(
        `Fee with ID ${fee_id} not found for recreation resource ${rec_resource_id}`,
      );
    }
  }

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
        is_deleted: false,
      } as any,
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
    } as any);

    return fees.map((fee) =>
      formatRecreationFeeResult(fee as FeeWithDescription),
    );
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

    const normalizedDays = {
      monday_ind: createFeeDto.monday_ind ?? 'N',
      tuesday_ind: createFeeDto.tuesday_ind ?? 'N',
      wednesday_ind: createFeeDto.wednesday_ind ?? 'N',
      thursday_ind: createFeeDto.thursday_ind ?? 'N',
      friday_ind: createFeeDto.friday_ind ?? 'N',
      saturday_ind: createFeeDto.saturday_ind ?? 'N',
      sunday_ind: createFeeDto.sunday_ind ?? 'N',
    };
    const isRecurring = createFeeDto.recurring_ind === true;

    const existingActiveFee = createFeeDto.recreation_fee_sub_code
      ? await this.prisma.recreation_fee.findFirst({
          where: {
            rec_resource_id,
            recreation_fee_code: createFeeDto.recreation_fee_code,
            recreation_fee_sub_code: createFeeDto.recreation_fee_sub_code,
            is_deleted: false,
          },
          select: { fee_id: true },
        } as any)
      : null;

    if (existingActiveFee) {
      throw new ConflictException(
        'This fee type and sub-type already exists for this resource',
      );
    }

    const createdFee = await this.prisma.recreation_fee.create({
      data: {
        rec_resource_id,
        recreation_fee_code: createFeeDto.recreation_fee_code,
        recreation_fee_sub_code: createFeeDto.recreation_fee_sub_code ?? null,
        fee_amount: createFeeDto.fee_amount ?? null,
        fee_start_date: createFeeDto.fee_start_date
          ? new Date(createFeeDto.fee_start_date)
          : null,
        fee_end_date: createFeeDto.fee_end_date
          ? new Date(createFeeDto.fee_end_date)
          : null,
        recurring_ind: isRecurring,
        recurring_start_mmdd: isRecurring
          ? (createFeeDto.recurring_start_mmdd ?? null)
          : null,
        recurring_end_mmdd: isRecurring
          ? (createFeeDto.recurring_end_mmdd ?? null)
          : null,
        ...normalizedDays,
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
    } as any);

    await this.prisma.recreation_fee_fdl_log.create({
      data: {
        fee_id: createdFee.fee_id,
        confirmed_by: this.userContext.getCurrentUserName(),
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

    await this.ensureFeeBelongsToResource(rec_resource_id, fee_id);

    const updateData: Record<string, unknown> = {};

    if (updateFeeDto.recreation_fee_code !== undefined) {
      updateData.with_description = {
        connect: { recreation_fee_code: updateFeeDto.recreation_fee_code },
      };
    }
    if (updateFeeDto.recreation_fee_sub_code !== undefined) {
      updateData.recreation_fee_sub_code = updateFeeDto.recreation_fee_sub_code;
    }
    if (updateFeeDto.fee_amount !== undefined) {
      updateData.fee_amount = updateFeeDto.fee_amount ?? null;
    }

    const feeStartDate =
      updateFeeDto.fee_start_date !== undefined
        ? updateFeeDto.fee_start_date
          ? new Date(updateFeeDto.fee_start_date)
          : null
        : undefined;

    if (feeStartDate !== undefined) {
      updateData.fee_start_date = feeStartDate;
    }
    if (updateFeeDto.fee_end_date !== undefined) {
      updateData.fee_end_date = updateFeeDto.fee_end_date
        ? new Date(updateFeeDto.fee_end_date)
        : null;
    }

    if (updateFeeDto.recurring_ind !== undefined) {
      updateData.recurring_ind = updateFeeDto.recurring_ind;
    }

    if (updateFeeDto.recurring_start_mmdd !== undefined) {
      updateData.recurring_start_mmdd = updateFeeDto.recurring_start_mmdd;
    }

    if (updateFeeDto.recurring_end_mmdd !== undefined) {
      updateData.recurring_end_mmdd = updateFeeDto.recurring_end_mmdd;
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
      if (updateFeeDto[field] !== undefined) {
        updateData[field] = updateFeeDto[field];
      }
    }

    const existingFee = (await this.prisma.recreation_fee.findUnique({
      where: { fee_id } as any,
      select: {
        fee_id: true,
        rec_resource_id: true,
        fee_amount: true,
        recreation_fee_code: true,
        recreation_fee_sub_code: true,
      },
    } as any)) as {
      fee_id: number;
      rec_resource_id: string;
      fee_amount: number | null;
      recreation_fee_code: string;
      recreation_fee_sub_code: string | null;
    } | null;

    const effectiveFeeCode =
      updateFeeDto.recreation_fee_code ?? existingFee?.recreation_fee_code;
    const effectiveFeeSubCode =
      updateFeeDto.recreation_fee_sub_code ??
      existingFee?.recreation_fee_sub_code;

    if (effectiveFeeCode && effectiveFeeSubCode) {
      const duplicate = await this.prisma.recreation_fee.findFirst({
        where: {
          fee_id: { not: fee_id },
          rec_resource_id,
          recreation_fee_code: effectiveFeeCode,
          recreation_fee_sub_code: effectiveFeeSubCode,
          is_deleted: false,
        },
        select: { fee_id: true },
      } as any);

      if (duplicate) {
        throw new ConflictException(
          'This fee type and sub-type already exists for this resource',
        );
      }
    }

    const updatedFee = await this.prisma.recreation_fee.update({
      where: { fee_id },
      data: updateData as any,
      include: {
        with_description: { select: { description: true } },
        with_sub_description: { select: { description: true } },
      },
    } as any);

    const amountChanged =
      updateFeeDto.fee_amount !== undefined &&
      updateFeeDto.fee_amount !== existingFee?.fee_amount;

    if (amountChanged) {
      await this.prisma.recreation_fee_fdl_log.create({
        data: {
          fee_id: updatedFee.fee_id,
          confirmed_by: this.userContext.getCurrentUserName(),
        },
      });
    }

    return formatRecreationFeeResult(updatedFee as FeeWithDescription);
  }

  /**
   * Soft-delete an existing fee for a recreation resource
   * @param rec_resource_id - Recreation Resource ID
   * @param fee_id - Fee ID
   * @returns The soft-deleted fee record
   * @throws NotFoundException if fee not found for this resource
   */
  async delete(
    rec_resource_id: string,
    fee_id: number,
  ): Promise<RecreationFeeDto> {
    this.logger.log(
      `Deleting fee ${fee_id} for rec_resource_id: ${rec_resource_id}`,
    );

    await this.ensureFeeBelongsToResource(rec_resource_id, fee_id);

    const deletedFee = await this.prisma.recreation_fee.update({
      where: { fee_id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: this.userContext.getIdentityProviderPrefixedUsername(),
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
    } as any);

    this.logger.log(
      `Fee soft-deleted: fee_id=${fee_id}, rec_resource_id=${rec_resource_id}`,
    );

    return formatRecreationFeeResult(deletedFee as FeeWithDescription);
  }
}
