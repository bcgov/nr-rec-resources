import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { RecreationFeatureDto } from './dtos/recreation-feature.dto';
import { FeaturesRepository } from './features.repository';

/**
 * Service for managing recreation resource features.
 */
@Injectable()
export class FeaturesService {
  constructor(
    private readonly featuresRepository: FeaturesRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Finds all features for a recreation resource.
   * @param rec_resource_id - The resource ID
   * @returns Array of feature DTOs
   * @throws NotFoundException if resource not found
   */
  async findAll(rec_resource_id: string): Promise<RecreationFeatureDto[]> {
    const resource = await this.prisma.recreation_resource.findUnique({
      where: { rec_resource_id },
      select: { rec_resource_id: true },
    });

    if (!resource) {
      throw new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
    }

    return this.featuresRepository.findFeaturesByResourceId(rec_resource_id);
  }

  /**
   * Updates features for a recreation resource.
   * @param rec_resource_id - The resource ID
   * @param feature_codes - Array of feature codes to set
   * @returns Array of updated feature DTOs
   * @throws NotFoundException if resource not found
   */
  async update(
    rec_resource_id: string,
    feature_codes: string[],
  ): Promise<RecreationFeatureDto[]> {
    const resource = await this.prisma.recreation_resource.findUnique({
      where: { rec_resource_id },
      select: { rec_resource_id: true },
    });

    if (!resource) {
      throw new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
    }

    await this.featuresRepository.updateFeatures(
      rec_resource_id,
      feature_codes,
    );

    return this.featuresRepository.findFeaturesByResourceId(rec_resource_id);
  }
}
