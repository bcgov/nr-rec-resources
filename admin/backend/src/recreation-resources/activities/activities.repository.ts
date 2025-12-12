import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { RecreationActivityDto } from '../dtos/recreation-resource-detail.dto';
import { syncManyToMany } from '../utils/syncManyToManyUtils';

/**
 * Repository for managing recreation resource activities.
 */
@Injectable()
export class ActivitiesRepository {
  private readonly logger = new Logger(ActivitiesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds all activities for a recreation resource.
   * @param rec_resource_id - The resource ID
   * @returns Array of activity DTOs
   */
  async findActivitiesByResourceId(
    rec_resource_id: string,
  ): Promise<RecreationActivityDto[]> {
    const activities = await this.prisma.recreation_activity.findMany({
      where: { rec_resource_id },
      select: {
        recreation_activity: {
          select: {
            recreation_activity_code: true,
            description: true,
          },
        },
      },
    });

    return activities.map((activity) => ({
      recreation_activity_code:
        activity.recreation_activity.recreation_activity_code,
      description: activity.recreation_activity.description ?? '',
    }));
  }

  /**
   * Updates activities for a recreation resource.
   * Only deletes removed activities and creates new ones,
   * leaving unchanged activities untouched to minimize history table entries.
   * @param rec_resource_id - The resource ID
   * @param activity_codes - Array of activity codes to set
   */
  async updateActivities(
    rec_resource_id: string,
    activity_codes: number[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await syncManyToMany({
        tx,
        tableName: 'recreation_activity',
        where: { rec_resource_id },
        keyField: 'recreation_activity_code',
        newKeys: activity_codes,
        createData: (activity_code) => ({
          rec_resource_id,
          recreation_activity_code: activity_code,
        }),
      });
    });
  }
}
