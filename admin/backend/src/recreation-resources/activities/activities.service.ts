import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { RecreationActivityDto } from '../dtos/recreation-resource-detail.dto';
import { ActivitiesRepository } from './activities.repository';

/**
 * Service for managing recreation resource activities.
 */
@Injectable()
export class ActivitiesService {
  constructor(
    private readonly activitiesRepository: ActivitiesRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Finds all activities for a recreation resource.
   * @param rec_resource_id - The resource ID
   * @returns Array of activity DTOs
   * @throws NotFoundException if resource not found
   */
  async findAll(rec_resource_id: string): Promise<RecreationActivityDto[]> {
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

    return this.activitiesRepository.findActivitiesByResourceId(
      rec_resource_id,
    );
  }

  /**
   * Updates activities for a recreation resource.
   * @param rec_resource_id - The resource ID
   * @param activity_codes - Array of activity codes to set
   * @returns Array of updated activity DTOs
   * @throws NotFoundException if resource not found
   */
  async update(
    rec_resource_id: string,
    activity_codes: number[],
  ): Promise<RecreationActivityDto[]> {
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

    // Update activities
    await this.activitiesRepository.updateActivities(
      rec_resource_id,
      activity_codes,
    );

    // Return updated activities
    return this.activitiesRepository.findActivitiesByResourceId(
      rec_resource_id,
    );
  }
}
