import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { RecreationResourceReservationInfoDto } from './dto/recreation-resource-reservation.dto';
import { UpdateRecreationResourceReservationDto } from './dto/update-recreation-resource-reservation.dto';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get reservation data for a recreation resource
   */
  async findReservationDataById(
    rec_resource_id: string,
  ): Promise<RecreationResourceReservationInfoDto | null> {
    this.logger.log(
      `Fetching reservation data for rec_resource_id: ${rec_resource_id}`,
    );

    const result =
      await this.prisma.recreation_resource_reservation_info.findUnique({
        where: { rec_resource_id },
        select: {
          rec_resource_id: true,
          reservation_website: true,
          reservation_phone_number: true,
          reservation_email: true,
        },
      });

    if (!result) {
      return null;
    }

    return {
      rec_resource_id: result.rec_resource_id,
      reservation_website: result.reservation_website ?? undefined,
      reservation_phone_number: result.reservation_phone_number ?? undefined,
      reservation_email: result.reservation_email ?? undefined,
    };
  }

  /**
   * Update or insert reservation info for the given recreation resource.
   */
  async updateReservationData(
    rec_resource_id: string,
    updateDto: UpdateRecreationResourceReservationDto,
  ): Promise<void> {
    this.logger.log(
      `Updating reservation data for rec_resource_id: ${rec_resource_id}`,
    );
    await this.prisma.recreation_resource_reservation_info.upsert({
      where: { rec_resource_id },
      update: {
        reservation_website:
          updateDto.reservation_website !== undefined
            ? updateDto.reservation_website
            : null,
        reservation_phone_number:
          updateDto.reservation_phone_number !== undefined
            ? updateDto.reservation_phone_number
            : null,
        reservation_email:
          updateDto.reservation_email !== undefined
            ? updateDto.reservation_email
            : null,
      },
      create: {
        rec_resource_id,
        reservation_website:
          updateDto.reservation_website !== undefined
            ? updateDto.reservation_website
            : null,
        reservation_phone_number:
          updateDto.reservation_phone_number !== undefined
            ? updateDto.reservation_phone_number
            : null,
        reservation_email:
          updateDto.reservation_email !== undefined
            ? updateDto.reservation_email
            : null,
      },
    });
  }
}
