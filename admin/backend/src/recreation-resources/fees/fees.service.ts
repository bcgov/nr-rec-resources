import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { RecreationFeeDto } from './dto/recreation-fee.dto';

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
    const feesDto: RecreationFeeDto[] = fees.map((fee) => ({
      fee_amount: fee.fee_amount ?? undefined,
      fee_start_date: fee.fee_start_date ?? undefined,
      fee_end_date: fee.fee_end_date ?? undefined,
      recreation_fee_code: fee.recreation_fee_code,
      fee_type_description: fee.with_description?.description ?? '',
      monday_ind: fee.monday_ind ?? undefined,
      tuesday_ind: fee.tuesday_ind ?? undefined,
      wednesday_ind: fee.wednesday_ind ?? undefined,
      thursday_ind: fee.thursday_ind ?? undefined,
      friday_ind: fee.friday_ind ?? undefined,
      saturday_ind: fee.saturday_ind ?? undefined,
      sunday_ind: fee.sunday_ind ?? undefined,
    }));

    return feesDto;
  }
}
